<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Get manager operasional
$manager = \App\Models\User::where('role', 'manager')
    ->where('department', 'operasional')
    ->first();

if (!$manager) {
    echo "Manager Operasional not found!\n";
    exit;
}

echo "Manager: {$manager->name} (ID: {$manager->id})\n";
echo "Email: {$manager->email}\n\n";

// Get subordinates
$subordinates = \App\Models\User::where('manager_id', $manager->id)->get();
echo "Subordinates: " . $subordinates->count() . "\n";
foreach ($subordinates as $sub) {
    echo "  - {$sub->name} ({$sub->email})\n";
}

// Get targets for manager
$subordinateIds = $subordinates->pluck('id')->toArray();
$targets = \App\Models\WorkTarget::where(function($query) use ($manager, $subordinateIds) {
        $query->where('manager_id', $manager->id)
              ->orWhereIn('assigned_to', $subordinateIds);
    })
    ->with(['assignedUser', 'manager', 'latestProgress'])
    ->get();

echo "\nTotal Targets: " . $targets->count() . "\n";
foreach ($targets as $target) {
    echo "  - {$target->title} (assigned to: {$target->assignedUser->name}, status: {$target->status})\n";
}

// Get progress
$progress = \App\Models\WorkProgress::whereIn('user_id', $subordinateIds)->get();
echo "\nTotal Progress: " . $progress->count() . "\n";
