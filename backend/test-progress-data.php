<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\WorkTarget;
use App\Models\WorkProgress;

echo "=== CEK PROGRESS KARYAWAN ===\n\n";

// Cek karyawan operasional yang punya target
$karyawanOp = User::where('role', 'karyawan')
    ->where('department', 'operasional')
    ->get();

echo "Karyawan Operasional:\n";
foreach ($karyawanOp as $k) {
    echo "\n{$k->name} (ID: {$k->id})\n";
    
    // Cek target untuk karyawan ini
    $targets = WorkTarget::where('assigned_to', $k->id)->get();
    echo "  Jumlah target: {$targets->count()}\n";
    
    foreach ($targets as $t) {
        echo "  - {$t->title} (Status: {$t->status})\n";
        
        // Cek progress untuk target ini
        $progressList = WorkProgress::where('work_target_id', $t->id)->get();
        echo "    Progress entries: {$progressList->count()}\n";
        
        foreach ($progressList as $p) {
            echo "      * User ID: {$p->user_id}, Percentage: {$p->percentage}%, Note: " . substr($p->progress_note, 0, 50) . "...\n";
        }
    }
}

echo "\n=== CEK KARYAWAN IT ===\n\n";
$karyawanIT = User::where('role', 'karyawan')
    ->where('department', 'it')
    ->get();

foreach ($karyawanIT as $k) {
    echo "\n{$k->name} (ID: {$k->id})\n";
    $targets = WorkTarget::where('assigned_to', $k->id)->get();
    echo "  Jumlah target: {$targets->count()}\n";
    
    foreach ($targets as $t) {
        echo "  - {$t->title} (Status: {$t->status})\n";
        $progressList = WorkProgress::where('work_target_id', $t->id)->get();
        echo "    Progress entries: {$progressList->count()}\n";
    }
}
