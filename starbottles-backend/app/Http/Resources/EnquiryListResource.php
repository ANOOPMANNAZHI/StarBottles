<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EnquiryListResource extends JsonResource
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
            'source'                => $this->source,
            'status'                => $this->status,
            'received_at'           => $this->received_at->diffForHumans(),
            'received_at_raw'       => $this->received_at->toIso8601String(),
            'follow_up_date'        => $this->follow_up_date?->toDateString(),
            'is_overdue'            => $isOverdue,
            'response_time_minutes' => $responseMinutes,
            'product_title'         => $this->whenLoaded('product', fn() => $this->product?->title),
            'assigned_to_name'      => $this->whenLoaded('assignedTo', fn() => $this->assignedTo?->name),
            'latest_note_snippet'   => $this->whenLoaded('latestNote', fn() =>
                $this->latestNote ? mb_substr($this->latestNote->note_text, 0, 80) : null
            ),
        ];
    }
}
