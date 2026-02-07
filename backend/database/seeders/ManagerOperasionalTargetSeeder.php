<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\WorkTarget;
use App\Models\WorkProgress;
use Carbon\Carbon;

class ManagerOperasionalTargetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get manager operasional
        $managerOperasional = User::where('role', 'manager')
            ->where('department', 'operasional')
            ->first();
            
        if (!$managerOperasional) {
            $this->command->error('Manager Operasional not found!');
            return;
        }

        // Get karyawan operasional
        $karyawanOperasional = User::where('manager_id', $managerOperasional->id)->get();
        
        if ($karyawanOperasional->isEmpty()) {
            $this->command->error('No karyawan found for Manager Operasional!');
            return;
        }

        // Create targets for each karyawan
        foreach ($karyawanOperasional as $karyawan) {
            // Target 1 - In Progress
            $target1 = WorkTarget::create([
                'title' => 'Follow up customer untuk produk baru',
                'description' => 'Hubungi semua customer existing untuk inform produk baru dan dapatkan feedback',
                'manager_id' => $managerOperasional->id,
                'assigned_to' => $karyawan->id,
                'priority' => 'high',
                'status' => 'in_progress',
                'deadline' => Carbon::now()->addDays(7),
            ]);

            // Add progress
            WorkProgress::create([
                'work_target_id' => $target1->id,
                'user_id' => $karyawan->id,
                'progress_note' => 'Sudah follow up 15 customer dari total 50 customer',
                'percentage' => 30,
            ]);

            // Target 2 - Pending
            WorkTarget::create([
                'title' => 'Buat laporan penjualan bulan ini',
                'description' => 'Compile data penjualan dan buat presentasi untuk meeting',
                'manager_id' => $managerOperasional->id,
                'assigned_to' => $karyawan->id,
                'priority' => 'medium',
                'status' => 'pending',
                'deadline' => Carbon::now()->addDays(10),
            ]);
        }

        $this->command->info('Target untuk Manager Operasional berhasil di-seed!');
    }
}
