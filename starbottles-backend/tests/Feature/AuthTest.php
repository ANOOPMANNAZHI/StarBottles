<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Tests\Traits\SeedsRolesAndPermissions;

class AuthTest extends TestCase
{
    use RefreshDatabase, SeedsRolesAndPermissions;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedRolesAndPermissions();
    }

    private function createUser(array $overrides = []): User
    {
        $user = User::create(array_merge([
            'name'      => 'Test User',
            'email'     => 'test@example.com',
            'phone'     => null,
            'password'  => Hash::make('password'),
            'role'      => 'executive',
            'is_active' => true,
        ], $overrides));

        $user->assignRole($overrides['role'] ?? 'executive');

        return $user;
    }

    public function test_successful_login_returns_token_and_user_role(): void
    {
        $user = $this->createUser(['role' => 'admin']);

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'token',
                    'token_type',
                    'user' => ['id', 'name', 'email', 'role'],
                ],
            ])
            ->assertJsonPath('data.user.role', 'admin')
            ->assertJsonPath('data.token_type', 'Bearer');
    }

    public function test_inactive_user_gets_403_on_login(): void
    {
        $this->createUser(['is_active' => false]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    public function test_wrong_password_returns_422(): void
    {
        $this->createUser();

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'test@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_unknown_email_returns_422(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'nobody@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_logout_revokes_token(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('auth-token')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/v1/auth/logout')
            ->assertStatus(200);

        // Reset the auth guard cache so the next request re-checks the database
        $this->app['auth']->forgetGuards();

        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertStatus(401);
    }

    public function test_rate_limit_triggers_after_5_failed_attempts(): void
    {
        RateLimiter::clear('login.' . request()->ip());

        $this->createUser();

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'email'    => 'test@example.com',
                'password' => 'wrong-password',
            ]);
        }

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'test@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(429)
            ->assertJsonPath('success', false)
            ->assertJsonStructure(['errors' => ['retry_after']]);
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/v1/auth/me')
            ->assertStatus(401);
    }

    public function test_me_returns_correct_authenticated_user(): void
    {
        $user = $this->createUser(['email' => 'auth@example.com', 'role' => 'trainee']);

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email'    => 'auth@example.com',
            'password' => 'password',
        ]);

        $token = $loginResponse->json('data.token');

        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertStatus(200)
            ->assertJsonPath('data.email', 'auth@example.com')
            ->assertJsonPath('data.role', 'trainee');
    }
}
