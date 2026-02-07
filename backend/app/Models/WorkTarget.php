<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkTarget extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'manager_id',
        'assigned_to',
        'priority',
        'status',
        'deadline',
    ];

    protected $casts = [
        'deadline' => 'date',
    ];

    protected $appends = ['current_percentage'];

    // Relationships
    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function progress()
    {
        return $this->hasMany(WorkProgress::class);
    }

    public function latestProgress()
    {
        return $this->hasOne(WorkProgress::class)->latestOfMany();
    }

    // Accessor untuk current percentage
    public function getCurrentPercentageAttribute()
    {
        $latest = $this->latestProgress;
        return $latest ? $latest->percentage : 0;
    }
}
