<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductVariation;
use App\Models\ProductView;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Tests\Traits\SeedsRolesAndPermissions;

class ProductApiTest extends TestCase
{
    use RefreshDatabase, SeedsRolesAndPermissions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRolesAndPermissions();
    }

    private function makeCategory(array $attrs = []): ProductCategory
    {
        $uid = uniqid();
        return ProductCategory::create(array_merge([
            'name' => 'PET Bottles',
            'slug' => 'pet-bottles-' . $uid,
        ], $attrs));
    }

    private function makeProduct(array $attrs = []): Product
    {
        $category = $this->makeCategory();
        return Product::create(array_merge([
            'erp_id'      => 'ERP-001',
            'title'       => 'Clear PET Bottle 500ml',
            'description' => 'A clear bottle',
            'category_id' => $category->id,
            'material'    => 'PET',
            'capacity'    => '500ml',
            'neck_size'   => '28mm',
            'shape_type'  => 'Round',
            'is_active'   => true,
            'is_hidden'   => false,
            'is_featured' => false,
            'images'      => ['https://example.com/bottle.jpg'],
            'synced_at'   => now(),
        ], $attrs));
    }

    private function adminUser(): User
    {
        $user = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $user->assignRole('admin');
        return $user;
    }

    // ── Public listing ────────────────────────────────────────────────────

    public function test_public_can_list_active_visible_products(): void
    {
        $this->makeProduct();
        $this->makeProduct(['erp_id' => 'ERP-002', 'title' => 'Second bottle']);

        $response = $this->getJson('/api/v1/products');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');
    }

    public function test_hidden_products_not_returned_to_public(): void
    {
        $this->makeProduct();
        $this->makeProduct(['erp_id' => 'ERP-002', 'is_hidden' => true]);

        $response = $this->getJson('/api/v1/products');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_can_view_hidden_products_with_flag(): void
    {
        $this->makeProduct();
        $this->makeProduct(['erp_id' => 'ERP-002', 'is_hidden' => true]);

        Sanctum::actingAs($this->adminUser());

        $response = $this->getJson('/api/v1/products?include_hidden=true');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_search_returns_matching_products(): void
    {
        $this->makeProduct(['title' => 'Clear PET Bottle']);
        $this->makeProduct(['erp_id' => 'ERP-002', 'title' => 'Glass Jar']);

        $response = $this->getJson('/api/v1/products?search=PET');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Clear PET Bottle');
    }

    public function test_category_filter_works(): void
    {
        $cat1 = $this->makeCategory(['name' => 'PET', 'slug' => 'pet']);
        $cat2 = $this->makeCategory(['name' => 'Glass', 'slug' => 'glass']);

        Product::create([
            'erp_id' => 'ERP-001', 'title' => 'PET Bottle', 'category_id' => $cat1->id,
            'is_active' => true, 'is_hidden' => false, 'synced_at' => now(),
        ]);
        Product::create([
            'erp_id' => 'ERP-002', 'title' => 'Glass Jar', 'category_id' => $cat2->id,
            'is_active' => true, 'is_hidden' => false, 'synced_at' => now(),
        ]);

        $response = $this->getJson("/api/v1/products?category_id={$cat1->id}");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'PET Bottle');
    }

    public function test_featured_filter_returns_only_featured_products(): void
    {
        $this->makeProduct(['is_featured' => true]);
        $this->makeProduct(['erp_id' => 'ERP-002', 'is_featured' => false]);

        $response = $this->getJson('/api/v1/products?featured=1');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    // ── Product detail ────────────────────────────────────────────────────

    public function test_viewing_product_creates_product_view_record(): void
    {
        $product = $this->makeProduct();

        $this->getJson("/api/v1/products/{$product->id}");

        $this->assertDatabaseHas('product_views', ['product_id' => $product->id]);
    }

    public function test_hidden_product_detail_returns_404_to_public(): void
    {
        $product = $this->makeProduct(['is_hidden' => true]);

        $response = $this->getJson("/api/v1/products/{$product->id}");

        $response->assertNotFound();
    }

    // ── Admin visibility controls ─────────────────────────────────────────

    public function test_admin_can_toggle_product_hidden(): void
    {
        $product = $this->makeProduct(['is_hidden' => false]);
        Sanctum::actingAs($this->adminUser());

        $response = $this->patchJson("/api/v1/products/{$product->id}/hide");

        $response->assertOk()
            ->assertJsonPath('data.is_hidden', true);

        $this->assertDatabaseHas('products', ['id' => $product->id, 'is_hidden' => true]);
    }

    public function test_admin_can_toggle_product_featured(): void
    {
        $product = $this->makeProduct(['is_featured' => false]);
        Sanctum::actingAs($this->adminUser());

        $response = $this->patchJson("/api/v1/products/{$product->id}/feature");

        $response->assertOk()
            ->assertJsonPath('data.is_featured', true);

        $this->assertDatabaseHas('products', ['id' => $product->id, 'is_featured' => true]);
    }

    // ── Categories ────────────────────────────────────────────────────────

    public function test_categories_endpoint_returns_nested_tree(): void
    {
        $parent = ProductCategory::create(['name' => 'PET Bottles', 'slug' => 'pet-bottles', 'parent_id' => null]);
        ProductCategory::create(['name' => 'Clear PET', 'slug' => 'clear-pet', 'parent_id' => $parent->id]);
        ProductCategory::create(['name' => 'Coloured PET', 'slug' => 'coloured-pet', 'parent_id' => $parent->id]);

        $response = $this->getJson('/api/v1/products/categories');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data')
            ->assertJsonCount(2, 'data.0.children');
    }
}
