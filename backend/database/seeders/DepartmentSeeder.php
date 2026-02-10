<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            // IT Departments
            [
                'name' => 'Frontend Developer',
                'description' => 'Mengembangkan antarmuka pengguna website dan aplikasi',
                'type' => 'it',
            ],
            [
                'name' => 'Backend Developer',
                'description' => 'Mengembangkan server-side logic dan database',
                'type' => 'it',
            ],
            [
                'name' => 'Mobile Developer',
                'description' => 'Mengembangkan aplikasi mobile Android dan iOS',
                'type' => 'it',
            ],
            [
                'name' => 'Business Analyst',
                'description' => 'Analisis kebutuhan bisnis dan requirement',
                'type' => 'it',
            ],
            [
                'name' => 'QA Tester',
                'description' => 'Quality Assurance dan testing aplikasi',
                'type' => 'it',
            ],
            [
                'name' => 'DevOps Engineer',
                'description' => 'Deployment, monitoring, dan infrastructure',
                'type' => 'it',
            ],
            [
                'name' => 'UI/UX Designer',
                'description' => 'Desain antarmuka dan pengalaman pengguna',
                'type' => 'it',
            ],
            
            // Operasional Departments
            [
                'name' => 'Customer Service',
                'description' => 'Melayani customer dan menangani keluhan',
                'type' => 'operasional',
            ],
            [
                'name' => 'Marketing Staff',
                'description' => 'Promosi dan pemasaran produk',
                'type' => 'operasional',
            ],
            [
                'name' => 'Sales Executive',
                'description' => 'Penjualan dan akuisisi customer',
                'type' => 'operasional',
            ],
            [
                'name' => 'Content Creator',
                'description' => 'Membuat konten marketing dan promosi',
                'type' => 'operasional',
            ],
            [
                'name' => 'Admin',
                'description' => 'Administrasi umum dan dokumentasi',
                'type' => 'operasional',
            ],
            [
                'name' => 'Finance Staff',
                'description' => 'Keuangan dan accounting',
                'type' => 'operasional',
            ],
            [
                'name' => 'HR Staff',
                'description' => 'Human Resource dan rekrutmen',
                'type' => 'operasional',
            ],

            // Management/Leadership Departments
            [
                'name' => 'System Administrator',
                'description' => 'Mengelola sistem, user, dan hak akses aplikasi',
                'type' => 'admin',
            ],
            [
                'name' => 'CEO / Direktur',
                'description' => 'Memimpin perusahaan dan membuat keputusan strategis',
                'type' => 'ceo',
            ],
        ];

        foreach ($departments as $dept) {
            // Check if department already exists
            if (!Department::where('name', $dept['name'])->exists()) {
                Department::create($dept);
            }
        }

        $this->command->info('Departments seeded successfully!');
    }
}
