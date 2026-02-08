<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkTarget;
use App\Models\WorkProgress;
use App\Models\EmployeeProfile;
use App\Models\Leave;
use App\Models\User;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ExportController extends Controller
{
    /**
     * Export Work Targets to PDF
     */
    public function exportWorkTargetsPDF(Request $request)
    {
        $user = $request->user();
        
        // Get date range from request or default to current month
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        // Query targets based on role
        $query = WorkTarget::with(['assignedUser', 'manager'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($user->role === 'karyawan') {
            $query->where('assigned_to', $user->id);
        } elseif ($user->role === 'manager') {
            $subordinateIds = User::where('manager_id', $user->id)->pluck('id')->toArray();
            $subordinateIds[] = $user->id;
            $query->whereIn('assigned_to', $subordinateIds);
        }

        $targets = $query->orderBy('created_at', 'desc')->get();

        // Prepare data for PDF
        $data = [
            'title' => 'Laporan Target Kerja',
            'date_range' => Carbon::parse($startDate)->format('d M Y') . ' - ' . Carbon::parse($endDate)->format('d M Y'),
            'generated_at' => Carbon::now()->format('d F Y H:i'),
            'generated_by' => $user->name,
            'targets' => $targets,
        ];

        // Generate PDF
        $pdf = Pdf::loadView('exports.work-targets', $data);
        $pdf->setPaper('a4', 'landscape');
        
        $fileName = 'Laporan_Target_Kerja_' . Carbon::now()->format('Y-m-d_His') . '.pdf';
        return $pdf->download($fileName);
    }

    /**
     * Export Work Progress to PDF
     */
    public function exportProgressPDF(Request $request)
    {
        $user = $request->user();
        
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        $query = WorkProgress::with(['user', 'workTarget', 'attachments'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($user->role === 'karyawan') {
            $query->where('user_id', $user->id);
        } elseif ($user->role === 'manager') {
            $subordinateIds = User::where('manager_id', $user->id)->pluck('id')->toArray();
            $subordinateIds[] = $user->id;
            $query->whereIn('user_id', $subordinateIds);
        }

        $progress = $query->orderBy('created_at', 'desc')->get();

        $data = [
            'title' => 'Laporan Progress Kerja',
            'date_range' => Carbon::parse($startDate)->format('d M Y') . ' - ' . Carbon::parse($endDate)->format('d M Y'),
            'generated_at' => Carbon::now()->format('d F Y H:i'),
            'generated_by' => $user->name,
            'progress' => $progress,
        ];

        $pdf = Pdf::loadView('exports.work-progress', $data);
        $pdf->setPaper('a4', 'landscape');
        
        $fileName = 'Laporan_Progress_Kerja_' . Carbon::now()->format('Y-m-d_His') . '.pdf';
        return $pdf->download($fileName);
    }

    /**
     * Export Employees to PDF
     */
    public function exportEmployeesPDF(Request $request)
    {
        $user = $request->user();

        // Only admin and CEO can export all employees
        if (!in_array($user->role, ['admin', 'ceo'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $employees = EmployeeProfile::with('user')->orderBy('created_at', 'desc')->get();

        $data = [
            'title' => 'Daftar Karyawan',
            'generated_at' => Carbon::now()->format('d F Y H:i'),
            'generated_by' => $user->name,
            'employees' => $employees,
        ];

        $pdf = Pdf::loadView('exports.employees', $data);
        $pdf->setPaper('a4', 'portrait');
        
        $fileName = 'Daftar_Karyawan_' . Carbon::now()->format('Y-m-d_His') . '.pdf';
        return $pdf->download($fileName);
    }

    /**
     * Export Leaves to PDF
     */
    public function exportLeavesPDF(Request $request)
    {
        $user = $request->user();
        
        $startDate = $request->input('start_date', Carbon::now()->startOfYear()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfYear()->format('Y-m-d'));
        $status = $request->input('status', 'all');

        $query = Leave::with(['user', 'approver'])
            ->whereBetween('start_date', [$startDate, $endDate]);

        // Filter by role
        if ($user->role === 'karyawan') {
            $query->where('user_id', $user->id);
        } elseif ($user->role === 'manager') {
            $subordinateIds = User::where('manager_id', $user->id)->pluck('id')->toArray();
            $subordinateIds[] = $user->id;
            $query->whereIn('user_id', $subordinateIds);
        }

        // Filter by status
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $leaves = $query->orderBy('start_date', 'desc')->get();

        // Calculate statistics
        $stats = [
            'total' => $leaves->count(),
            'pending' => $leaves->where('status', 'pending')->count(),
            'approved' => $leaves->where('status', 'approved')->count(),
            'rejected' => $leaves->where('status', 'rejected')->count(),
            'total_days' => $leaves->where('status', 'approved')->sum('days_count'),
        ];

        $data = [
            'title' => 'Laporan Cuti Karyawan',
            'date_range' => Carbon::parse($startDate)->format('d M Y') . ' - ' . Carbon::parse($endDate)->format('d M Y'),
            'generated_at' => Carbon::now()->format('d F Y H:i'),
            'generated_by' => $user->name,
            'leaves' => $leaves,
            'stats' => $stats,
        ];

        $pdf = Pdf::loadView('exports.leaves', $data);
        $pdf->setPaper('a4', 'landscape');
        
        $fileName = 'Laporan_Cuti_' . Carbon::now()->format('Y-m-d_His') . '.pdf';
        return $pdf->download($fileName);
    }
}

