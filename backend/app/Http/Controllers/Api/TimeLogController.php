<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TimeLog;
use App\Models\Task;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TimeLogController extends Controller
{
    public function index(Request $request)
    {
        $query = TimeLog::with(['task.project', 'user'])
            ->where('user_id', $request->user()->id);

        if ($request->has('task_id')) {
            $query->where('task_id', $request->task_id);
        }

        if ($request->has('start_date')) {
            $query->whereDate('start_time', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('start_time', '<=', $request->end_date);
        }

        $timeLogs = $query->latest('start_time')->get();

        return response()->json($timeLogs);
    }

    public function store(Request $request)
    {
        $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'start_time' => 'required|date',
            'end_time' => 'nullable|date|after:start_time',
            'description' => 'nullable|string',
        ]);

        // Verify task exists and belongs to user's project
        $task = Task::where('id', $request->task_id)
            ->whereHas('project', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })
            ->firstOrFail();

        // Calculate duration if end_time provided
        $duration = null;
        if ($request->end_time) {
            $start = Carbon::parse($request->start_time);
            $end = Carbon::parse($request->end_time);
            $duration = $end->diffInMinutes($start);
        }

        $timeLog = TimeLog::create([
            'task_id' => $request->task_id,
            'user_id' => $request->user()->id,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'duration' => $duration,
            'description' => $request->description,
        ]);

        return response()->json($timeLog->load('task'), 201);
    }

    public function show(Request $request, string $id)
    {
        $timeLog = TimeLog::with(['task', 'user'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json($timeLog);
    }

    public function update(Request $request, string $id)
    {
        $timeLog = TimeLog::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $request->validate([
            'start_time' => 'sometimes|required|date',
            'end_time' => 'nullable|date|after:start_time',
            'description' => 'nullable|string',
        ]);

        // Recalculate duration if times are updated
        $duration = $timeLog->duration;
        $startTime = $request->start_time ?? $timeLog->start_time;
        $endTime = $request->end_time ?? $timeLog->end_time;

        if ($startTime && $endTime) {
            $start = Carbon::parse($startTime);
            $end = Carbon::parse($endTime);
            $duration = $end->diffInMinutes($start);
        }

        $timeLog->update([
            'start_time' => $startTime,
            'end_time' => $endTime,
            'duration' => $duration,
            'description' => $request->description ?? $timeLog->description,
        ]);

        return response()->json($timeLog->load('task'));
    }

    public function destroy(Request $request, string $id)
    {
        $timeLog = TimeLog::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $timeLog->delete();

        return response()->json([
            'message' => 'Time log deleted successfully'
        ]);
    }
}
