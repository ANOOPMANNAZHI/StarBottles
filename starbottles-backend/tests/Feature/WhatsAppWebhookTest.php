<?php

namespace Tests\Feature;

use App\Models\Enquiry;
use App\Models\EnquiryNote;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class WhatsAppWebhookTest extends TestCase
{
    use RefreshDatabase;

    private function webhookPayload(string $phone, string $text, string $name = 'Test User'): array
    {
        return [
            'entry' => [[
                'changes' => [[
                    'value' => [
                        'contacts' => [[
                            'profile' => ['name' => $name],
                        ]],
                        'messages' => [[
                            'from'      => $phone,
                            'timestamp' => now()->timestamp,
                            'text'      => ['body' => $text],
                        ]],
                    ],
                ]],
            ]],
        ];
    }

    private function signature(string $body): string
    {
        return 'sha256=' . hash_hmac('sha256', $body, config('whatsapp.app_secret'));
    }

    // ── Verify endpoint ───────────────────────────────────────────────────

    public function test_verify_endpoint_returns_challenge_with_correct_token(): void
    {
        config(['whatsapp.verify_token' => 'my-token']);

        $response = $this->get('/api/v1/webhooks/whatsapp?hub_mode=subscribe&hub_verify_token=my-token&hub_challenge=ABCD1234');

        $response->assertOk()
            ->assertSee('ABCD1234');
    }

    public function test_verify_endpoint_returns_403_with_wrong_token(): void
    {
        config(['whatsapp.verify_token' => 'correct-token']);

        $response = $this->get('/api/v1/webhooks/whatsapp?hub_mode=subscribe&hub_verify_token=wrong-token&hub_challenge=ABCD1234');

        $response->assertStatus(403);
    }

    // ── Receive endpoint ──────────────────────────────────────────────────

    public function test_receive_with_invalid_signature_logs_warning_and_returns_200(): void
    {
        config(['whatsapp.app_secret' => 'real-secret']);
        Log::spy();

        $body = json_encode($this->webhookPayload('9876543210', 'Hello'));

        $response = $this->call('POST', '/api/v1/webhooks/whatsapp', [], [], [], [
            'HTTP_X-Hub-Signature-256' => 'sha256=invalidsignature',
            'CONTENT_TYPE'             => 'application/json',
        ], $body);

        $response->assertOk();
        $this->assertDatabaseCount('enquiries', 0);
        Log::shouldHaveReceived('warning')->with('WhatsApp webhook signature mismatch', \Mockery::any())->once();
    }

    public function test_receive_creates_new_enquiry_for_new_phone(): void
    {
        config(['whatsapp.app_secret' => 'test-secret']);
        $body = json_encode($this->webhookPayload('9111111111', 'I want bottles'));

        $response = $this->call('POST', '/api/v1/webhooks/whatsapp', [], [], [], [
            'HTTP_X-Hub-Signature-256' => $this->signature($body),
            'CONTENT_TYPE'             => 'application/json',
        ], $body);

        $response->assertOk();
        $this->assertDatabaseHas('enquiries', [
            'phone'  => '9111111111',
            'source' => 'whatsapp',
            'status' => 'new',
        ]);
    }

    public function test_receive_adds_note_to_existing_open_enquiry(): void
    {
        config(['whatsapp.app_secret' => 'test-secret']);

        $enquiry = Enquiry::create([
            'customer_name' => 'Existing Customer',
            'phone'         => '9222222222',
            'source'        => 'whatsapp',
            'status'        => 'contacted',
            'received_at'   => now()->subDay(),
        ]);

        $body = json_encode($this->webhookPayload('9222222222', 'Following up on my order'));

        $this->call('POST', '/api/v1/webhooks/whatsapp', [], [], [], [
            'HTTP_X-Hub-Signature-256' => $this->signature($body),
            'CONTENT_TYPE'             => 'application/json',
        ], $body)->assertOk();

        $this->assertDatabaseCount('enquiries', 1);
        $this->assertDatabaseHas('enquiry_notes', [
            'enquiry_id' => $enquiry->id,
            'user_id'    => null,
            'note_text'  => '[WhatsApp] Following up on my order',
        ]);
    }

    public function test_receive_creates_new_enquiry_after_closed_enquiry(): void
    {
        config(['whatsapp.app_secret' => 'test-secret']);

        Enquiry::create([
            'customer_name' => 'Old Customer',
            'phone'         => '9333333333',
            'source'        => 'whatsapp',
            'status'        => 'closed_won',
            'received_at'   => now()->subMonth(),
        ]);

        $body = json_encode($this->webhookPayload('9333333333', 'Need more bottles'));

        $this->call('POST', '/api/v1/webhooks/whatsapp', [], [], [], [
            'HTTP_X-Hub-Signature-256' => $this->signature($body),
            'CONTENT_TYPE'             => 'application/json',
        ], $body)->assertOk();

        $this->assertDatabaseCount('enquiries', 2);
    }

    public function test_receive_returns_200_even_on_processing_error(): void
    {
        config(['whatsapp.app_secret' => 'test-secret']);
        $body = json_encode(['malformed' => 'payload']);

        $response = $this->call('POST', '/api/v1/webhooks/whatsapp', [], [], [], [
            'HTTP_X-Hub-Signature-256' => $this->signature($body),
            'CONTENT_TYPE'             => 'application/json',
        ], $body);

        $response->assertOk();
    }
}
