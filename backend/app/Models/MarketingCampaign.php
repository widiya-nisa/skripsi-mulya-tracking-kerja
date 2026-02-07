<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarketingCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'status',
        'description',
        'budget',
        'spent',
        'target_reach',
        'actual_reach',
        'leads_generated',
        'conversions',
        'start_date',
        'end_date',
        'platforms',
        'created_by'
    ];

    protected $casts = [
        'budget' => 'decimal:2',
        'spent' => 'decimal:2',
        'target_reach' => 'integer',
        'actual_reach' => 'integer',
        'leads_generated' => 'integer',
        'conversions' => 'integer',
        'start_date' => 'date',
        'end_date' => 'date',
        'platforms' => 'array'
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
