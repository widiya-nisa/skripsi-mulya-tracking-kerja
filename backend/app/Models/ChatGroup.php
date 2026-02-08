<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'created_by',
        'is_private'
    ];

    protected $casts = [
        'is_private' => 'boolean',
    ];

    /**
     * Get the creator of the group
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all members of the group
     */
    public function members()
    {
        return $this->belongsToMany(User::class, 'chat_group_members', 'group_id', 'user_id')
                    ->withPivot('is_admin', 'joined_at')
                    ->withTimestamps();
    }

    /**
     * Get messages in this group
     */
    public function messages()
    {
        return $this->hasMany(Message::class, 'group_id');
    }

    /**
     * Check if user is member of this group
     */
    public function hasMember($userId)
    {
        return $this->members()->where('user_id', $userId)->exists();
    }

    /**
     * Check if user is admin of this group
     */
    public function isGroupAdmin($userId)
    {
        return $this->members()->where('user_id', $userId)->wherePivot('is_admin', true)->exists();
    }

    /**
     * Get last message
     */
    public function lastMessage()
    {
        return $this->hasOne(Message::class, 'group_id')->latest();
    }
}
