<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\WorkProgress;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Get all comments for a specific work progress
     */
    public function index($progressId)
    {
        $comments = Comment::where('work_progress_id', $progressId)
            ->whereNull('parent_id')
            ->with(['user:id,name,role', 'replies.user'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($comments);
    }

    /**
     * Store a new comment (manager commenting on karyawan's progress)
     */
    public function store(Request $request, $progressId)
    {
        $request->validate([
            'comment' => 'required|string|min:3',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        // Verify progress exists
        $progress = WorkProgress::findOrFail($progressId);

        $comment = Comment::create([
            'work_progress_id' => $progressId,
            'user_id' => $request->user()->id,
            'parent_id' => $request->parent_id,
            'comment' => $request->comment,
        ]);

        // Log activity
        $actionType = $request->parent_id ? 'reply_comment' : 'add_comment';
        $description = $request->parent_id 
            ? "Replied to a comment on progress" 
            : "Added comment on progress";
        
        ActivityLog::log($actionType, $description, 'Comment', $comment->id);

        $comment->load(['user:id,name,role', 'replies.user']);

        return response()->json([
            'message' => $request->parent_id ? 'Balasan berhasil dikirim' : 'Komentar berhasil dikirim',
            'comment' => $comment
        ], 201);
    }

    /**
     * Delete a comment (only comment owner can delete)
     */
    public function destroy($progressId, $commentId)
    {
        $comment = Comment::where('work_progress_id', $progressId)
            ->where('id', $commentId)
            ->firstOrFail();

        // Only the comment owner can delete
        if ($comment->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Komentar berhasil dihapus']);
    }
}
