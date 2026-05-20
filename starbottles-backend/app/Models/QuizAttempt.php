<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizAttempt extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'quiz_id',
        'trainee_id',
        'answers',
        'score',
        'passed',
        'attempted_at',
    ];

    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'passed' => 'boolean',
            'attempted_at' => 'datetime',
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
}
