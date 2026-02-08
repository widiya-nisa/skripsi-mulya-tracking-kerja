<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkProgress extends Model
{
    use HasFactory;

    protected $fillable = [
        'work_target_id',
        'user_id',
        'progress_note',
        'attachment',
        'percentage',
    ];

    protected $casts = [
        'percentage' => 'integer',
    ];

    // Relationships
    public function workTarget()
    {
        return $this->belongsTo(WorkTarget::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function attachments()
    {
        return $this->hasMany(ProgressAttachment::class);
    }
}
