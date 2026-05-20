<?php

namespace Tests\Feature;

use App\Models\ErpSyncLog;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\ErpSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Tests\Traits\SeedsRolesAndPermissions;

class ErpSyncTest extends TestCase
{
    use RefreshDatabase, SeedsRolesAndPermissions;

    protected ErpSyncService $service;
    protected User $admin;
    protected User $executive;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedRolesAndPermissions();

        $this->admin = tap(User::create([
            'name' => 'Admin', 'email' => 'admin@test.com',
            'password' => Hash::make('password'), 'role' => 'admin', 'is_active' => true,
        ]))->assignRole('admin');

        $this->executive = tap(User::create([
            'name' => 'Exec', 'email' => 'exec@test.com',
            'password' => Hash::make('password'), 'role' => 'executive', 'is_active' => true,
        ]))->assignRole('executive');

        // Ensure mock mode is on and mock files exist
        config(['erp.use_mock' => true]);
        $this->service = app(ErpSyncService::class);
    }

    // ── Service tests ─────────────────────────────────────────────────────

    public function test_sync_service_creates_new_products_from_mock(): void
    {
        $this->assertDatabaseCount('products', 0);

        $result = $this->service->sync();

        $this->assertGreaterThan(0, $result['added']);
        $this->assertSame(0, $result['updated']);
        $this->assertDatabaseCount('products', $result['added']);
    }

    public function test_sync_service_updates_existing_products(): void
    {
        // First sync — creates all products
        $this->service->sync();
        $firstCount = Product::count();

        // Second sync — should update all, add none
        $result = $this->service->sync();

        $this->assertSame(0, $result['added']);
        $this->assertSame($firstCount, $result['updated']);
        $this->assertDatabaseCount('products', $firstCount);
    }

    public function test_new_products_from_sync_are_hidden_by_default(): void
    {
        $this->service->sync();

        // Every newly synced product should start hidden
        $this->assertSame(0, Product::where('is_hidden', false)->count());
        $this->assertGreaterThan(0, Product::where('is_hidden', true)->count());
    }

    public function test_sync_preserves_is_hidden_state_on_existing_products(): void
    {
        // First sync — all products created as hidden
        $this->service->sync();

        // Admin unhides one product
        $product = Product::first();
        $product->update(['is_hidden' => false]);

        // Second sync — that product should stay visible
        $this->service->sync();

        $this->assertDatabaseHas('products', [
            'erp_id'    => $product->erp_id,
            'is_hidden' => false,
        ]);
    }

    public function test_sync_service_deactivates_products_not_in_erp_response(): void
    {
        // Create a product that won't be in the ERP response
        Product::create([
            'erp_id'    => 'ERP-GHOST',
            'title'     => 'Ghost Product',
            'is_active' => true,
        ]);

        $result = $this->service->sync();

        $this->assertGreaterThan(0, $result['deactivated']);
        $this->assertDatabaseHas('products', [
            'erp_id'    => 'ERP-GHOST',
            'is_active' => false,
        ]);
    }

    public function test_sync_logs_success_record_after_successful_sync(): void
    {
        $this->service->sync();

        $this->assertDatabaseHas('erp_sync_logs', ['status' => 'success']);
    }

    public function test_sync_logs_failure_record_on_error(): void
    {
        Http::fake(['*' => Http::response('Internal Server Error', 500)]);

        SiteSetting::where('key', 'erp_use_mock')->update(['value' => '0']);

        config([
            'erp.use_mock'    => false,
            'erp.base_url'    => 'http://fake-erp.test',
            'erp.api_key'     => 'invalid',
            'erp.api_secret'  => 'invalid',
        ]);

        $service = app(ErpSyncService::class);

        try {
            $service->sync();
            $this->fail('Expected exception was not thrown');
        } catch (\Exception $e) {
            $this->assertDatabaseHas('erp_sync_logs', ['status' => 'failed']);
        }
    }

    // ── Category sync tests ─────────────────────────────────────────────

    public function test_sync_creates_categories_from_mock_groups(): void
    {
        $this->assertDatabaseCount('product_categories', 0);

        $this->service->sync();

        $this->assertGreaterThan(0, ProductCategory::count());
        $this->assertDatabaseHas('product_categories', ['erp_name' => 'PET Bottles']);
        $this->assertDatabaseHas('product_categories', ['erp_name' => 'Glass Jars']);
    }

    public function test_sync_assigns_category_to_products(): void
    {
        $this->service->sync();

        $product = Product::where('erp_id', 'ERP-001')->first();

        $this->assertNotNull($product->category_id);
        $this->assertNotNull($product->category);
        $this->assertSame('PET Bottles', $product->category->erp_name);
    }

    // ── Frappe field tests ──────────────────────────────────────────────

    public function test_sync_populates_frappe_fields(): void
    {
        $this->service->sync();

        $product = Product::where('erp_id', 'ERP-001')->first();

        $this->assertSame('ERP-001', $product->item_code);
        $this->assertSame('PET Boston Round 500ml', $product->title);
        $this->assertSame('Star Bottles', $product->brand);
        $this->assertSame('Nos', $product->stock_uom);
        $this->assertSame('A', $product->classification);
    }

    public function test_html_description_is_stripped(): void
    {
        $this->service->sync();

        // ERP-010 has HTML in description in mock data
        $product = Product::where('erp_id', 'ERP-010')->first();

        $this->assertNotNull($product->description);
        $this->assertStringNotContainsString('<div>', $product->description);
        $this->assertStringNotContainsString('<p>', $product->description);
        $this->assertStringContainsString('Amber glass dropper bottle', $product->description);
    }

    // ── Frappe API format test (Http::fake) ─────────────────────────────

    public function test_sync_with_faked_frappe_response(): void
    {
        Http::fake(function ($request) {
            if (str_contains($request->url(), 'get_item_groups')) {
                return Http::response([
                    'message' => [
                        'total_count' => 2,
                        'limit_start' => 0,
                        'limit_page_length' => 100,
                        'data' => ['Test Jars', 'Test Bottles'],
                    ],
                ]);
            }

            return Http::response([
                'message' => [
                    'total_count' => 1,
                    'limit_start' => 0,
                    'limit_page_length' => 100,
                    'data' => [[
                        'item_code'      => 'SB-TEST-001',
                        'item_name'      => 'Test Bottle 500ml',
                        'item_group'     => 'Test Bottles',
                        'description'    => 'A test bottle',
                        'stock_uom'      => 'Nos',
                        'classification' => 'A',
                        'image'          => null,
                        'brand'          => 'Test Brand',
                        'creation'       => '2025-04-06 16:29:02',
                    ]],
                ],
            ]);
        });

        SiteSetting::where('key', 'erp_use_mock')->update(['value' => '0']);

        config([
            'erp.use_mock'    => false,
            'erp.base_url'    => 'http://fake-erp.test',
            'erp.api_key'     => 'test',
            'erp.api_secret'  => 'test',
            'erp.company'     => 'Test Co',
        ]);

        $service = app(ErpSyncService::class);
        $result = $service->sync();

        $this->assertSame(1, $result['added']);
        $this->assertSame(2, $result['categoriesSynced']);
        $this->assertDatabaseHas('products', [
            'erp_id' => 'SB-TEST-001',
            'title'  => 'Test Bottle 500ml',
            'brand'  => 'Test Brand',
        ]);
        $this->assertDatabaseHas('product_categories', ['erp_name' => 'Test Bottles']);
        $this->assertDatabaseHas('product_categories', ['erp_name' => 'Test Jars']);
    }

    public function test_single_request_with_zero_page_length_fetches_all_items(): void
    {
        Http::fake(function ($request) {
            if (str_contains($request->url(), 'get_item_groups')) {
                return Http::response([
                    'message' => ['total_count' => 1, 'data' => ['Bottles']],
                ]);
            }

            // Verify limit_page_length=0 is sent
            $this->assertSame(0, $request->data()['limit_page_length'] ?? null);

            return Http::response([
                'message' => [
                    'data' => [
                        ['item_code' => 'P1', 'item_name' => 'Product 1', 'item_group' => 'Bottles', 'description' => '', 'stock_uom' => 'Nos', 'classification' => 'A', 'image' => null, 'brand' => 'B1', 'creation' => '2025-01-01'],
                        ['item_code' => 'P2', 'item_name' => 'Product 2', 'item_group' => 'Bottles', 'description' => '', 'stock_uom' => 'Nos', 'classification' => 'B', 'image' => null, 'brand' => 'B1', 'creation' => '2025-01-01'],
                        ['item_code' => 'P3', 'item_name' => 'Product 3', 'item_group' => 'Bottles', 'description' => '', 'stock_uom' => 'Nos', 'classification' => 'C', 'image' => null, 'brand' => 'B1', 'creation' => '2025-01-01'],
                    ],
                ],
            ]);
        });

        SiteSetting::where('key', 'erp_use_mock')->update(['value' => '0']);

        config([
            'erp.use_mock'   => false,
            'erp.base_url'   => 'http://fake-erp.test',
            'erp.api_key'    => 'test',
            'erp.api_secret' => 'test',
        ]);

        // Pre-create a product that should be deactivated
        Product::create(['erp_id' => 'OLD', 'title' => 'Old Product', 'is_active' => true]);

        $service = app(ErpSyncService::class);
        $result = $service->sync();

        $this->assertSame(3, $result['added']);
        $this->assertSame(1, $result['deactivated']);
        $this->assertDatabaseHas('products', ['erp_id' => 'P3', 'is_active' => true]);
        $this->assertDatabaseHas('products', ['erp_id' => 'OLD', 'is_active' => false]);
    }

    // ── HTTP endpoint tests ───────────────────────────────────────────────

    public function test_non_admin_cannot_trigger_sync(): void
    {
        Sanctum::actingAs($this->executive);

        $this->postJson('/api/v1/erp/sync')->assertStatus(403);
    }

    public function test_admin_can_trigger_sync_and_gets_202(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/v1/erp/sync');

        $response->assertStatus(202)
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_view_sync_status(): void
    {
        $this->service->sync();

        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/v1/erp/sync-status');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['logs', 'total_products', 'last_sync'],
            ])
            ->assertJsonPath('data.total_products', Product::count());
    }
}
