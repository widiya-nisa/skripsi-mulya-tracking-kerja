<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TimeLog;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function getReport(Request $request, $period)
    {
        $dateRange = $this->getDateRange($period);

        $timeLogs = TimeLog::with(['task.project'])
            ->where('user_id', $request->user()->id)
            ->whereBetween('start_time', [$dateRange['start'], $dateRange['end']])
            ->latest('start_time')
            ->get();

        // Calculate statistics
        $totalDuration = $timeLogs->sum('duration');
        $totalHours = round($totalDuration / 60, 2);

        // Group by project
        $byProject = [];
        foreach ($timeLogs as $log) {
            $projectName = $log->task->project->name ?? 'Unknown';
            if (!isset($byProject[$projectName])) {
                $byProject[$projectName] = [
                    'duration' => 0,
                    'tasks' => []
                ];
            }
            $byProject[$projectName]['duration'] += $log->duration ?? 0;
            if (!in_array($log->task->title, $byProject[$projectName]['tasks'])) {
                $byProject[$projectName]['tasks'][] = $log->task->title;
            }
        }

        // Group by status
        $byStatus = [];
        foreach ($timeLogs as $log) {
            $status = $log->task->status ?? 'unknown';
            if (!isset($byStatus[$status])) {
                $byStatus[$status] = 0;
            }
            $byStatus[$status] += $log->duration ?? 0;
        }

        return response()->json([
            'period' => $period,
            'startDate' => $dateRange['start'],
            'endDate' => $dateRange['end'],
            'summary' => [
                'totalLogs' => $timeLogs->count(),
                'totalMinutes' => $totalDuration,
                'totalHours' => $totalHours,
                'byProject' => $byProject,
                'byStatus' => $byStatus,
            ],
            'logs' => $timeLogs,
        ]);
    }

    public function getDashboard(Request $request)
    {
        $dateRange = $this->getDateRange('monthly');

        // Total projects
        $totalProjects = Project::where('user_id', $request->user()->id)->count();

        // Task stats by status
        $taskStats = Task::select('status', DB::raw('count(*) as count'))
            ->whereHas('project', function($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })
            ->groupBy('status')
            ->get();

        // Monthly time logs
        $monthlyTimeLogs = TimeLog::select(
                DB::raw('DATE(start_time) as date'),
                DB::raw('SUM(duration) as totalDuration')
            )
            ->where('user_id', $request->user()->id)
            ->whereBetween('start_time', [$dateRange['start'], $dateRange['end']])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top projects by time spent
        $topProjects = TimeLog::select(
                'projects.name',
                DB::raw('SUM(time_logs.duration) as totalDuration')
            )
            ->join('tasks', 'time_logs.task_id', '=', 'tasks.id')
            ->join('projects', 'tasks.project_id', '=', 'projects.id')
            ->where('time_logs.user_id', $request->user()->id)
            ->where('projects.user_id', $request->user()->id)
            ->whereBetween('time_logs.start_time', [$dateRange['start'], $dateRange['end']])
            ->groupBy('projects.id', 'projects.name')
            ->orderByDesc('totalDuration')
            ->limit(5)
            ->get();

        return response()->json([
            'totalProjects' => $totalProjects,
            'taskStats' => $taskStats,
            'monthlyTimeLogs' => $monthlyTimeLogs,
            'topProjects' => $topProjects,
        ]);
    }

    private function getDateRange($period)
    {
        $now = Carbon::now();

        switch ($period) {
            case 'daily':
                return [
                    'start' => $now->copy()->startOfDay(),
                    'end' => $now->copy()->endOfDay(),
                ];
            case 'weekly':
                return [
                    'start' => $now->copy()->startOfWeek(),
                    'end' => $now->copy()->endOfWeek(),
                ];
            case 'monthly':
            default:
                return [
                    'start' => $now->copy()->startOfMonth(),
                    'end' => $now->copy()->endOfMonth(),
                ];
        }
    }
}
