<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Tests\Traits\SeedsRolesAndPermissions;

class UserManagementTest extends TestCase
{
    use RefreshDatabase, SeedsRolesAndPermissions;

    protected User $admin;
    protected User $executive;
    protected User $trainee;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedRolesAndPermissions();

        $this->admin = $this->makeUser('admin@example.com', 'admin');
        $this->executive = $this->makeUser('exec@example.com', 'executive');
        $this->trainee = $this->makeUser('trainee@example.com', 'trainee');
    }

    private function makeUser(string $email, string $role): User
    {
        $user = User::create([
            'name'      => ucfirst($role) . ' User',
            'email'     => $email,
            'password'  => Hash::make('password'),
            'role'      => $role,
            'is_active' => true,
        ]);
        $user->assignRole($role);
        return $user;
    }

    // ── Access control ────────────────────────────────────────────────────

    public function test_executive_cannot_access_user_list(): void
    {
        Sanctum::actingAs($this->executive);

        $this->getJson('/api/v1/users')->assertStatus(403);
    }

    public function test_trainee_cannot_access_user_list(): void
    {
        Sanctum::actingAs($this->trainee);

        $this->getJson('/api/v1/users')->assertStatus(403);
    }

    public function test_admin_can_list_all_users(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/v1/users');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data', 'meta' => ['pagination']]);
    }

    // ── Filtering ─────────────────────────────────────────────────────────

    public function test_search_filter_returns_matching_users(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/v1/users?search=exec');

        $response->assertStatus(200);

        $names = collect($response->json('data'))->pluck('name')->all();
        $this->assertNotEmpty($names);
        foreach ($names as $name) {
            $this->assertStringContainsStringIgnoringCase('exec', $name);
        }
    }

    public function test_role_filter_returns_correct_users(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/v1/users?role=trainee');

        $response->assertStatus(200);

        $roles = collect($response->json('data'))->pluck('role')->all();
        $this->assertNotEmpty($roles);
        foreach ($roles as $role) {
            $this->assertSame('trainee', $role);
        }
    }

    // ── Create ────────────────────────────────────────────────────────────

    public function test_admin_can_create_executive_user(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/v1/users', [
            'name'  => 'New Executive',
            'email' => 'newexec@example.com',
            'phone' => '9876543210',
            'role'  => 'executive',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.user.role', 'executive')
            ->assertJsonStructure(['data' => ['user', 'temporary_password']]);

        $this->assertDatabaseHas('users', ['email' => 'newexec@example.com']);
    }

    public function test_admin_can_create_trainee_user(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/v1/users', [
            'name'  => 'New Trainee',
            'email' => 'newtrainee@example.com',
            'phone' => '1234567890',
            'role'  => 'trainee',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.user.role', 'trainee');
    }

    public function test_admin_cannot_create_admin_user(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/v1/users', [
            'name'  => 'Rogue Admin',
            'email' => 'rogue@example.com',
            'phone' => '1111111111',
            'role'  => 'admin',
        ]);

        $response->assertStatus(422);
    }

    // ── Update ────────────────────────────────────────────────────────────

    public function test_admin_can_update_user_name_and_phone(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->putJson("/api/v1/users/{$this->executive->id}", [
            'name'  => 'Updated Name',
            'phone' => '5555555555',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Name');

        $this->assertDatabaseHas('users', ['id' => $this->executive->id, 'name' => 'Updated Name']);
    }

    public function test_admin_can_change_user_role_between_executive_and_trainee(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->putJson("/api/v1/users/{$this->executive->id}", [
            'role' => 'trainee',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.role', 'trainee');
    }

    public function test_admin_cannot_change_own_role(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->putJson("/api/v1/users/{$this->admin->id}", [
            'role' => 'executive',
        ]);

        $response->assertStatus(403);
    }

    // ── Toggle active ─────────────────────────────────────────────────────

    public function test_admin_can_deactivate_user(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->patchJson("/api/v1/users/{$this->executive->id}/toggle-active");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_active', false);
    }

    public function test_admin_cannot_deactivate_themselves(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->patchJson("/api/v1/users/{$this->admin->id}/toggle-active");

        $response->assertStatus(403);
    }

    // ── Reset password ────────────────────────────────────────────────────

    public function test_reset_password_returns_temporary_password(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson("/api/v1/users/{$this->executive->id}/reset-password");

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['message', 'temporary_password']]);

        $temp = $response->json('data.temporary_password');
        $this->assertNotEmpty($temp);
        $this->assertSame(10, strlen($temp));
    }
}
