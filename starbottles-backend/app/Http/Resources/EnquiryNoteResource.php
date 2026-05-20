<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EnquiryNoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'note_text'  => $this->note_text,
            'created_at' => $this->created_at->toIso8601String(),
            'author'     => $this->whenLoaded('user', fn() =>
                $this->user ? ['id' => $this->user->id, 'name' => $this->user->name] : null
            ),
        ];
    }
}
