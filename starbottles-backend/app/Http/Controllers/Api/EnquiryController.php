<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\EnquiryListResource;
use App\Http\Resources\EnquiryNoteResource;
use App\Http\Resources\EnquiryResource;
use App\Models\Enquiry;
use App\Models\EnquiryNote;
use App\Models\User;
use App\Notifications\EnquiryAssignedNotification;
use App\Notifications\NewEnquiryReceivedNotification;
use App\Services\EnquiryAssignmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnquiryController extends BaseApiController
{
    private const VALID_STATUSES = ['new', 'contacted', 'follow_up_pending', 'qualified_lead', 'closed_won', 'closed_lost'];

    private function baseEagerLoads(): array
    {
        return ['product:id,title,images', 'assignedTo:id,name', 'latestNote'];
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Enquiry::with($this->baseEagerLoads())
            ->orderBy('received_at', 'desc');

        if ($user->hasRole('executive')) {
            $query->forExecutive($user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('source')) {
            $query->where('source', $request->input('source'));
        }

        if ($user->hasRole('admin') && $request->filled('assigned_to')) {
            $query->where('assigned_to', $request->input('assigned_to'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('received_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('received_at', '<=', $request->input('date_to'));
        }

        if ($request->filled('search')) {
            $q = $request->input('search');
            $query->where(function ($sub) use ($q) {
                $sub->where('customer_name', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%");
            });
        }

        $enquiries = $query->paginate(20);

        return $this->paginatedResponse(
            $enquiries->through(fn($e) => new EnquiryListResource($e))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_name' => 'required|string|max:255',
            'phone'         => 'required|string|max:50',
            'email'         => 'nullable|email|max:255',
            'product_id'    => 'nullable|exists:products,id',
            'message'       => 'nullable|string',
            'type'          => 'nullable|in:quote,callback',
        ]);

        $data['phone'] = preg_replace('/\D/', '', $data['phone']);

        $enquiry = Enquiry::create(array_merge($data, [
            'source'      => 'website',
            'status'      => 'new',
            'received_at' => now(),
        ]));

        // Auto-assign via round-robin and notify
        $this->assignAndNotify($enquiry);

        return $this->successResponse(new EnquiryResource($enquiry), 'Enquiry submitted', 201);
    }

    public function show(Request $request, Enquiry $enquiry): JsonResponse
    {
        $this->authorize('view', $enquiry);

        $enquiry->load(['product', 'assignedTo', 'notes', 'latestNote']);

        return $this->successResponse(new EnquiryResource($enquiry));
    }

    public function updateStatus(Request $request, Enquiry $enquiry): JsonResponse
    {
        $this->authorize('update', $enquiry);

        $data = $request->validate([
            'status'         => 'required|in:' . implode(',', self::VALID_STATUSES),
            'follow_up_date' => 'nullable|date',
        ]);

        if ($enquiry->status === 'new' && $enquiry->first_action_at === null) {
            $data['first_action_at'] = now();
        }

        $enquiry->update($data);
        $enquiry->load(['product', 'assignedTo', 'notes', 'latestNote']);

        return $this->successResponse(new EnquiryResource($enquiry));
    }

    public function assign(Request $request, Enquiry $enquiry): JsonResponse
    {
        $data = $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $target = User::find($data['assigned_to']);
        if (!$target || !$target->hasRole('executive') || !$target->is_active) {
            return $this->errorResponse('Target user must be an active executive.', 422);
        }

        $enquiry->update(['assigned_to' => $target->id]);
        $enquiry->load(['product', 'assignedTo', 'notes', 'latestNote']);

        return $this->successResponse(new EnquiryResource($enquiry));
    }

    public function addNote(Request $request, Enquiry $enquiry): JsonResponse
    {
        $this->authorize('addNote', $enquiry);

        $data = $request->validate([
            'note_text' => 'required|string|min:1',
        ]);

        $note = EnquiryNote::create([
            'enquiry_id' => $enquiry->id,
            'user_id'    => $request->user()->id,
            'note_text'  => $data['note_text'],
        ]);

        $note->load('user');

        return $this->successResponse(new EnquiryNoteResource($note), 'Note added', 201);
    }

    private function assignAndNotify(Enquiry $enquiry): void
    {
        $service = app(EnquiryAssignmentService::class);
        $executive = $service->autoAssign($enquiry);

        // Notify all admins about the new enquiry
        $admins = User::role('admin')->active()->get();
        foreach ($admins as $admin) {
            $admin->notify(new NewEnquiryReceivedNotification($enquiry));
        }

        // Notify assigned executive
        if ($executive) {
            $executive->notify(new EnquiryAssignedNotification($enquiry));
        }
    }
}
