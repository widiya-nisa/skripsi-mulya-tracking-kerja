<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::with(['project', 'assignee', 'timeLogs'])
            ->whereHas('project', function($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            });

        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $tasks = $query->orderBy('due_date')->get();

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:low,medium,high',
            'project_id' => 'required|exists:projects,id',
            'due_date' => 'nullable|date',
            'estimated_hours' => 'nullable|numeric|min:0',
        ]);

        // Verify project belongs to user
        $project = Project::where('id', $request->project_id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $task = Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'priority' => $request->priority ?? 'medium',
            'project_id' => $request->project_id,
            'assigned_to' => $request->user()->id,
            'due_date' => $request->due_date,
            'estimated_hours' => $request->estimated_hours,
        ]);

        return response()->json($task->load('project'), 201);
    }

    public function show(Request $request, string $id)
    {
        $task = Task::with(['project', 'assignee', 'timeLogs'])
            ->whereHas('project', function($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })
            ->findOrFail($id);

        return response()->json($task);
    }

    public function update(Request $request, string $id)
    {
        $task = Task::whereHas('project', function($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })->findOrFail($id);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:todo,in_progress,done',
            'priority' => 'nullable|in:low,medium,high',
            'due_date' => 'nullable|date',
            'estimated_hours' => 'nullable|numeric|min:0',
        ]);

        $task->update($request->all());

        return response()->json($task->load('project'));
    }

    public function destroy(Request $request, string $id)
    {
        $task = Task::whereHas('project', function($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })->findOrFail($id);

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully'
        ]);
    }
}
