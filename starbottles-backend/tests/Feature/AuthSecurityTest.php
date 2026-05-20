<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Tests\Traits\SeedsRolesAndPermissions;

class AuthSecurityTest extends TestCase
{
    use RefreshDatabase, SeedsRolesAndPermissions;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRolesAndPermissions();
    }

    private function makeUser(string $role = 'executive'): User
    {
        $user = User::factory()->create(['role' => $role, 'is_active' => true]);
        $user->assignRole($role);
        return $user;
    }

    public function test_deactivated_user_token_returns_401_on_subsequent_requests(): void
    {
        $user = $this->makeUser();

        // Get a valid token
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email'    => $user->email,
            'password' => 'password',
        ]);
        $loginResponse->assertOk();
        $token = $loginResponse->json('data.token');

        // Deactivate the user
        $user->update(['is_active' => false]);

        // Subsequent request with the token must return 401
        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    }

    public function test_login_throttle_blocks_after_5_failed_attempts(): void
    {
        $user = $this->makeUser();

        // Make 5 failed attempts
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'email'    => $user->email,
                'password' => 'wrong_password',
            ]);
        }

        // 6th attempt should be rate-limited
        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => $user->email,
            'password' => 'wrong_password',
        ]);

        $response->assertStatus(429);
    }

    public function test_old_tokens_revoked_on_new_login(): void
    {
        $user = $this->makeUser();

        // First login
        $first = $this->postJson('/api/v1/auth/login', [
            'email'    => $user->email,
            'password' => 'password',
        ]);
        $first->assertOk();
        $token1 = $first->json('data.token');

        // Second login (revokes all old tokens)
        $second = $this->postJson('/api/v1/auth/login', [
            'email'    => $user->email,
            'password' => 'password',
        ]);
        $second->assertOk();
        $token2 = $second->json('data.token');

        $this->assertNotEquals($token1, $token2);

        // token1 must no longer work
        $response = $this->withHeaders(['Authorization' => "Bearer {$token1}"])
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    }

    public function test_password_not_exposed_in_any_api_response(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $admin->assignRole('admin');

        // /auth/me
        Sanctum::actingAs($admin);
        $meResponse = $this->getJson('/api/v1/auth/me');
        $meResponse->assertOk();
        $this->assertArrayNotHasKey('password', $meResponse->json('data'));

        // /users list
        $usersResponse = $this->getJson('/api/v1/users');
        $usersResponse->assertOk();
        foreach ($usersResponse->json('data') as $user) {
            $this->assertArrayNotHasKey('password', $user);
        }

        // login response
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email'    => $admin->email,
            'password' => 'password',
        ]);
        $loginResponse->assertOk();
        $this->assertArrayNotHasKey('password', $loginResponse->json('data.user'));
    }

    public function test_security_headers_present_on_api_responses(): void
    {
        $user = $this->makeUser();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/auth/me');

        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('X-XSS-Protection', '1; mode=block');
    }
}
