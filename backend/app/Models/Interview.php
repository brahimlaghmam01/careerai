<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Interview extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'status',
        'resume_text',
        'job_description',
        'experience_years',
        'skills',
        'questions',
        'answers',
        'scores',
        'report',
        'started_at',
        'completed_at',
        'duration_seconds',
    ];

    protected $casts = [
        'skills' => 'array',
        'questions' => 'array',
        'answers' => 'array',
        'scores' => 'array',
        'report' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}