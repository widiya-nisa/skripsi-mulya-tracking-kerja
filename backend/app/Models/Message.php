<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'group_id',
        'sender_id',
        'receiver_id',
        'team',
        'message',
        'attachment',
        'is_read',
        'read_at'
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime'
    ];

    // Relationships
    public function group()
    {
        return $this->belongsTo(ChatGroup::class, 'group_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    // Scopes
    public function scopeTeamMessages($query, $team)
    {
        return $query->where('team', $team)
                    ->whereNull('receiver_id');
    }

    public function scopePrivateMessages($query, $userId1, $userId2)
    {
        return $query->whereNull('team')
                    ->where(function($q) use ($userId1, $userId2) {
                        $q->where(function($q2) use ($userId1, $userId2) {
                            $q2->where('sender_id', $userId1)
                               ->where('receiver_id', $userId2);
                        })->orWhere(function($q2) use ($userId1, $userId2) {
                            $q2->where('sender_id', $userId2)
                               ->where('receiver_id', $userId1);
                        });
                    });
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    // Methods
    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now()
        ]);
    }
}
