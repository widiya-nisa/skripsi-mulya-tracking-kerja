<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkTarget;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class WorkTargetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            // Admin, CEO melihat semua target
            if (in_array($user->role, ['admin', 'ceo'])) {
                $targets = WorkTarget::with(['assignedUser', 'manager', 'latestProgress'])
                    ->orderBy('deadline', 'asc')
                    ->get();
            }
            // Manager melihat:
            // 1. Target yang dia buat (manager_id = user.id)
            // 2. Target yang dibuat admin/boss untuk karyawan dibawahnya (assigned_to IN subordinates)
            elseif ($user->role === 'manager') {
                // Get subordinate IDs
                $subordinateIds = User::where('manager_id', $user->id)->pluck('id')->toArray();

                $targets = WorkTarget::where(function ($query) use ($user, $subordinateIds) {
                    $query->where('manager_id', $user->id) // Target yang dibuat manager sendiri
                        ->orWhereIn('assigned_to', $subordinateIds); // Target untuk karyawannya (dibuat oleh siapapun)
                })
                    ->with(['assignedUser', 'manager', 'latestProgress'])
                    ->orderBy('deadline', 'asc')
                    ->get();
            }
            // Karyawan melihat target yang di-assign ke mereka
            else {
                $targets = WorkTarget::where('assigned_to', $user->id)
                    ->with(['manager', 'latestProgress'])
                    ->orderBy('deadline', 'asc')
                    ->get();
            }

            return response()->json($targets);
        } catch (\Exception $e) {
            \Log::error('Error in WorkTargetController@index: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get subordinates for manager, or all karyawan for admin/boss/ceo
     */
    public function subordinates(Request $request)
    {
        $user = $request->user();

        // Admin, CEO dapat melihat semua karyawan dan manager
        if (in_array($user->role, ['admin', 'ceo'])) {
            $subordinates = User::whereIn('role', ['karyawan', 'manager'])
                ->select('id', 'name', 'role', 'department', 'job_description')
                ->orderBy('name', 'asc')
                ->get();
        }
        // Manager hanya melihat bawahannya
        elseif ($user->role === 'manager') {
            $subordinates = User::where('manager_id', $user->id)
                ->select('id', 'name', 'role', 'department', 'job_description')
                ->get();
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($subordinates);
    }

    /**
     * Get statistics for dashboard
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        // Admin, CEO stats - semua target
        if (in_array($user->role, ['admin', 'ceo'])) {
            $totalTargets = WorkTarget::count();
            $completedTargets = WorkTarget::where('status', 'completed')->count();
            $overdueTargets = WorkTarget::where('status', 'overdue')->count();
            $inProgressTargets = WorkTarget::where('status', 'in_progress')->count();
        }
        // Manager stats
        elseif ($user->role === 'manager') {
            $totalTargets = WorkTarget::where('manager_id', $user->id)->count();
            $completedTargets = WorkTarget::where('manager_id', $user->id)->where('status', 'completed')->count();
            $overdueTargets = WorkTarget::where('manager_id', $user->id)->where('status', 'overdue')->count();
            $inProgressTargets = WorkTarget::where('manager_id', $user->id)->where('status', 'in_progress')->count();
        }
        // Karyawan stats
        else {
            $totalTargets = WorkTarget::where('assigned_to', $user->id)->count();
            $completedTargets = WorkTarget::where('assigned_to', $user->id)->where('status', 'completed')->count();
            $overdueTargets = WorkTarget::where('assigned_to', $user->id)->where('status', 'overdue')->count();
            $inProgressTargets = WorkTarget::where('assigned_to', $user->id)->where('status', 'in_progress')->count();
        }

        return response()->json([
            'total' => $totalTargets,
            'completed' => $completedTargets,
            'overdue' => $overdueTargets,
            'in_progress' => $inProgressTargets,
            'pending' => $totalTargets - $completedTargets - $overdueTargets - $inProgressTargets,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Only manager, admin, ceo can create targets
        if (!in_array($user->role, ['manager', 'admin', 'ceo'])) {
            return response()->json(['message' => 'Unauthorized. Only manager, admin, or boss can create targets.'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'assigned_to' => 'required|exists:users,id',
            'priority' => 'required|in:low,medium,high,urgent',
            'deadline' => 'required|date',
        ]);

        $target = WorkTarget::create([
            'title' => $request->title,
            'description' => $request->description,
            'manager_id' => $user->id,
            'assigned_to' => $request->assigned_to,
            'priority' => $request->priority,
            'status' => 'pending',
            'deadline' => $request->deadline,
        ]);

        // Log activity
        $assignedUser = User::find($request->assigned_to);
        ActivityLog::log(
            'create_target',
            "Created work target '{$request->title}' and assigned to {$assignedUser->name}",
            'WorkTarget',
            $target->id
        );

        $target->load(['assignedUser', 'latestProgress']);

        return response()->json($target, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = request()->user();
        $target = WorkTarget::with(['manager', 'assignedUser', 'progress.user'])
            ->findOrFail($id);

        if ($user->role === 'karyawan' && $target->assigned_to !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($user->role === 'manager' && $target->manager_id !== $user->id) {
            $subordinateIds = User::where('manager_id', $user->id)
                ->pluck('id')
                ->toArray();
            if (!in_array($target->assigned_to, $subordinateIds)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        return response()->json($target);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = $request->user();
        $target = WorkTarget::findOrFail($id);

        // Admin, CEO can update any target
        // Manager can only update their own targets
        if (!in_array($user->role, ['admin', 'ceo'])) {
            if ($target->manager_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'assigned_to' => 'sometimes|required|exists:users,id',
            'priority' => 'sometimes|required|in:low,medium,high,urgent',
            'status' => 'sometimes|required|in:pending,in_progress,completed,overdue',
            'deadline' => 'sometimes|required|date',
        ]);

        $target->update($request->all());
        $target->load(['assignedUser', 'latestProgress']);

        return response()->json($target);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = request()->user();
        $target = WorkTarget::findOrFail($id);

        // Admin, CEO can delete any target
        // Manager can only delete their own targets
        if (!in_array($user->role, ['admin', 'ceo'])) {
            if ($target->manager_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $target->delete();

        return response()->json(['message' => 'Target deleted successfully']);
    }
}
