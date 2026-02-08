<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Leave;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class LeaveController extends Controller
{
    /**
     * Get all leaves (filtered by role)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Leave::with(['user', 'approver']);

        // Filter by role
        if ($user->role === 'karyawan') {
            // Karyawan only see their own leaves
            $query->where('user_id', $user->id);
        } elseif ($user->role === 'manager') {
            // Manager see subordinates' leaves
            $subordinateIds = User::where('manager_id', $user->id)->pluck('id')->toArray();
            $subordinateIds[] = $user->id; // Include own leaves
            $query->whereIn('user_id', $subordinateIds);
        }
        // Admin/CEO see all leaves

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('start_date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('end_date', '<=', $request->end_date);
        }

        $leaves = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $leaves
        ]);
    }

    /**
     * Submit leave request
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:annual,sick,permission,unpaid',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|min:10',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048', // Max 2MB
        ]);

        $user = $request->user();

        // Calculate days
        $start = Carbon::parse($request->start_date);
        $end = Carbon::parse($request->end_date);
        $days = 0;
        while ($start->lte($end)) {
            if ($start->isWeekday()) {
                $days++;
            }
            $start->addDay();
        }

        // Handle attachment upload (surat dokter, etc)
        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentPath = $file->store('leave_attachments', 'public');
        }

        // Create leave request
        $leave = Leave::create([
            'user_id' => $user->id,
            'type' => $request->type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'days_count' => $days,
            'reason' => $request->reason,
            'attachment' => $attachmentPath,
            'status' => 'pending',
        ]);

        // Notify manager
        $manager = User::find($user->manager_id);
        if ($manager) {
            Notification::createNotification(
                $manager->id,
                'leave_requested',
                'Pengajuan Cuti Baru',
                "{$user->name} mengajukan {$leave->type_label} selama {$days} hari",
                "/leaves?status=pending",
                'Leave',
                $leave->id
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan cuti berhasil dikirim',
            'data' => $leave->load(['user', 'approver'])
        ], 201);
    }

    /**
     * Approve leave
     */
    public function approve($id)
    {
        $leave = Leave::findOrFail($id);
        $user = auth()->user();

        // Only manager or admin can approve
        if (!in_array($user->role, ['manager', 'admin', 'ceo'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $leave->update([
            'status' => 'approved',
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        // Notify user
        Notification::createNotification(
            $leave->user_id,
            'leave_approved',
            'Cuti Disetujui',
            "Pengajuan {$leave->type_label} Anda telah disetujui",
            "/leaves",
            'Leave',
            $leave->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Cuti berhasil disetujui',
            'data' => $leave->load(['user', 'approver'])
        ]);
    }

    /**
     * Reject leave
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|min:10',
        ]);

        $leave = Leave::findOrFail($id);
        $user = auth()->user();

        // Only manager or admin can reject
        if (!in_array($user->role, ['manager', 'admin', 'ceo'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $leave->update([
            'status' => 'rejected',
            'approved_by' => $user->id,
            'approved_at' => now(),
            'rejection_reason' => $request->rejection_reason,
        ]);

        // Notify user
        Notification::createNotification(
            $leave->user_id,
            'leave_rejected',
            'Cuti Ditolak',
            "Pengajuan {$leave->type_label} Anda ditolak: {$request->rejection_reason}",
            "/leaves",
            'Leave',
            $leave->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Cuti berhasil ditolak',
            'data' => $leave->load(['user', 'approver'])
        ]);
    }

    /**
     * Cancel leave (by user)
     */
    public function cancel($id)
    {
        $leave = Leave::findOrFail($id);
        $user = auth()->user();

        // Only owner can cancel
        if ($leave->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Can only cancel pending leaves
        if ($leave->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya cuti yang masih pending yang bisa dibatalkan'
            ], 422);
        }

        $leave->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan cuti berhasil dibatalkan'
        ]);
    }

    /**
     * Get leave stats (quota, used, remaining)
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        $year = $request->input('year', now()->year);

        // Annual leave quota (default 12 days per year)
        $quota = 12;

        // Calculate used days
        $usedDays = Leave::where('user_id', $user->id)
            ->where('type', 'annual')
            ->where('status', 'approved')
            ->whereYear('start_date', $year)
            ->sum('days_count');

        $remainingDays = $quota - $usedDays;

        // Count by status
        $pending = Leave::where('user_id', $user->id)->where('status', 'pending')->count();
        $approved = Leave::where('user_id', $user->id)->where('status', 'approved')->count();
        $rejected = Leave::where('user_id', $user->id)->where('status', 'rejected')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'year' => $year,
                'quota' => $quota,
                'used' => $usedDays,
                'remaining' => $remainingDays,
                'pending' => $pending,
                'approved' => $approved,
                'rejected' => $rejected,
            ]
        ]);
    }

    /**
     * Delete leave
     */
    public function destroy($id)
    {
        $leave = Leave::findOrFail($id);
        $user = auth()->user();

        // Only owner or admin can delete
        if ($leave->user_id !== $user->id && !in_array($user->role, ['admin', 'ceo'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Delete attachment if exists
        if ($leave->attachment && Storage::disk('public')->exists($leave->attachment)) {
            Storage::disk('public')->delete($leave->attachment);
        }

        $leave->delete();

        return response()->json([
            'success' => true,
            'message' => 'Leave berhasil dihapus'
        ]);
    }
}

