<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ErpSyncLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'status',
        'products_added',
        'products_updated',
        'categories_synced',
        'error_message',
        'synced_at',
    ];

    protected function casts(): array
    {
        return [
            'synced_at' => 'datetime',
        ];
    }
}
