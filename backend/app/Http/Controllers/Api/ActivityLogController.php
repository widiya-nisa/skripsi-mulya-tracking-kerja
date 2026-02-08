<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\WorkTarget;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = ActivityLog::with('user:id,name,role,department');

        // Filter based on user role
        if ($user->role === 'karyawan') {
            // Karyawan can only see their own logs
            $query->where('user_id', $user->id);
        } elseif ($user->role === 'manager') {
            // Manager can see logs from employees they assigned tasks to
            $employeeIds = WorkTarget::where('manager_id', $user->id)
                ->pluck('assigned_to')
                ->unique()
                ->toArray();

            // Include manager's own logs
            $employeeIds[] = $user->id;

            $query->whereIn('user_id', $employeeIds);
        }
        // Admin and boss can see all logs (no filter needed)

        // Apply filters from request
        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('action') && $request->action) {
            $query->where('action', $request->action);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Order by latest first
        $query->orderBy('created_at', 'desc');

        // Paginate results
        $logs = $query->paginate(10);

        return response()->json($logs);
    }

    public function stats(Request $request)
    {
        $user = auth()->user();
        $query = ActivityLog::query();

        // Apply same role-based filtering
        if ($user->role === 'karyawan') {
            $query->where('user_id', $user->id);
        } elseif ($user->role === 'manager') {
            $employeeIds = WorkTarget::where('manager_id', $user->id)
                ->pluck('assigned_to')
                ->unique()
                ->toArray();
            $employeeIds[] = $user->id;
            $query->whereIn('user_id', $employeeIds);
        }

        // Get action counts
        $actionCounts = (clone $query)
            ->selectRaw('action, COUNT(*) as count')
            ->groupBy('action')
            ->get();

        // Get today's activity count
        $todayCount = (clone $query)
            ->whereDate('created_at', today())
            ->count();

        // Get this week's activity count
        $weekCount = (clone $query)
            ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
            ->count();

        // Get most active users
        $topUsers = (clone $query)
            ->selectRaw('user_id, COUNT(*) as count')
            ->groupBy('user_id')
            ->orderByDesc('count')
            ->limit(5)
            ->with('user:id,name,role')
            ->get();

        return response()->json([
            'action_counts' => $actionCounts,
            'today_count' => $todayCount,
            'week_count' => $weekCount,
            'top_users' => $topUsers,
        ]);
    }
}
