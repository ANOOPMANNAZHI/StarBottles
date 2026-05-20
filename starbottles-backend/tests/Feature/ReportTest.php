<?php

namespace Tests\Feature;

use App\Models\Enquiry;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductView;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Tests\Traits\SeedsRolesAndPermissions;

class ReportTest extends TestCase
{
    use RefreshDatabase, SeedsRolesAndPermissions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRolesAndPermissions();
    }

    private function makeUser(string $role): User
    {
        $user = User::factory()->create(['role' => $role, 'is_active' => true]);
        $user->assignRole($role);
        return $user;
    }

    private function makeEnquiry(array $attrs = []): Enquiry
    {
        return Enquiry::create(array_merge([
            'customer_name' => 'Test Customer',
            'phone'         => '9876543210',
            'source'        => 'website',
            'status'        => 'new',
            'received_at'   => now(),
        ], $attrs));
    }

    // ── Access control ────────────────────────────────────────────────────────

    public function test_non_admin_cannot_access_reports(): void
    {
        Sanctum::actingAs($this->makeUser('executive'));
        $this->getJson('/api/v1/reports/enquiries')->assertStatus(403);

        Sanctum::actingAs($this->makeUser('trainee'));
        $this->getJson('/api/v1/reports/enquiries')->assertStatus(403);
    }

    // ── Enquiry report ────────────────────────────────────────────────────────

    public function test_enquiry_report_returns_correct_summary(): void
    {
        $this->makeEnquiry(['source' => 'website',  'status' => 'new',        'received_at' => now()]);
        $this->makeEnquiry(['source' => 'whatsapp', 'status' => 'closed_won', 'received_at' => now()]);
        $this->makeEnquiry(['source' => 'email',    'status' => 'contacted',  'received_at' => now()]);

        Sanctum::actingAs($this->makeUser('admin'));

        $response = $this->getJson('/api/v1/reports/enquiries');

        $response->assertOk()
            ->assertJsonPath('data.summary.total', 3)
            ->assertJsonPath('data.summary.by_source.website', 1)
            ->assertJsonPath('data.summary.by_source.whatsapp', 1)
            ->assertJsonPath('data.summary.by_source.email', 1)
            ->assertJsonPath('data.summary.by_status.closed_won', 1);
    }

    public function test_enquiry_report_respects_date_range(): void
    {
        $this->makeEnquiry(['received_at' => now()->subDays(60)]); // outside range
        $this->makeEnquiry(['received_at' => now()->subDays(5)]);  // inside range

        Sanctum::actingAs($this->makeUser('admin'));

        $from = now()->subDays(10)->format('Y-m-d');
        $to   = now()->format('Y-m-d');

        $response = $this->getJson("/api/v1/reports/enquiries?date_from={$from}&date_to={$to}");

        $response->assertOk()
            ->assertJsonPath('data.summary.total', 1);
    }

    public function test_daily_counts_cover_all_days_in_range(): void
    {
        $this->makeEnquiry(['source' => 'website',  'received_at' => now()->subDays(2)]);
        $this->makeEnquiry(['source' => 'whatsapp', 'received_at' => now()->subDays(1)]);

        Sanctum::actingAs($this->makeUser('admin'));

        $response = $this->getJson('/api/v1/reports/enquiries');

        $response->assertOk();
        $daily = $response->json('data.daily_counts');
        $this->assertNotEmpty($daily);

        // Each entry has required keys
        foreach ($daily as $day) {
            $this->assertArrayHasKey('date',     $day);
            $this->assertArrayHasKey('count',    $day);
            $this->assertArrayHasKey('website',  $day);
            $this->assertArrayHasKey('whatsapp', $day);
        }
    }

    // ── Executive performance ─────────────────────────────────────────────────

    public function test_executive_performance_report_returns_all_active_executives(): void
    {
        $exec1 = $this->makeUser('executive');
        $exec2 = $this->makeUser('executive');

        Sanctum::actingAs($this->makeUser('admin'));

        $response = $this->getJson('/api/v1/reports/executive-performance');

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('executive_name');
        $this->assertTrue($names->contains($exec1->name));
        $this->assertTrue($names->contains($exec2->name));
    }

    public function test_executive_performance_calculates_avg_response_time(): void
    {
        $exec = $this->makeUser('executive');

        // Enquiry responded to in 60 minutes
        $receivedAt     = Carbon::now()->subDays(5);
        $firstActionAt  = $receivedAt->copy()->addMinutes(60);
        $this->makeEnquiry([
            'assigned_to'    => $exec->id,
            'received_at'    => $receivedAt,
            'first_action_at' => $firstActionAt,
            'status'         => 'contacted',
        ]);

        Sanctum::actingAs($this->makeUser('admin'));

        $response = $this->getJson('/api/v1/reports/executive-performance');

        $response->assertOk();
        $execData = collect($response->json('data'))->firstWhere('executive_id', $exec->id);
        $this->assertNotNull($execData);
        $this->assertEquals(60, $execData['avg_response_time_minutes']);
    }

    // ── Product interest ──────────────────────────────────────────────────────

    public function test_product_interest_returns_top_viewed_and_enquired(): void
    {
        $category = ProductCategory::create([
            'name' => 'PET', 'slug' => 'pet-' . uniqid(),
            'parent_id' => null,
        ]);

        $product = Product::create([
            'erp_id'      => 'P001',
            'title'       => 'Test Bottle',
            'category_id' => $category->id,
            'is_hidden'   => false,
            'is_featured' => false,
        ]);

        // 3 views
        for ($i = 0; $i < 3; $i++) {
            ProductView::create([
                'product_id' => $product->id,
                'viewed_at'  => now(),
            ]);
        }

        // 2 enquiries for this product
        for ($i = 0; $i < 2; $i++) {
            $this->makeEnquiry(['product_id' => $product->id]);
        }

        Sanctum::actingAs($this->makeUser('admin'));

        $response = $this->getJson('/api/v1/reports/product-interest');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['most_viewed', 'most_enquired']]);

        $viewed = $response->json('data.most_viewed');
        $this->assertNotEmpty($viewed);
        $this->assertEquals($product->id, $viewed[0]['product_id']);
        $this->assertEquals(3, $viewed[0]['view_count']);

        $enquired = $response->json('data.most_enquired');
        $this->assertNotEmpty($enquired);
        $this->assertEquals($product->id, $enquired[0]['product_id']);
        $this->assertEquals(2, $enquired[0]['enquiry_count']);
    }

    // ── Export ────────────────────────────────────────────────────────────────

    public function test_export_csv_returns_downloadable_file(): void
    {
        $this->makeEnquiry();

        Sanctum::actingAs($this->makeUser('admin'));

        $response = $this->get('/api/v1/reports/export?report_type=enquiries&format=csv');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
    }

    public function test_export_xlsx_returns_downloadable_file(): void
    {
        $this->makeEnquiry();

        Sanctum::actingAs($this->makeUser('admin'));

        $response = $this->get('/api/v1/reports/export?report_type=enquiries&format=xlsx');

        $response->assertOk();
        $this->assertStringContainsString(
            'spreadsheetml',
            $response->headers->get('Content-Type')
        );
    }
}
