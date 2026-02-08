<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nik',
        'full_name',
        'phone',
        'address',
        'city',
        'province',
        'postal_code',
        'birth_date',
        'birth_place',
        'gender',
        'marital_status',
        'join_date',
        'employee_id',
        'position',
        'employment_status',
        'salary',
        'last_education',
        'institution',
        'major',
        'graduation_year',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relation',
        'ktp_file',
        'ijazah_file',
        'cv_file',
        'photo',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'is_verified',
        'notes',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'join_date' => 'date',
        'is_verified' => 'boolean',
        'salary' => 'decimal:2',
    ];

    protected $hidden = [
        'salary', // Hide salary from general queries
    ];

    /**
     * Get the user that owns the profile
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get full address
     */
    public function getFullAddressAttribute()
    {
        $parts = array_filter([
            $this->address,
            $this->city,
            $this->province,
            $this->postal_code,
        ]);
        
        return implode(', ', $parts);
    }

    /**
     * Get age from birth date
     */
    public function getAgeAttribute()
    {
        return $this->birth_date ? $this->birth_date->age : null;
    }

    /**
     * Get work duration in years
     */
    public function getWorkDurationAttribute()
    {
        if (!$this->join_date) {
            return null;
        }
        
        $years = $this->join_date->diffInYears(now());
        $months = $this->join_date->copy()->addYears($years)->diffInMonths(now());
        
        return $years > 0 ? "{$years} tahun {$months} bulan" : "{$months} bulan";
    }
}
