<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PasswordResetRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class PasswordResetRequestController extends Controller
{
    // Submit request lupa password (untuk user)
    public function submitRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'name' => 'nullable|string|max:255',
            'reason' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if email exists in users table
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'message' => 'Email tidak terdaftar dalam sistem'
            ], 404);
        }

        // Check if there's already a pending request
        $existingRequest = PasswordResetRequest::where('email', $request->email)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return response()->json([
                'message' => 'Anda sudah memiliki request yang sedang diproses'
            ], 400);
        }

        // Create new request
        $resetRequest = PasswordResetRequest::create([
            'email' => $request->email,
            'name' => $request->name ?? $user->name,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Request reset password berhasil dikirim. Admin akan segera memproses permintaan Anda.',
            'data' => $resetRequest
        ], 201);
    }

    // Get all password reset requests (untuk admin)
    public function index(Request $request)
    {
        $query = PasswordResetRequest::with(['approver', 'user']);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $requests = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $requests
        ]);
    }

    // Get single password reset request
    public function show($id)
    {
        $request = PasswordResetRequest::with(['approver', 'user'])->findOrFail($id);

        return response()->json([
            'data' => $request
        ]);
    }

    // Approve dan set password baru (untuk admin)
    public function approve(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'new_password' => 'required|string|min:6',
            'admin_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $resetRequest = PasswordResetRequest::findOrFail($id);

        if ($resetRequest->status !== 'pending') {
            return response()->json([
                'message' => 'Request ini sudah diproses'
            ], 400);
        }

        // Update user password
        $user = User::where('email', $resetRequest->email)->first();
        if ($user) {
            $user->password = Hash::make($request->new_password);
            $user->save();
        }

        // Update request status
        $resetRequest->update([
            'status' => 'approved',
            'new_password' => $request->new_password, // Simpan plain text untuk referensi admin
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'admin_notes' => $request->admin_notes,
        ]);

        return response()->json([
            'message' => 'Password berhasil direset. Silakan kirimkan password baru ke user via WhatsApp.',
            'data' => $resetRequest
        ]);
    }

    // Reject request (untuk admin)
    public function reject(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'admin_notes' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $resetRequest = PasswordResetRequest::findOrFail($id);

        if ($resetRequest->status !== 'pending') {
            return response()->json([
                'message' => 'Request ini sudah diproses'
            ], 400);
        }

        $resetRequest->update([
            'status' => 'rejected',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'admin_notes' => $request->admin_notes,
        ]);

        return response()->json([
            'message' => 'Request berhasil ditolak',
            'data' => $resetRequest
        ]);
    }

    // Delete request (untuk admin)
    public function destroy($id)
    {
        $resetRequest = PasswordResetRequest::findOrFail($id);
        $resetRequest->delete();

        return response()->json([
            'message' => 'Request berhasil dihapus'
        ]);
    }

    // Get statistics (untuk admin dashboard)
    public function statistics()
    {
        $stats = [
            'pending' => PasswordResetRequest::where('status', 'pending')->count(),
            'approved' => PasswordResetRequest::where('status', 'approved')->count(),
            'rejected' => PasswordResetRequest::where('status', 'rejected')->count(),
            'total' => PasswordResetRequest::count(),
        ];

        return response()->json([
            'data' => $stats
        ]);
    }
}
