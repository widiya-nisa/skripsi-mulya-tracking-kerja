<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\WorkTarget;
use App\Models\WorkProgress;

class ManagerITTargetSeeder extends Seeder
{
    public function run()
    {
        // Get Manager IT
        $managerIT = User::where('role', 'manager')
            ->where('department', 'it')
            ->first();

        if (!$managerIT) {
            $this->command->error('Manager IT tidak ditemukan!');
            return;
        }

        // Get karyawan IT
        $karyawanIT = User::where('manager_id', $managerIT->id)->get();

        if ($karyawanIT->isEmpty()) {
            $this->command->error('Tidak ada karyawan IT!');
            return;
        }

        $this->command->info("Manager IT: {$managerIT->name}");
        $this->command->info("Jumlah karyawan: {$karyawanIT->count()}");

        // Buat 2 target untuk setiap karyawan
        foreach ($karyawanIT as $karyawan) {
            // Target 1: Develop Feature
            $target1 = WorkTarget::create([
                'assigned_to' => $karyawan->id,
                'manager_id' => $managerIT->id,
                'title' => 'Develop New Feature - ' . $karyawan->name,
                'description' => 'Mengembangkan fitur baru sesuai requirement yang diberikan',
                'deadline' => now()->addDays(14),
                'status' => 'in_progress'
            ]);

            // Target 2: Code Review & Testing
            $target2 = WorkTarget::create([
                'assigned_to' => $karyawan->id,
                'manager_id' => $managerIT->id,
                'title' => 'Code Review & Testing - ' . $karyawan->name,
                'description' => 'Review code dan testing aplikasi untuk memastikan kualitas',
                'deadline' => now()->addDays(7),
                'status' => 'pending'
            ]);

            // Tambahkan progress untuk target pertama
            WorkProgress::create([
                'work_target_id' => $target1->id,
                'user_id' => $karyawan->id,
                'progress_note' => 'Sudah mulai mengerjakan requirement analysis dan setup environment',
                'percentage' => 30
            ]);

            $this->command->info("✓ Dibuat 2 target untuk {$karyawan->name}");
        }

        $this->command->info("\n✓ Seeder selesai!");
        $this->command->info("Total target dibuat: " . ($karyawanIT->count() * 2));
    }
}
