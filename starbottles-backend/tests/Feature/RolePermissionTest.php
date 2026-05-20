<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Tests\Traits\SeedsRolesAndPermissions;

class RolePermissionTest extends TestCase
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

    // ── Permission listing ──────────────────────────────────────────────

    public function test_admin_can_list_permissions(): void
    {
        Sanctum::actingAs($this->makeUser('admin'));

        $response = $this->getJson('/api/v1/permissions');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertNotEmpty($data);
        // Check grouped structure
        $this->assertArrayHasKey('group', $data[0]);
        $this->assertArrayHasKey('permissions', $data[0]);
    }

    public function test_non_admin_cannot_list_permissions(): void
    {
        Sanctum::actingAs($this->makeUser('executive'));

        $this->getJson('/api/v1/permissions')->assertForbidden();
    }

    // ── Role listing ────────────────────────────────────────────────────

    public function test_admin_can_list_roles(): void
    {
        Sanctum::actingAs($this->makeUser('admin'));

        $response = $this->getJson('/api/v1/roles');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertCount(3, $data); // admin, executive, trainee
        $this->assertArrayHasKey('permissions', $data[0]);
        $this->assertArrayHasKey('users_count', $data[0]);
        $this->assertArrayHasKey('is_default', $data[0]);
    }

    // ── Role creation ───────────────────────────────────────────────────

    public function test_admin_can_create_custom_role(): void
    {
        Sanctum::actingAs($this->makeUser('admin'));

        $response = $this->postJson('/api/v1/roles', [
            'name'        => 'sales-manager',
            'permissions' => ['enquiries', 'reports', 'dashboard'],
        ]);

        $response->assertCreated();
        $this->assertEquals('sales-manager', $response->json('data.name'));
        $this->assertFalse($response->json('data.is_default'));
        $this->assertCount(3, $response->json('data.permissions'));

        $this->assertDatabaseHas('roles', ['name' => 'sales-manager']);
    }

    public function test_role_name_must_be_lowercase_hyphen(): void
    {
        Sanctum::actingAs($this->makeUser('admin'));

        $this->postJson('/api/v1/roles', [
            'name'        => 'Sales Manager',
            'permissions' => ['dashboard'],
        ])->assertUnprocessable();
    }

    public function test_role_name_must_be_unique(): void
    {
        Sanctum::actingAs($this->makeUser('admin'));

        $this->postJson('/api/v1/roles', [
            'name'        => 'admin',
            'permissions' => ['dashboard'],
        ])->assertUnprocessable();
    }

    // ── Role update ─────────────────────────────────────────────────────

    public function test_admin_can_update_role_permissions(): void
    {
        Sanctum::actingAs($this->makeUser('admin'));

        $executive = Role::findByName('executive', 'web');

        $response = $this->putJson("/api/v1/roles/{$executive->id}", [
            'permissions' => ['enquiries', 'reports', 'dashboard', 'training-view', 'quiz-view'],
        ]);

        $response->assertOk();
        $perms = $response->json('data.permissions');
        $this->assertContains('reports', $perms);
        $this->assertContains('dashboard', $perms);
    }

    public function test_admin_role_always_keeps_all_permissions(): void
    {
        Sanctum::actingAs($this->makeUser('admin'));

        $adminRole = Role::findByName('admin', 'web');

        $response = $this->putJson("/api/v1/roles/{$adminRole->id}", [
            'permissions' => ['dashboard'], // try to restrict admin
        ]);

        $response->assertOk();
        // Admin should still have all permissions
        $perms = $response->json('data.permissions');
        $this->assertGreaterThan(1, count($perms));
    }

    public function test_custom_role_can_be_renamed(): void
    {
        Sanctum::actingAs($this->makeUser('admin'));

        $this->postJson('/api/v1/roles', [
            'name'        => 'temp-role',
            'permissions' => ['dashboard'],
        ]);

        $role = Role::findByName('temp-role', 'web');

        $response = $this->putJson("/api/v1/roles/{$role->id}", [
            'name'        => 'new-role-name',
            'permissions' => ['dashboard', 'reports'],
        ]);

        $response->assertOk();
        $this->assertEquals('new-role-name', $response->json('data.name'));
    }

    // ── Role deletion ───────────────────────────────────────────────────

    public function test_default_roles_cannot_be_deleted(): void
    {
        Sanctum::actingAs($this->makeUser('admin'));

        $executive = Role::findByName('executive', 'web');

        $this->deleteJson("/api/v1/roles/{$executive->id}")
            ->assertUnprocessable();
    }

    public function test_custom_role_can_be_deleted(): void
    {
        Sanctum::actingAs($this->makeUser('admin'));

        $this->postJson('/api/v1/roles', [
            'name'        => 'deletable-role',
            'permissions' => ['dashboard'],
        ]);

        $role = Role::findByName('deletable-role', 'web');

        $this->deleteJson("/api/v1/roles/{$role->id}")->assertOk();
        $this->assertDatabaseMissing('roles', ['name' => 'deletable-role']);
    }

    public function test_role_with_users_cannot_be_deleted(): void
    {
        Sanctum::actingAs($this->makeUser('admin'));

        $this->postJson('/api/v1/roles', [
            'name'        => 'used-role',
            'permissions' => ['dashboard'],
        ]);

        $role = Role::findByName('used-role', 'web');

        // Simulate a user count by inserting directly with SQLite-compatible role
        // We check the DB count, so we insert with the custom role name
        \DB::table('users')->insert([
            'name' => 'Test', 'email' => 'test-used@test.com',
            'password' => bcrypt('pw'), 'role' => 'used-role',
            'is_active' => true, 'created_at' => now(), 'updated_at' => now(),
        ]);

        $this->deleteJson("/api/v1/roles/{$role->id}")
            ->assertUnprocessable();
    }

    // ── Permission-based access control ─────────────────────────────────

    public function test_user_permissions_returned_in_auth_me(): void
    {
        Sanctum::actingAs($this->makeUser('executive'));

        $response = $this->getJson('/api/v1/auth/me');

        $response->assertOk();
        $perms = $response->json('data.permissions');
        $this->assertIsArray($perms);
        $this->assertContains('enquiries', $perms);
        $this->assertNotContains('users', $perms);
    }

    public function test_permission_middleware_blocks_unauthorized(): void
    {
        $executive = $this->makeUser('executive');
        Sanctum::actingAs($executive);

        // Executive doesn't have 'users' permission
        $this->getJson('/api/v1/users')->assertForbidden();

        // Executive has 'enquiries' permission
        $this->getJson('/api/v1/enquiries')->assertOk();
    }

    public function test_admin_bypasses_permission_checks(): void
    {
        Sanctum::actingAs($this->makeUser('admin'));

        // Admin can access everything
        $this->getJson('/api/v1/users')->assertOk();
        $this->getJson('/api/v1/roles')->assertOk();
        $this->getJson('/api/v1/enquiries')->assertOk();
    }
}
