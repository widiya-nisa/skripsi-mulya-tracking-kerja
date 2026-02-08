<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkProgress;
use App\Models\WorkTarget;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class WorkProgressController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $workTargetId = $request->query('work_target_id');
            $user = $request->user();

            $query = WorkProgress::with(['user', 'workTarget', 'comments' => function ($q) {
                $q->whereNull('parent_id')->with(['user', 'replies.user']);
            }]);

            if ($workTargetId) {
                // Filter by specific work target with access control
                $target = WorkTarget::findOrFail($workTargetId);
                if ($user->role === 'karyawan' && $target->assigned_to !== $user->id) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
                if ($user->role === 'manager') {
                    $subordinateIds = User::where('manager_id', $user->id)
                        ->pluck('id')
                        ->toArray();
                    $subordinateIds[] = $user->id;
                    if (!in_array($target->assigned_to, $subordinateIds)) {
                        return response()->json(['message' => 'Unauthorized'], 403);
                    }
                }

                $query->where('work_target_id', $workTargetId);
            } else {
                // Karyawan: show only their own progress
                if ($user->role === 'karyawan') {
                    $query->where('user_id', $user->id);
                }
                // Manager: show progress from their subordinates
                elseif ($user->role === 'manager') {
                    $subordinateIds = User::where('manager_id', $user->id)->pluck('id')->toArray();
                    $subordinateIds[] = $user->id; // Include manager's own progress
                    $query->whereIn('user_id', $subordinateIds);
                }
                // Admin, Boss, CEO: show all progress (no filter)
            }

            $progress = $query->orderBy('created_at', 'desc')->get();

            return response()->json($progress);
        } catch (\Exception $e) {
            \Log::error('Error in WorkProgressController@index: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'work_target_id' => 'required|exists:work_targets,id',
            'progress_note' => 'required|string',
            'percentage' => 'required|integer|min:0|max:100',
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf|max:10240', // Max 10MB, support PDF
        ]);

        $data = [
            'work_target_id' => $request->work_target_id,
            'user_id' => $request->user()->id,
            'progress_note' => $request->progress_note,
            'percentage' => $request->percentage,
        ];

        $workTarget = WorkTarget::findOrFail($request->work_target_id);
        if ($request->user()->role === 'karyawan' && $workTarget->assigned_to !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        if ($request->user()->role === 'manager' && $workTarget->manager_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Handle file upload
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('work_progress', $filename, 'public');
            $data['attachment'] = $path;
        }

        $progress = WorkProgress::create($data);

        // Update work target status based on percentage
        if ($request->percentage >= 100) {
            $workTarget->status = 'completed';
        } elseif ($request->percentage >= 0) {
            // Ubah dari > 0 menjadi >= 0 agar status berubah saat mulai kerja (0%)
            $workTarget->status = 'in_progress';
        }
        $workTarget->save();

        // Log activity
        ActivityLog::log(
            'upload_progress',
            "Uploaded {$request->percentage}% progress for target: {$workTarget->title}",
            'WorkProgress',
            $progress->id
        );

        $progress->load(['user', 'workTarget']);

        return response()->json($progress, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $progress = WorkProgress::with(['user', 'workTarget'])->findOrFail($id);

        return response()->json($progress);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $progress = WorkProgress::findOrFail($id);

        // Only the user who created the progress can update it
        if ($progress->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'progress_note' => 'sometimes|required|string',
            'percentage' => 'sometimes|required|integer|min:0|max:100',
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf|max:10240',
        ]);

        $data = $request->only(['progress_note', 'percentage']);

        // Handle file upload
        if ($request->hasFile('attachment')) {
            // Delete old file if exists
            if ($progress->attachment) {
                Storage::disk('public')->delete($progress->attachment);
            }

            $file = $request->file('attachment');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('work_progress', $filename, 'public');
            $data['attachment'] = $path;
        }

        $progress->update($data);

        // Update work target status if percentage changed
        if (isset($data['percentage'])) {
            $workTarget = WorkTarget::find($progress->work_target_id);
            if ($data['percentage'] >= 100) {
                $workTarget->status = 'completed';
            } elseif ($data['percentage'] > 0) {
                $workTarget->status = 'in_progress';
            }
            $workTarget->save();
        }

        $progress->load(['user', 'workTarget']);

        return response()->json($progress);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $progress = WorkProgress::findOrFail($id);

        // Only the user who created the progress or admin can delete it
        if ($progress->user_id !== request()->user()->id && request()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete attachment file if exists
        if ($progress->attachment) {
            Storage::disk('public')->delete($progress->attachment);
        }

        $progress->delete();

        return response()->json(['message' => 'Progress deleted successfully']);
    }
}
