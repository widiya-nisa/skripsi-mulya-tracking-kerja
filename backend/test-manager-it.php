<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\WorkTarget;

echo "=== MANAGER IT ===\n";
$managerIT = User::where('role', 'manager')
    ->where('department', 'it')
    ->first();

if ($managerIT) {
    echo "Manager: {$managerIT->name} (ID: {$managerIT->id})\n\n";
    
    $karyawanIT = User::where('manager_id', $managerIT->id)->get();
    echo "Jumlah karyawan IT: {$karyawanIT->count()}\n";
    foreach ($karyawanIT as $k) {
        echo "  - {$k->name} (ID: {$k->id})\n";
    }
    
    echo "\n=== TARGET KERJA ===\n";
    $targets = WorkTarget::where('manager_id', $managerIT->id)->get();
    echo "Jumlah target dibuat manager IT: {$targets->count()}\n";
    foreach ($targets as $t) {
        echo "  - Target untuk: {$t->assignedUser->name} (assigned_to: {$t->assigned_to})\n";
    }
    
    // Cek apakah ada target untuk karyawan IT
    if ($karyawanIT->count() > 0) {
        echo "\n=== CEK TARGET PER KARYAWAN ===\n";
        foreach ($karyawanIT as $k) {
            $targetCount = WorkTarget::where('assigned_to', $k->id)->count();
            echo "{$k->name}: {$targetCount} target\n";
        }
    }
} else {
    echo "Manager IT tidak ditemukan\n";
    echo "\nDaftar semua manager:\n";
    $managers = User::where('role', 'manager')->get();
    foreach ($managers as $m) {
        echo "  - {$m->name} (Department: {$m->department})\n";
    }
}
