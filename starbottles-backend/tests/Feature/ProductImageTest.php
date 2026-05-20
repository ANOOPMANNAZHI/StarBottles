<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use App\Services\ImageProcessingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Tests\Traits\SeedsRolesAndPermissions;

class ProductImageTest extends TestCase
{
    use RefreshDatabase, SeedsRolesAndPermissions;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->seedRolesAndPermissions();
    }

    private function makeProduct(array $attrs = []): Product
    {
        $category = ProductCategory::create([
            'name' => 'Bottles',
            'slug' => 'bottles-' . uniqid(),
        ]);

        return Product::create(array_merge([
            'erp_id'      => 'ERP001',
            'title'       => 'Test Bottle',
            'category_id' => $category->id,
            'is_active'   => true,
            'is_featured' => false,
            'is_hidden'   => false,
        ], $attrs));
    }

    private function adminUser(): User
    {
        $user = User::create([
            'name'      => 'Admin',
            'email'     => 'admin@test.com',
            'password'  => bcrypt('password'),
            'role'      => 'admin',
            'is_active' => true,
        ]);
        $user->assignRole('admin');
        return $user;
    }

    private function seedProductImages(string $erpId, int $count = 2): void
    {
        $service = app(ImageProcessingService::class);
        for ($i = 1; $i <= $count; $i++) {
            $file = UploadedFile::fake()->image("test{$i}.jpg", 800, 600);
            $service->processAndStore($file->getPathname(), $erpId, $i);
        }
    }

    // ── ImageProcessingService Tests ────────────────────────────────────

    public function test_process_and_store_creates_all_variants(): void
    {
        $file = UploadedFile::fake()->image('test.jpg', 800, 600);
        $service = app(ImageProcessingService::class);

        $paths = $service->processAndStore($file->getPathname(), 'ERP001', 1);

        $this->assertArrayHasKey('thumb', $paths);
        $this->assertArrayHasKey('card', $paths);
        $this->assertArrayHasKey('detail', $paths);
        $this->assertArrayHasKey('original', $paths);

        foreach ($paths as $path) {
            Storage::disk('public')->assertExists($path);
        }
    }

    public function test_get_product_images_returns_structured_data(): void
    {
        $this->seedProductImages('ERP001', 2);

        $service = app(ImageProcessingService::class);
        $images = $service->getProductImages('ERP001');

        $this->assertCount(2, $images);
        $this->assertArrayHasKey('thumb', $images[0]);
        $this->assertArrayHasKey('card', $images[0]);
        $this->assertArrayHasKey('detail', $images[0]);
        $this->assertArrayHasKey('original', $images[0]);
    }

    public function test_get_product_images_returns_empty_for_missing_product(): void
    {
        $service = app(ImageProcessingService::class);
        $images = $service->getProductImages('NONEXISTENT');

        $this->assertEmpty($images);
    }

    public function test_delete_product_images_removes_all(): void
    {
        $this->seedProductImages('ERP001', 2);
        $service = app(ImageProcessingService::class);

        $this->assertNotEmpty($service->getProductImages('ERP001'));

        $service->deleteProductImages('ERP001');

        $this->assertEmpty($service->getProductImages('ERP001'));
    }

    public function test_delete_image_by_index_removes_specific_image(): void
    {
        $this->seedProductImages('ERP001', 2);
        $service = app(ImageProcessingService::class);

        $service->deleteImageByIndex('ERP001', 1);

        $images = $service->getProductImages('ERP001');
        $this->assertCount(1, $images);
    }

    // ── Product Model Accessor Tests ────────────────────────────────────

    public function test_product_images_accessor_returns_filesystem_images(): void
    {
        $product = $this->makeProduct(['erp_id' => 'ERP001']);
        $this->seedProductImages('ERP001', 2);

        $images = $product->images;

        $this->assertCount(2, $images);
        $this->assertArrayHasKey('card', $images[0]);
    }

    public function test_product_first_image_returns_card_url(): void
    {
        $product = $this->makeProduct(['erp_id' => 'ERP001']);
        $this->seedProductImages('ERP001', 1);

        $firstImage = $product->first_image;

        $this->assertNotNull($firstImage);
        $this->assertStringContainsString('card_1.webp', $firstImage);
    }

    public function test_product_first_image_returns_null_when_no_images(): void
    {
        $product = $this->makeProduct(['erp_id' => 'ERP002']);

        $this->assertNull($product->first_image);
    }

    // ── Import Command Tests ────────────────────────────────────────────

    public function test_import_command_dry_run(): void
    {
        $this->makeProduct(['erp_id' => 'ERP001']);

        $sourceDir = storage_path('app/test-import');
        $erpDir = $sourceDir . '/ERP001';
        @mkdir($erpDir, 0755, true);

        $image = UploadedFile::fake()->image('1.jpg', 400, 300);
        copy($image->getPathname(), $erpDir . '/1.jpg');

        $this->artisan('products:import-images', [
            'path'      => $sourceDir,
            '--dry-run' => true,
        ])->assertSuccessful();

        // Nothing should be stored in dry-run
        $this->assertEmpty(Storage::disk('public')->files('products/ERP001'));

        // Cleanup
        @unlink($erpDir . '/1.jpg');
        @rmdir($erpDir);
        @rmdir($sourceDir);
    }

    public function test_import_command_processes_images(): void
    {
        $this->makeProduct(['erp_id' => 'ERP001']);

        $sourceDir = storage_path('app/test-import');
        $erpDir = $sourceDir . '/ERP001';
        @mkdir($erpDir, 0755, true);

        $image = UploadedFile::fake()->image('1.jpg', 400, 300);
        copy($image->getPathname(), $erpDir . '/1.jpg');

        $this->artisan('products:import-images', [
            'path' => $sourceDir,
        ])->assertSuccessful();

        Storage::disk('public')->assertExists('products/ERP001/thumb_1.webp');
        Storage::disk('public')->assertExists('products/ERP001/card_1.webp');
        Storage::disk('public')->assertExists('products/ERP001/detail_1.webp');
        Storage::disk('public')->assertExists('products/ERP001/original_1.webp');

        // Cleanup
        @unlink($erpDir . '/1.jpg');
        @rmdir($erpDir);
        @rmdir($sourceDir);
    }

    public function test_import_command_reports_unmatched_erp_ids(): void
    {
        $sourceDir = storage_path('app/test-import');
        $erpDir = $sourceDir . '/UNKNOWN999';
        @mkdir($erpDir, 0755, true);

        $image = UploadedFile::fake()->image('1.jpg', 400, 300);
        copy($image->getPathname(), $erpDir . '/1.jpg');

        $this->artisan('products:import-images', [
            'path' => $sourceDir,
        ])->assertSuccessful();

        // No product images should exist
        $this->assertFalse(Storage::disk('public')->exists('products/UNKNOWN999'));

        // Cleanup
        @unlink($erpDir . '/1.jpg');
        @rmdir($erpDir);
        @rmdir($sourceDir);
    }

    public function test_import_command_is_idempotent(): void
    {
        $this->makeProduct(['erp_id' => 'ERP001']);

        $sourceDir = storage_path('app/test-import');
        $erpDir = $sourceDir . '/ERP001';
        @mkdir($erpDir, 0755, true);

        $image = UploadedFile::fake()->image('1.jpg', 400, 300);
        copy($image->getPathname(), $erpDir . '/1.jpg');

        // Run twice
        $this->artisan('products:import-images', ['path' => $sourceDir])->assertSuccessful();
        $this->artisan('products:import-images', ['path' => $sourceDir])->assertSuccessful();

        // Should still have exactly 4 variant files for 1 image
        $files = Storage::disk('public')->files('products/ERP001');
        $this->assertCount(4, $files);

        // Cleanup
        @unlink($erpDir . '/1.jpg');
        @rmdir($erpDir);
        @rmdir($sourceDir);
    }

    public function test_import_command_fails_with_invalid_path(): void
    {
        $this->artisan('products:import-images', [
            'path' => '/nonexistent/path',
        ])->assertFailed();
    }

    // ── Admin API Tests ─────────────────────────────────────────────────

    public function test_admin_can_list_product_images(): void
    {
        $product = $this->makeProduct(['erp_id' => 'ERP001']);
        $this->seedProductImages('ERP001', 2);

        Sanctum::actingAs($this->adminUser());

        $response = $this->getJson("/api/v1/products/{$product->id}/images");

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure(['data' => [['thumb', 'card', 'detail', 'original']]]);
    }

    public function test_admin_can_upload_product_images(): void
    {
        $product = $this->makeProduct(['erp_id' => 'ERP001']);

        Sanctum::actingAs($this->adminUser());

        $response = $this->postJson("/api/v1/products/{$product->id}/images", [
            'images' => [
                UploadedFile::fake()->image('photo1.jpg', 800, 600),
                UploadedFile::fake()->image('photo2.jpg', 800, 600),
            ],
        ]);

        $response->assertCreated()
            ->assertJsonCount(2, 'data');

        Storage::disk('public')->assertExists('products/ERP001/thumb_1.webp');
        Storage::disk('public')->assertExists('products/ERP001/card_2.webp');
    }

    public function test_admin_upload_respects_max_images(): void
    {
        $product = $this->makeProduct(['erp_id' => 'ERP001']);
        $this->seedProductImages('ERP001', 3);

        Sanctum::actingAs($this->adminUser());

        // Try uploading 3 more — only 1 should be accepted (max 4)
        $response = $this->postJson("/api/v1/products/{$product->id}/images", [
            'images' => [
                UploadedFile::fake()->image('a.jpg', 400, 300),
                UploadedFile::fake()->image('b.jpg', 400, 300),
                UploadedFile::fake()->image('c.jpg', 400, 300),
            ],
        ]);

        $response->assertCreated();
        $this->assertCount(4, $response->json('data'));
    }

    public function test_admin_can_delete_product_image(): void
    {
        $product = $this->makeProduct(['erp_id' => 'ERP001']);
        $this->seedProductImages('ERP001', 2);

        Sanctum::actingAs($this->adminUser());

        $response = $this->deleteJson("/api/v1/products/{$product->id}/images/1");

        $response->assertOk();
        Storage::disk('public')->assertMissing('products/ERP001/thumb_1.webp');
        Storage::disk('public')->assertMissing('products/ERP001/card_1.webp');
    }

    public function test_non_admin_cannot_upload_images(): void
    {
        $product = $this->makeProduct(['erp_id' => 'ERP001']);
        $user = User::create([
            'name' => 'Exec', 'email' => 'exec@test.com',
            'password' => bcrypt('pw'), 'role' => 'executive', 'is_active' => true,
        ]);
        $user->assignRole('executive');

        Sanctum::actingAs($user);

        $this->postJson("/api/v1/products/{$product->id}/images", [
            'images' => [UploadedFile::fake()->image('x.jpg', 400, 300)],
        ])->assertForbidden();
    }

    // ── Product API Returns Image Data ──────────────────────────────────

    public function test_product_api_returns_structured_images(): void
    {
        $product = $this->makeProduct(['erp_id' => 'ERP001']);
        $this->seedProductImages('ERP001', 1);

        $response = $this->getJson("/api/v1/products/{$product->id}");

        $response->assertOk();
        $data = $response->json('data');
        $this->assertIsArray($data['images']);
        $this->assertArrayHasKey('card', $data['images'][0]);
        $this->assertNotNull($data['first_image']);
        $this->assertStringContainsString('card_1.webp', $data['first_image']);
    }

    public function test_product_list_returns_first_image(): void
    {
        $product = $this->makeProduct(['erp_id' => 'ERP001']);
        $this->seedProductImages('ERP001', 1);

        $response = $this->getJson('/api/v1/products');

        $response->assertOk();
        $first = $response->json('data.0');
        $this->assertNotNull($first['first_image']);
        $this->assertStringContainsString('card_1.webp', $first['first_image']);
    }
}
