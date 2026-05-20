<?php

namespace Tests\Feature;

use App\Models\Enquiry;
use App\Models\User;
use App\Notifications\EnquiryAssignedNotification;
use App\Notifications\NewEnquiryReceivedNotification;
use App\Services\EnquiryAssignmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;
use Tests\Traits\SeedsRolesAndPermissions;

class AutoAssignmentTest extends TestCase
{
    use RefreshDatabase, SeedsRolesAndPermissions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRolesAndPermissions();
    }

    private function makeUser(string $role, bool $active = true): User
    {
        $user = User::factory()->create(['role' => $role, 'is_active' => $active]);
        $user->assignRole($role);
        return $user;
    }

    // ── Round-robin service ─────────────────────────────────────────────

    public function test_auto_assign_assigns_to_first_executive(): void
    {
        $exec = $this->makeUser('executive');
        $enquiry = Enquiry::create([
            'customer_name' => 'Test',
            'phone' => '1234567890',
            'source' => 'website',
            'status' => 'new',
            'received_at' => now(),
        ]);

        $service = new EnquiryAssignmentService();
        $assigned = $service->autoAssign($enquiry);

        $this->assertNotNull($assigned);
        $this->assertEquals($exec->id, $assigned->id);
        $this->assertDatabaseHas('enquiries', [
            'id' => $enquiry->id,
            'assigned_to' => $exec->id,
        ]);
    }

    public function test_round_robin_rotates_between_executives(): void
    {
        $exec1 = $this->makeUser('executive');
        $exec2 = $this->makeUser('executive');
        $exec3 = $this->makeUser('executive');

        $service = new EnquiryAssignmentService();

        $enquiry1 = Enquiry::create(['customer_name' => 'A', 'phone' => '1111', 'source' => 'website', 'status' => 'new', 'received_at' => now()]);
        $assigned1 = $service->autoAssign($enquiry1);

        $enquiry2 = Enquiry::create(['customer_name' => 'B', 'phone' => '2222', 'source' => 'website', 'status' => 'new', 'received_at' => now()]);
        $assigned2 = $service->autoAssign($enquiry2);

        $enquiry3 = Enquiry::create(['customer_name' => 'C', 'phone' => '3333', 'source' => 'website', 'status' => 'new', 'received_at' => now()]);
        $assigned3 = $service->autoAssign($enquiry3);

        // Should rotate: exec1 -> exec2 -> exec3
        $this->assertEquals($exec1->id, $assigned1->id);
        $this->assertEquals($exec2->id, $assigned2->id);
        $this->assertEquals($exec3->id, $assigned3->id);

        // Fourth should wrap back to exec1
        $enquiry4 = Enquiry::create(['customer_name' => 'D', 'phone' => '4444', 'source' => 'website', 'status' => 'new', 'received_at' => now()]);
        $assigned4 = $service->autoAssign($enquiry4);
        $this->assertEquals($exec1->id, $assigned4->id);
    }

    public function test_auto_assign_returns_null_when_no_executives(): void
    {
        $enquiry = Enquiry::create([
            'customer_name' => 'Test',
            'phone' => '1234567890',
            'source' => 'website',
            'status' => 'new',
            'received_at' => now(),
        ]);

        $service = new EnquiryAssignmentService();
        $assigned = $service->autoAssign($enquiry);

        $this->assertNull($assigned);
        $this->assertDatabaseHas('enquiries', [
            'id' => $enquiry->id,
            'assigned_to' => null,
        ]);
    }

    public function test_auto_assign_skips_inactive_executives(): void
    {
        $this->makeUser('executive', false); // inactive
        $activeExec = $this->makeUser('executive', true);

        $enquiry = Enquiry::create([
            'customer_name' => 'Test',
            'phone' => '1234567890',
            'source' => 'website',
            'status' => 'new',
            'received_at' => now(),
        ]);

        $service = new EnquiryAssignmentService();
        $assigned = $service->autoAssign($enquiry);

        $this->assertEquals($activeExec->id, $assigned->id);
    }

    // ── Auto-assign on enquiry submission ────────────────────────────────

    public function test_website_enquiry_is_auto_assigned(): void
    {
        Notification::fake();

        $admin = $this->makeUser('admin');
        $exec = $this->makeUser('executive');

        $response = $this->postJson('/api/v1/enquiries', [
            'customer_name' => 'Auto Test',
            'phone' => '9876543210',
            'message' => 'Need bottles',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('enquiries', [
            'phone' => '9876543210',
            'assigned_to' => $exec->id,
        ]);
    }

    public function test_notifications_sent_on_enquiry_creation(): void
    {
        Notification::fake();

        $admin = $this->makeUser('admin');
        $exec = $this->makeUser('executive');

        $this->postJson('/api/v1/enquiries', [
            'customer_name' => 'Notify Test',
            'phone' => '5555555555',
        ]);

        Notification::assertSentTo($admin, NewEnquiryReceivedNotification::class);
        Notification::assertSentTo($exec, EnquiryAssignedNotification::class);
    }

    public function test_no_assignment_notification_when_no_executives(): void
    {
        Notification::fake();

        $admin = $this->makeUser('admin');

        $this->postJson('/api/v1/enquiries', [
            'customer_name' => 'No Exec Test',
            'phone' => '6666666666',
        ]);

        Notification::assertSentTo($admin, NewEnquiryReceivedNotification::class);
        Notification::assertNotSentTo($admin, EnquiryAssignedNotification::class);
    }
}
