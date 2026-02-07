<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_name',
        'owner_name',
        'email',
        'phone',
        'address',
        'city',
        'province',
        'category',
        'package',
        'status',
        'monthly_revenue',
        'total_products',
        'marketplace_link',
        'sales_person_id',
        'join_date'
    ];

    protected $casts = [
        'monthly_revenue' => 'decimal:2',
        'total_products' => 'integer',
        'join_date' => 'date'
    ];

    public function salesPerson()
    {
        return $this->belongsTo(User::class, 'sales_person_id');
    }
}
