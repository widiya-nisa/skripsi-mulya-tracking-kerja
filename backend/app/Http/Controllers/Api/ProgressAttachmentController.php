<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProgressAttachment;
use App\Models\WorkProgress;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProgressAttachmentController extends Controller
{
    /**
     * Get all attachments for a specific progress
     */
    public function index($progressId)
    {
        $attachments = ProgressAttachment::where('work_progress_id', $progressId)
            ->with('uploader:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $attachments
        ]);
    }

    /**
     * Upload attachment for progress
     */
    public function store(Request $request, $progressId)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // Max 10MB
            'description' => 'nullable|string|max:255',
        ]);

        // Verify progress exists and user has access
        $progress = WorkProgress::findOrFail($progressId);
        $user = $request->user();

        // Only progress owner or admin can upload
        if ($progress->user_id !== $user->id && !in_array($user->role, ['admin', 'ceo', 'manager'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check max 5 files per progress
        $existingCount = ProgressAttachment::where('work_progress_id', $progressId)->count();
        if ($existingCount >= 5) {
            return response()->json([
                'success' => false,
                'message' => 'Maksimal 5 file per progress. Hapus file lama terlebih dahulu.'
            ], 422);
        }

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $fileName = Str::uuid() . '.' . $extension;
        
        // Store file in storage/progress_attachments
        $path = $file->storeAs('progress_attachments', $fileName, 'public');

        // Create attachment record
        $attachment = ProgressAttachment::create([
            'work_progress_id' => $progressId,
            'uploaded_by' => $user->id,
            'file_name' => $originalName,
            'file_path' => $path,
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'description' => $request->description,
        ]);

        // Create notification for manager
        if ($progress->workTarget && $progress->workTarget->manager_id) {
            Notification::createNotification(
                $progress->workTarget->manager_id,
                'progress_attachment_added',
                'File Baru Ditambahkan',
                "{$user->name} menambahkan file pada progress kerja",
                "/team-progress?target_id={$progress->work_target_id}",
                'WorkProgress',
                $progressId
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'File berhasil diupload',
            'data' => $attachment->load('uploader:id,name')
        ], 201);
    }

    /**
     * Delete attachment
     */
    public function destroy($progressId, $attachmentId)
    {
        $attachment = ProgressAttachment::where('work_progress_id', $progressId)
            ->findOrFail($attachmentId);

        $user = auth()->user();

        // Only uploader or admin can delete
        if ($attachment->uploaded_by !== $user->id && !in_array($user->role, ['admin', 'ceo'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Delete file from storage
        if (Storage::disk('public')->exists($attachment->file_path)) {
            Storage::disk('public')->delete($attachment->file_path);
        }

        // Delete record
        $attachment->delete();

        return response()->json([
            'success' => true,
            'message' => 'File berhasil dihapus'
        ]);
    }

    /**
     * Download attachment
     */
    public function download($progressId, $attachmentId)
    {
        $attachment = ProgressAttachment::where('work_progress_id', $progressId)
            ->findOrFail($attachmentId);

        $filePath = storage_path('app/public/' . $attachment->file_path);

        if (!file_exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => 'File tidak ditemukan'
            ], 404);
        }

        return response()->download($filePath, $attachment->file_name);
    }
}

