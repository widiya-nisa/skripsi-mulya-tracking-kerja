<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class KaryawanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get manager IT and manager Operasional
        $managerIT = User::where('role', 'manager')->where('department', 'it')->first();
        $managerOperasional = User::where('role', 'manager')->where('department', 'operasional')->first();

        // Create karyawan IT
        $karyawanIT = [
            [
                'name' => 'Budi Developer',
                'email' => 'budi@trackingkerja.com',
                'password' => Hash::make('password123'),
                'role' => 'karyawan',
                'department' => 'it',
                'job_description' => 'Frontend Developer',
                'manager_id' => $managerIT ? $managerIT->id : null,
            ],
            [
                'name' => 'Siti Developer',
                'email' => 'siti@trackingkerja.com',
                'password' => Hash::make('password123'),
                'role' => 'karyawan',
                'department' => 'it',
                'job_description' => 'Backend Developer',
                'manager_id' => $managerIT ? $managerIT->id : null,
            ],
            [
                'name' => 'Andi Tester',
                'email' => 'andi@trackingkerja.com',
                'password' => Hash::make('password123'),
                'role' => 'karyawan',
                'department' => 'it',
                'job_description' => 'QA Tester',
                'manager_id' => $managerIT ? $managerIT->id : null,
            ],
        ];

        // Create karyawan Operasional
        $karyawanOperasional = [
            [
                'name' => 'Rini Sales',
                'email' => 'rini@trackingkerja.com',
                'password' => Hash::make('password123'),
                'role' => 'karyawan',
                'department' => 'operasional',
                'job_description' => 'Sales Executive',
                'manager_id' => $managerOperasional ? $managerOperasional->id : null,
            ],
            [
                'name' => 'Deni Marketing',
                'email' => 'deni@trackingkerja.com',
                'password' => Hash::make('password123'),
                'role' => 'karyawan',
                'department' => 'operasional',
                'job_description' => 'Marketing Staff',
                'manager_id' => $managerOperasional ? $managerOperasional->id : null,
            ],
            [
                'name' => 'Lisa CS',
                'email' => 'lisa@trackingkerja.com',
                'password' => Hash::make('password123'),
                'role' => 'karyawan',
                'department' => 'operasional',
                'job_description' => 'Customer Service',
                'manager_id' => $managerOperasional ? $managerOperasional->id : null,
            ],
        ];

        // Insert karyawan
        foreach ($karyawanIT as $karyawan) {
            // Check if email already exists
            if (!User::where('email', $karyawan['email'])->exists()) {
                User::create($karyawan);
            }
        }

        foreach ($karyawanOperasional as $karyawan) {
            // Check if email already exists
            if (!User::where('email', $karyawan['email'])->exists()) {
                User::create($karyawan);
            }
        }

        $this->command->info('Karyawan seeded successfully!');
    }
}
