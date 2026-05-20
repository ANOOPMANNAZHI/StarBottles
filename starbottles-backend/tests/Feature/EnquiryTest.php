<?php

namespace Tests\Feature;

use App\Models\Enquiry;
use App\Models\EnquiryNote;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Tests\Traits\SeedsRolesAndPermissions;

class EnquiryTest extends TestCase
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
            'customer_name' => 'John Doe',
            'phone'         => '9876543210',
            'source'        => 'website',
            'status'        => 'new',
            'received_at'   => now(),
        ], $attrs));
    }

    // ── Public submission ─────────────────────────────────────────────────

    public function test_public_can_submit_website_enquiry(): void
    {
        $response = $this->postJson('/api/v1/enquiries', [
            'customer_name' => 'Jane Smith',
            'phone'         => '9000000001',
            'email'         => 'jane@example.com',
            'message'       => 'I need 1000 bottles',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'new')
            ->assertJsonPath('data.source', 'website');

        $this->assertDatabaseHas('enquiries', ['phone' => '9000000001', 'source' => 'website']);
    }

    // ── Access control ────────────────────────────────────────────────────

    public function test_trainee_cannot_access_enquiry_list(): void
    {
        Sanctum::actingAs($this->makeUser('trainee'));

        $response = $this->getJson('/api/v1/enquiries');

        $response->assertStatus(403);
    }

    public function test_executive_only_sees_assigned_enquiries(): void
    {
        $exec = $this->makeUser('executive');
        $otherExec = $this->makeUser('executive');

        $assigned   = $this->makeEnquiry(['assigned_to' => $exec->id]);
        $unassigned = $this->makeEnquiry(['assigned_to' => $otherExec->id]);

        Sanctum::actingAs($exec);

        $response = $this->getJson('/api/v1/enquiries');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains($assigned->id, $ids);
        $this->assertNotContains($unassigned->id, $ids);
    }

    public function test_executive_cannot_view_other_executives_enquiry(): void
    {
        $exec      = $this->makeUser('executive');
        $otherExec = $this->makeUser('executive');
        $enquiry   = $this->makeEnquiry(['assigned_to' => $otherExec->id]);

        Sanctum::actingAs($exec);

        $response = $this->getJson("/api/v1/enquiries/{$enquiry->id}");

        $response->assertStatus(403);
    }

    public function test_admin_can_see_all_enquiries(): void
    {
        $exec = $this->makeUser('executive');
        $this->makeEnquiry(['assigned_to' => $exec->id]);
        $this->makeEnquiry(); // unassigned

        Sanctum::actingAs($this->makeUser('admin'));

        $response = $this->getJson('/api/v1/enquiries');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    // ── Status updates ────────────────────────────────────────────────────

    public function test_first_status_update_sets_first_action_at(): void
    {
        $admin   = $this->makeUser('admin');
        $enquiry = $this->makeEnquiry(['first_action_at' => null]);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/enquiries/{$enquiry->id}/status", [
            'status' => 'contacted',
        ])->assertOk();

        $this->assertDatabaseMissing('enquiries', [
            'id'              => $enquiry->id,
            'first_action_at' => null,
        ]);
    }

    public function test_second_status_update_does_not_change_first_action_at(): void
    {
        $admin   = $this->makeUser('admin');
        $firstAction = now()->subHour();
        $enquiry = $this->makeEnquiry([
            'status'         => 'contacted',
            'first_action_at' => $firstAction,
        ]);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/enquiries/{$enquiry->id}/status", [
            'status' => 'follow_up_pending',
        ])->assertOk();

        $this->assertDatabaseHas('enquiries', [
            'id'     => $enquiry->id,
            'status' => 'follow_up_pending',
        ]);

        // first_action_at should be unchanged (still the original time)
        $updated = Enquiry::find($enquiry->id);
        $this->assertEquals(
            $firstAction->toDateTimeString(),
            $updated->first_action_at->toDateTimeString()
        );
    }

    // ── Admin assign ──────────────────────────────────────────────────────

    public function test_admin_can_assign_enquiry_to_active_executive(): void
    {
        $admin   = $this->makeUser('admin');
        $exec    = $this->makeUser('executive');
        $enquiry = $this->makeEnquiry();

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/v1/enquiries/{$enquiry->id}/assign", [
            'assigned_to' => $exec->id,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.assigned_to.id', $exec->id);
    }

    public function test_admin_cannot_assign_to_inactive_user(): void
    {
        $admin   = $this->makeUser('admin');
        $exec    = User::factory()->create(['role' => 'executive', 'is_active' => false]);
        $exec->assignRole('executive');
        $enquiry = $this->makeEnquiry();

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/v1/enquiries/{$enquiry->id}/assign", [
            'assigned_to' => $exec->id,
        ]);

        $response->assertStatus(422);
    }

    // ── Notes ─────────────────────────────────────────────────────────────

    public function test_executive_can_add_note_to_own_enquiry(): void
    {
        $exec    = $this->makeUser('executive');
        $enquiry = $this->makeEnquiry(['assigned_to' => $exec->id]);

        Sanctum::actingAs($exec);

        $response = $this->postJson("/api/v1/enquiries/{$enquiry->id}/notes", [
            'note_text' => 'Called customer, no answer.',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.note_text', 'Called customer, no answer.');
    }

    public function test_executive_cannot_add_note_to_others_enquiry(): void
    {
        $exec      = $this->makeUser('executive');
        $otherExec = $this->makeUser('executive');
        $enquiry   = $this->makeEnquiry(['assigned_to' => $otherExec->id]);

        Sanctum::actingAs($exec);

        $response = $this->postJson("/api/v1/enquiries/{$enquiry->id}/notes", [
            'note_text' => 'Trying to add note',
        ]);

        $response->assertStatus(403);
    }
}
