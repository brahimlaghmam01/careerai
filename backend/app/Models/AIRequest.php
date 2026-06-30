<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AIRequest extends Model
{
    use HasFactory;

    protected $table = 'ai_requests';

    protected $fillable = [
        'user_id', 'status', 'prompt', 'response'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
