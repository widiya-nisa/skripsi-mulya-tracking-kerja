<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'business_name',
        'email',
        'phone',
        'whatsapp',
        'source',
        'status',
        'interest',
        'estimated_value',
        'notes',
        'assigned_to',
        'last_contact',
        'next_followup'
    ];

    protected $casts = [
        'estimated_value' => 'decimal:2',
        'last_contact' => 'datetime',
        'next_followup' => 'datetime'
    ];

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
