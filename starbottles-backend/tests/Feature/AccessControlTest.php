<?php

namespace Tests\Feature;

use App\Models\Enquiry;
use App\Models\QuizTest;
use App\Models\QuizTestAssignment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Tests\Traits\SeedsRolesAndPermissions;

class AccessControlTest extends TestCase
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
            'customer_name' => 'Test',
            'phone'         => '9876543210',
            'source'        => 'website',
            'status'        => 'new',
            'received_at'   => now(),
        ], $attrs));
    }

    // ── Unauthenticated access ────────────────────────────────────────────────

    public function test_unauthenticated_cannot_access_protected_endpoints(): void
    {
        $this->getJson('/api/v1/enquiries')->assertStatus(401);
        $this->getJson('/api/v1/users')->assertStatus(401);
        $this->getJson('/api/v1/reports/enquiries')->assertStatus(401);
        $this->postJson('/api/v1/auth/logout')->assertStatus(401);
        $this->getJson('/api/v1/auth/me')->assertStatus(401);
    }

    // ── Trainee restrictions ──────────────────────────────────────────────────

    public function test_trainee_cannot_access_enquiry_list(): void
    {
        Sanctum::actingAs($this->makeUser('trainee'));
        $this->getJson('/api/v1/enquiries')->assertStatus(403);
    }

    public function test_trainee_cannot_access_enquiry_detail(): void
    {
        $enquiry = $this->makeEnquiry();
        Sanctum::actingAs($this->makeUser('trainee'));
        $this->getJson("/api/v1/enquiries/{$enquiry->id}")->assertStatus(403);
    }

    public function test_trainee_cannot_add_note_to_enquiry(): void
    {
        $enquiry = $this->makeEnquiry();
        Sanctum::actingAs($this->makeUser('trainee'));
        $this->postJson("/api/v1/enquiries/{$enquiry->id}/notes", ['note_text' => 'test'])->assertStatus(403);
    }

    public function test_trainee_cannot_access_user_management(): void
    {
        Sanctum::actingAs($this->makeUser('trainee'));
        $this->getJson('/api/v1/users')->assertStatus(403);
        $this->postJson('/api/v1/users', [])->assertStatus(403);
    }

    public function test_trainee_cannot_access_reports(): void
    {
        Sanctum::actingAs($this->makeUser('trainee'));
        $this->getJson('/api/v1/reports/enquiries')->assertStatus(403);
    }

    public function test_trainee_cannot_access_erp_endpoints(): void
    {
        Sanctum::actingAs($this->makeUser('trainee'));
        $this->getJson('/api/v1/erp/sync-status')->assertStatus(403);
        $this->postJson('/api/v1/erp/sync')->assertStatus(403);
    }

    public function test_trainee_cannot_access_admin_quiz_endpoints(): void
    {
        Sanctum::actingAs($this->makeUser('trainee'));
        $this->getJson('/api/v1/quiz-tests')->assertStatus(403);
        $this->postJson('/api/v1/quiz-tests', [])->assertStatus(403);
    }

    public function test_trainee_cannot_view_quiz_results(): void
    {
        $admin = $this->makeUser('admin');
        $quiz  = QuizTest::create(['title' => 'Test', 'passing_score' => 70, 'created_by' => $admin->id, 'is_active' => true]);

        Sanctum::actingAs($this->makeUser('trainee'));
        $this->getJson("/api/v1/quiz-tests/{$quiz->id}/results")->assertStatus(403);
    }

    // ── Executive restrictions ────────────────────────────────────────────────

    public function test_executive_cannot_access_user_management(): void
    {
        Sanctum::actingAs($this->makeUser('executive'));
        $this->getJson('/api/v1/users')->assertStatus(403);
        $this->postJson('/api/v1/users', [])->assertStatus(403);
    }

    public function test_executive_cannot_assign_enquiry(): void
    {
        $enquiry = $this->makeEnquiry();
        Sanctum::actingAs($this->makeUser('executive'));
        $this->postJson("/api/v1/enquiries/{$enquiry->id}/assign", ['assigned_to' => 1])->assertStatus(403);
    }

    public function test_executive_cannot_trigger_erp_sync(): void
    {
        Sanctum::actingAs($this->makeUser('executive'));
        $this->postJson('/api/v1/erp/sync')->assertStatus(403);
    }

    public function test_executive_cannot_access_reports(): void
    {
        Sanctum::actingAs($this->makeUser('executive'));
        $this->getJson('/api/v1/reports/enquiries')->assertStatus(403);
    }

    public function test_executive_cannot_access_admin_quiz_list(): void
    {
        Sanctum::actingAs($this->makeUser('executive'));
        $this->getJson('/api/v1/quiz-tests')->assertStatus(403);
    }

    public function test_executive_cannot_upload_training_materials(): void
    {
        Sanctum::actingAs($this->makeUser('executive'));
        $this->postJson('/api/v1/training/materials', [])->assertStatus(403);
    }

    // ── Data isolation ────────────────────────────────────────────────────────

    public function test_executive_cannot_view_enquiry_assigned_to_another_executive(): void
    {
        $execA   = $this->makeUser('executive');
        $execB   = $this->makeUser('executive');
        $enquiry = $this->makeEnquiry(['assigned_to' => $execB->id]);

        Sanctum::actingAs($execA);
        $this->getJson("/api/v1/enquiries/{$enquiry->id}")->assertStatus(403);
    }

    public function test_executive_cannot_add_note_to_another_executives_enquiry(): void
    {
        $execA   = $this->makeUser('executive');
        $execB   = $this->makeUser('executive');
        $enquiry = $this->makeEnquiry(['assigned_to' => $execB->id]);

        Sanctum::actingAs($execA);
        $this->postJson("/api/v1/enquiries/{$enquiry->id}/notes", ['note_text' => 'test'])->assertStatus(403);
    }

    public function test_executive_index_excludes_other_executives_enquiries(): void
    {
        $execA   = $this->makeUser('executive');
        $execB   = $this->makeUser('executive');
        $myEnq   = $this->makeEnquiry(['assigned_to' => $execA->id, 'customer_name' => 'Mine']);
        $otherEnq = $this->makeEnquiry(['assigned_to' => $execB->id, 'customer_name' => 'Theirs']);

        Sanctum::actingAs($execA);
        $response = $this->getJson('/api/v1/enquiries')->assertOk();

        $names = collect($response->json('data'))->pluck('customer_name');
        $this->assertTrue($names->contains('Mine'));
        $this->assertFalse($names->contains('Theirs'));
    }

    public function test_trainee_cannot_view_unassigned_quiz(): void
    {
        $admin   = $this->makeUser('admin');
        $trainee = $this->makeUser('trainee');
        $quiz    = QuizTest::create(['title' => 'Test', 'passing_score' => 70, 'created_by' => $admin->id, 'is_active' => true]);

        Sanctum::actingAs($trainee);
        $this->getJson("/api/v1/quiz-tests/{$quiz->id}")->assertStatus(403);
    }

    public function test_trainee_cannot_attempt_unassigned_quiz(): void
    {
        $admin   = $this->makeUser('admin');
        $trainee = $this->makeUser('trainee');
        $quiz    = QuizTest::create(['title' => 'Test', 'passing_score' => 70, 'created_by' => $admin->id, 'is_active' => true]);

        Sanctum::actingAs($trainee);
        $this->postJson("/api/v1/quiz-tests/{$quiz->id}/attempt", ['answers' => []])->assertStatus(403);
    }
}
