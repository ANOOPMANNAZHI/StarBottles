<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enquiry;
use App\Models\EnquiryNote;
use App\Models\User;
use App\Notifications\EnquiryAssignedNotification;
use App\Notifications\NewEnquiryReceivedNotification;
use App\Services\EnquiryAssignmentService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function verify(Request $request): Response|string
    {
        $mode  = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');

        if ($mode === 'subscribe' && $token === config('whatsapp.verify_token')) {
            return response($request->query('hub_challenge'), 200);
        }

        abort(403);
    }

    public function receive(Request $request): Response
    {
        try {
            $rawBody = $request->getContent();
            $signature = $request->header('X-Hub-Signature-256', '');
            $expected = 'sha256=' . hash_hmac('sha256', $rawBody, config('whatsapp.app_secret'));

            if ($signature !== $expected) {
                Log::warning('WhatsApp webhook signature mismatch', [
                    'signature' => $signature,
                ]);
                return response('', 200);
            }

            $payload = $request->json()->all();
            $value   = $payload['entry'][0]['changes'][0]['value'] ?? [];
            $messages = $value['messages'] ?? [];

            if (empty($messages)) {
                return response('', 200);
            }

            $msg         = $messages[0];
            $phone       = $msg['from'] ?? '';
            $text        = $msg['text']['body'] ?? '';
            $contactName = $value['contacts'][0]['profile']['name'] ?? $phone;
            $timestamp   = isset($msg['timestamp'])
                ? Carbon::createFromTimestamp($msg['timestamp'])
                : now();

            $existing = Enquiry::where('phone', $phone)
                ->whereNotIn('status', ['closed_won', 'closed_lost'])
                ->latest()
                ->first();

            if ($existing) {
                EnquiryNote::create([
                    'enquiry_id' => $existing->id,
                    'user_id'    => null,
                    'note_text'  => "[WhatsApp] {$text}",
                ]);
            } else {
                $enquiry = Enquiry::create([
                    'customer_name' => $contactName,
                    'phone'         => $phone,
                    'source'        => 'whatsapp',
                    'status'        => 'new',
                    'received_at'   => $timestamp,
                ]);

                // Auto-assign via round-robin and notify
                $service = app(EnquiryAssignmentService::class);
                $executive = $service->autoAssign($enquiry);

                $admins = User::role('admin')->active()->get();
                foreach ($admins as $admin) {
                    $admin->notify(new NewEnquiryReceivedNotification($enquiry));
                }

                if ($executive) {
                    $executive->notify(new EnquiryAssignedNotification($enquiry));
                }
            }
        } catch (\Throwable $e) {
            Log::error('WhatsApp webhook processing error', ['error' => $e->getMessage()]);
        }

        return response('', 200);
    }
}
