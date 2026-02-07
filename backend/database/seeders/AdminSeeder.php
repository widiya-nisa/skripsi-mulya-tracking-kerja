<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Admin
        $admin = User::create([
            'name' => 'Admin System',
            'email' => 'admin@trackingkerja.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'department' => null,
            'job_description' => 'Mengelola seluruh sistem, user management, reset password, dan monitoring overall performance perusahaan',
            'email_verified_at' => now(),
        ]);

        // 2. Create CEO
        $ceo = User::create([
            'name' => 'Direktur Utama',
            'email' => 'ceo@trackingkerja.com',
            'password' => Hash::make('password'),
            'role' => 'ceo',
            'department' => null,
            'job_description' => 'Memimpin perusahaan, membuat keputusan strategis, dan monitoring seluruh operasional perusahaan',
            'email_verified_at' => now(),
        ]);

        // 3. Create Manager IT
        $managerIT = User::create([
            'name' => 'Budi Manager IT',
            'email' => 'budi.manager@trackingkerja.com',
            'password' => Hash::make('password'),
            'role' => 'manager',
            'department' => 'it',
            'job_description' => 'Memasukkan target kerja untuk tim IT, monitoring progress, dan evaluasi kinerja tim',
            'email_verified_at' => now(),
        ]);

        // 4. Create Manager Operasional
        $managerOperasional = User::create([
            'name' => 'Hendra Manager Operasional',
            'email' => 'hendra.manager@trackingkerja.com',
            'password' => Hash::make('password'),
            'role' => 'manager',
            'department' => 'operasional',
            'job_description' => 'Membuat target operasional dan pemasaran, monitoring ide dan pencapaian target',
            'email_verified_at' => now(),
        ]);

        // 5. Create Karyawan IT Team (under Manager IT)
        User::create([
            'name' => 'Andi Frontend Developer',
            'email' => 'andi.frontend@trackingkerja.com',
            'password' => Hash::make('password'),
            'role' => 'karyawan',
            'department' => 'frontend',
            'manager_id' => $managerIT->id,
            'job_description' => 'Mengerjakan development frontend, UI/UX implementation, dan upload progress kerja',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Siti Backend Developer',
            'email' => 'siti.backend@trackingkerja.com',
            'password' => Hash::make('password'),
            'role' => 'karyawan',
            'department' => 'backend',
            'manager_id' => $managerIT->id,
            'job_description' => 'Mengerjakan development backend, API, database, dan upload progress kerja',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Rudi Mobile Developer',
            'email' => 'rudi.mobile@trackingkerja.com',
            'password' => Hash::make('password'),
            'role' => 'karyawan',
            'department' => 'mobile',
            'manager_id' => $managerIT->id,
            'job_description' => 'Mengerjakan development mobile app (Android/iOS), dan upload progress kerja',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Dewi Business Analyst',
            'email' => 'dewi.ba@trackingkerja.com',
            'password' => Hash::make('password'),
            'role' => 'karyawan',
            'department' => 'business_analyst',
            'manager_id' => $managerIT->id,
            'job_description' => 'Menganalisa requirement bisnis, dokumentasi, testing, dan upload progress kerja',
            'email_verified_at' => now(),
        ]);

        // 6. Create Karyawan Operasional (under Manager Operasional)
        User::create([
            'name' => 'Rina Staff Operasional',
            'email' => 'rina.staff@trackingkerja.com',
            'password' => Hash::make('password'),
            'role' => 'karyawan',
            'department' => 'pemasaran',
            'manager_id' => $managerOperasional->id,
            'job_description' => 'Membuat ide kreatif untuk pemasaran, tracking target, dan upload progress',
            'email_verified_at' => now(),
        ]);
    }
}
