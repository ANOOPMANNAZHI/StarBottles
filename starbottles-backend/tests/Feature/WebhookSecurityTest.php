<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebhookSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_whatsapp_webhook_verify_rejects_wrong_token(): void
    {
        $response = $this->get('/api/v1/webhooks/whatsapp?' . http_build_query([
            'hub_mode'         => 'subscribe',
            'hub_verify_token' => 'wrong_token_value',
            'hub_challenge'    => 'challenge123',
        ]));

        $response->assertStatus(403);
    }

    public function test_whatsapp_webhook_receive_rejects_invalid_signature(): void
    {
        $response = $this->withHeaders([
            'X-Hub-Signature-256' => 'sha256=invalid_signature',
        ])->postJson('/api/v1/webhooks/whatsapp', [
            'entry' => [['changes' => [['value' => ['messages' => []]]]]]
        ]);

        // Returns 200 (don't retry) but does NOT create an enquiry
        $response->assertStatus(200);
        $this->assertDatabaseMissing('enquiries', ['source' => 'whatsapp']);
    }

    public function test_whatsapp_webhook_receive_rejects_missing_signature(): void
    {
        $response = $this->postJson('/api/v1/webhooks/whatsapp', [
            'entry' => [['changes' => [['value' => [
                'messages' => [['from' => '9999999999', 'text' => ['body' => 'hi']]],
                'contacts' => [['profile' => ['name' => 'Test']]],
            ]]]]]
        ]);

        // Missing signature → mismatch → 200 but no enquiry created
        $response->assertStatus(200);
        $this->assertDatabaseMissing('enquiries', ['phone' => '9999999999']);
    }

    public function test_whatsapp_webhook_always_returns_200_to_prevent_retries(): void
    {
        // Even with a bad signature and garbage payload, receive always returns 200
        $response = $this->withHeaders([
            'X-Hub-Signature-256' => 'sha256=completelyinvalid',
        ])->postJson('/api/v1/webhooks/whatsapp', ['garbage' => true]);

        $response->assertStatus(200);
    }

    public function test_webhook_routes_are_accessible_without_authentication(): void
    {
        // GET verify without auth (wrong token → 403 from logic, not 401 from auth)
        $response = $this->get('/api/v1/webhooks/whatsapp?hub_mode=subscribe&hub_verify_token=wrong&hub_challenge=x');
        $this->assertNotEquals(401, $response->getStatusCode(), 'Webhook verify should not return 401 auth error');

        // POST receive without auth → always 200
        $response = $this->post('/api/v1/webhooks/whatsapp', []);
        $response->assertStatus(200);
    }

    public function test_webhook_routes_are_excluded_from_csrf_protection(): void
    {
        // API routes are CSRF-exempt by default in Laravel
        // Sending without CSRF token must not return 419
        $response = $this->post('/api/v1/webhooks/whatsapp', []);
        $this->assertNotEquals(419, $response->getStatusCode(), 'Webhook should be CSRF-exempt');
        $response->assertStatus(200);
    }
}
