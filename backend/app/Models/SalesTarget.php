<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesTarget extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'period',
        'period_type',
        'target_revenue',
        'target_new_customers',
        'target_leads',
        'actual_revenue',
        'actual_new_customers',
        'actual_leads'
    ];

    protected $casts = [
        'target_revenue' => 'decimal:2',
        'target_new_customers' => 'integer',
        'target_leads' => 'integer',
        'actual_revenue' => 'decimal:2',
        'actual_new_customers' => 'integer',
        'actual_leads' => 'integer'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
