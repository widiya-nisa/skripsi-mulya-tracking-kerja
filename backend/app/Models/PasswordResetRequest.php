<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PasswordResetRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'name',
        'reason',
        'status',
        'new_password',
        'approved_by',
        'approved_at',
        'admin_notes',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function user()
    {
        return $this->hasOne(User::class, 'email', 'email');
    }
}
