<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizTest extends Model
{
    protected $fillable = [
        'title',
        'description',
        'passing_score',
        'created_by',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function questions()
    {
        return $this->hasMany(QuizQuestion::class, 'quiz_id');
    }

    public function attempts()
    {
        return $this->hasMany(QuizAttempt::class, 'quiz_id');
    }

    public function assignments()
    {
        return $this->hasMany(QuizTestAssignment::class, 'quiz_id');
    }
}
