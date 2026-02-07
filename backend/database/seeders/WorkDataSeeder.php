<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class WorkDataSeeder extends Seeder
{
    public function run()
    {
        // Insert Work Targets
        $targets = [
            [
                'id' => 1,
                'title' => 'bisnis analis',
                'description' => 'membuat mock up , manual guide',
                'manager_id' => 3, // Nisa (Manager IT)
                'assigned_to' => 8, // Dewi Business Analyst
                'priority' => 'high',
                'status' => 'in_progress',
                'deadline' => '2026-02-28',
                'created_at' => '2026-02-05 10:00:00',
                'updated_at' => '2026-02-07 18:16:00',
            ],
            [
                'id' => 2,
                'title' => 'buatkanmobile apknya untuk apk umkm',
                'description' => 'tdeytgdhdfthfhfhfhfhfh',
                'manager_id' => 3, // Nisa
                'assigned_to' => 7, // Rudi Mobile Developer
                'priority' => 'urgent',
                'status' => 'pending',
                'deadline' => '2026-02-28',
                'created_at' => '2026-02-06 08:00:00',
                'updated_at' => '2026-02-06 08:00:00',
            ],
        ];

        DB::table('work_targets')->insert($targets);

        // Insert Work Progress
        $progress = [
            [
                'id' => 1,
                'work_target_id' => 1,
                'user_id' => 8, // Dewi
                'progress_note' => 'Memulai pekerjaan',
                'attachment' => null,
                'percentage' => 0,
                'created_at' => '2026-02-07 16:08:00',
                'updated_at' => '2026-02-07 16:08:00',
            ],
            [
                'id' => 2,
                'work_target_id' => 1,
                'user_id' => 8, // Dewi
                'progress_note' => 'Memulai pekerjaan',
                'attachment' => null,
                'percentage' => 0,
                'created_at' => '2026-02-07 16:09:00',
                'updated_at' => '2026-02-07 16:09:00',
            ],
            [
                'id' => 3,
                'work_target_id' => 1,
                'user_id' => 8, // Dewi
                'progress_note' => 'sudah membuat manual guide',
                'attachment' => 'work_progress/1738926436_Screenshot 2025-02-01 130709.png',
                'percentage' => 60,
                'created_at' => '2026-02-07 18:16:00',
                'updated_at' => '2026-02-07 18:16:00',
            ],
        ];

        DB::table('work_progress')->insert($progress);

        echo "✅ Data work_targets dan work_progress berhasil di-restore!\n";
        echo "   - 2 work targets\n";
        echo "   - 3 work progress (termasuk yang 60%)\n";
    }
}
