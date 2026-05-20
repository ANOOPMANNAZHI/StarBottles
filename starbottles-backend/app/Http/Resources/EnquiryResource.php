<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EnquiryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $closedStatuses = ['closed_won', 'closed_lost'];
        $isOverdue = $this->follow_up_date
            && $this->follow_up_date->isPast()
            && !in_array($this->status, $closedStatuses);

        $responseMinutes = null;
        if ($this->first_action_at && $this->received_at) {
            $responseMinutes = (int) $this->received_at->diffInMinutes($this->first_action_at);
        }

        return [
            'id'                    => $this->id,
            'customer_name'         => $this->customer_name,
            'phone'                 => $this->phone,
            'email'                 => $this->email,
            'message'               => $this->message,
            'source'                => $this->source,
            'type'                  => $this->type,
            'status'                => $this->status,
            'received_at'           => $this->received_at->diffForHumans(),
            'received_at_raw'       => $this->received_at->toIso8601String(),
            'first_action_at'       => $this->first_action_at?->toIso8601String(),
            'follow_up_date'        => $this->follow_up_date?->toDateString(),
            'is_overdue'            => $isOverdue,
            'response_time_minutes' => $responseMinutes,
            'product'               => $this->whenLoaded('product', fn() =>
                $this->product ? new ProductListResource($this->product) : null
            ),
            'assigned_to'           => $this->whenLoaded('assignedTo', fn() =>
                $this->assignedTo ? [
                    'id'    => $this->assignedTo->id,
                    'name'  => $this->assignedTo->name,
                    'phone' => $this->assignedTo->phone,
                ] : null
            ),
            'latest_note_snippet'   => $this->whenLoaded('latestNote', fn() =>
                $this->latestNote ? mb_substr($this->latestNote->note_text, 0, 80) : null
            ),
            'notes'                 => $this->whenLoaded('notes', fn() =>
                EnquiryNoteResource::collection(
                    $this->notes->load('user')->sortBy('created_at')->values()
                )
            ),
        ];
    }
}
