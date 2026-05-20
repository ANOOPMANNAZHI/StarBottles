<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageContent extends Model
{
    protected $fillable = [
        'page_slug',
        'section_key',
        'content_type',
        'content',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
        ];
    }

    public function scopeForPage($query, string $slug)
    {
        return $query->where('page_slug', $slug)->orderBy('display_order');
    }
}
