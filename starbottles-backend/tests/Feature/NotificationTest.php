<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Tests\Traits\SeedsRolesAndPermissions;

class NotificationTest extends TestCase
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

    private function createNotification(User $user, bool $read = false): string
    {
        $id = Str::uuid()->toString();
        $user->notifications()->create([
            'id' => $id,
            'type' => 'App\\Notifications\\NewEnquiryReceivedNotification',
            'data' => json_encode([
                'type' => 'new_enquiry',
                'title' => 'New Enquiry Received',
                'message' => 'New website enquiry from Test Customer.',
                'enquiry_id' => 1,
            ]),
            'read_at' => $read ? now() : null,
        ]);
        return $id;
    }

    // ── List ─────────────────────────────────────────────────────────────

    public function test_user_can_list_notifications(): void
    {
        $user = $this->makeUser('admin');
        $this->createNotification($user);
        $this->createNotification($user, true);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/notifications');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_user_only_sees_own_notifications(): void
    {
        $user1 = $this->makeUser('admin');
        $user2 = $this->makeUser('executive');

        $this->createNotification($user1);
        $this->createNotification($user2);

        Sanctum::actingAs($user1);

        $response = $this->getJson('/api/v1/notifications');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    // ── Unread count ─────────────────────────────────────────────────────

    public function test_unread_count_returns_correct_count(): void
    {
        $user = $this->makeUser('admin');
        $this->createNotification($user);          // unread
        $this->createNotification($user);          // unread
        $this->createNotification($user, true);    // read

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/notifications/unread-count');

        $response->assertOk()
            ->assertJsonPath('data.count', 2);
    }

    // ── Mark as read ─────────────────────────────────────────────────────

    public function test_mark_single_notification_as_read(): void
    {
        $user = $this->makeUser('admin');
        $id = $this->createNotification($user);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/v1/notifications/{$id}/read");

        $response->assertOk();
        $this->assertNotNull($user->notifications()->find($id)->read_at);
    }

    public function test_mark_all_notifications_as_read(): void
    {
        $user = $this->makeUser('admin');
        $this->createNotification($user);
        $this->createNotification($user);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/notifications/mark-all-read');

        $response->assertOk();
        $this->assertEquals(0, $user->unreadNotifications()->count());
    }

    // ── Delete ───────────────────────────────────────────────────────────

    public function test_delete_notification(): void
    {
        $user = $this->makeUser('admin');
        $id = $this->createNotification($user);

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/v1/notifications/{$id}");

        $response->assertOk();
        $this->assertNull($user->notifications()->find($id));
    }

    public function test_cannot_delete_other_users_notification(): void
    {
        $user1 = $this->makeUser('admin');
        $user2 = $this->makeUser('executive');
        $id = $this->createNotification($user2);

        Sanctum::actingAs($user1);

        $response = $this->deleteJson("/api/v1/notifications/{$id}");

        $response->assertStatus(404);
    }

    // ── Auth required ────────────────────────────────────────────────────

    public function test_unauthenticated_cannot_access_notifications(): void
    {
        $response = $this->getJson('/api/v1/notifications');
        $response->assertStatus(401);
    }
}
