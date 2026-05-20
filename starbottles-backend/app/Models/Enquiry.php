<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enquiry extends Model
{
    protected $fillable = [
        'customer_name',
        'phone',
        'email',
        'product_id',
        'message',
        'source',
        'type',
        'status',
        'assigned_to',
        'received_at',
        'first_action_at',
        'follow_up_date',
    ];

    protected function casts(): array
    {
        return [
            'received_at' => 'datetime',
            'first_action_at' => 'datetime',
            'follow_up_date' => 'date',
        ];
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function notes()
    {
        return $this->hasMany(EnquiryNote::class);
    }

    public function latestNote()
    {
        return $this->hasOne(EnquiryNote::class)->latestOfMany();
    }

    public function scopeForExecutive($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeUnassigned($query)
    {
        return $query->whereNull('assigned_to');
    }

    public function scopeOverdue($query)
    {
        return $query->where('follow_up_date', '<', today())
            ->whereNotIn('status', ['closed_won', 'closed_lost']);
    }
}
