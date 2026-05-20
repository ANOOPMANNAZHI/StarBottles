<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizTestAssignment extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'quiz_id',
        'trainee_id',
        'assigned_by',
        'assigned_at',
        'retake_approved',
    ];

    protected function casts(): array
    {
        return [
            'assigned_at' => 'datetime',
            'retake_approved' => 'boolean',
        ];
    }

    public function quiz()
    {
        return $this->belongsTo(QuizTest::class, 'quiz_id');
    }

    public function trainee()
    {
        return $this->belongsTo(User::class, 'trainee_id');
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
