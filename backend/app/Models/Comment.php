<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = [
        'work_progress_id',
        'user_id',
        'parent_id',
        'comment',
    ];

    // Relationships
    public function workProgress()
    {
        return $this->belongsTo(WorkProgress::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Parent comment (for replies)
    public function parent()
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    // Child comments (replies)
    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_id')->with(['user', 'replies']);
    }
}
