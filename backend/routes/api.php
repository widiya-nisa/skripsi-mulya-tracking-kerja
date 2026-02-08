<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\WorkTargetController;
use App\Http\Controllers\Api\WorkProgressController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TimeLogController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\MarketingController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\EmployeeProfileController;
use App\Http\Controllers\Api\ProgressAttachmentController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\LeaveController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ChatGroupController;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Admin only routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/users/stats', [UserController::class, 'stats']);
        Route::apiResource('departments', DepartmentController::class);
    });

    // Users - Admin, CEO, dan Manager bisa akses (untuk buat grup chat)
    Route::apiResource('users', UserController::class);

    // Departments - All authenticated users can view
    Route::get('/departments', [DepartmentController::class, 'index']);

    // Work Targets - Manager can create/update/delete, Developer can view
    Route::get('/work-targets/stats', [WorkTargetController::class, 'stats']);
    Route::get('/work-targets/subordinates', [WorkTargetController::class, 'subordinates']);
    Route::apiResource('work-targets', WorkTargetController::class);

    // Work Progress - Developer can create/update, Manager can view
    Route::apiResource('work-progress', WorkProgressController::class);

    // Comments - Manager can comment on progress
    Route::get('/work-progress/{progressId}/comments', [CommentController::class, 'index']);
    Route::post('/work-progress/{progressId}/comments', [CommentController::class, 'store']);
    Route::delete('/work-progress/{progressId}/comments/{commentId}', [CommentController::class, 'destroy']);

    // Activity Logs - All authenticated users can view based on their role
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    Route::get('/activity-logs/stats', [ActivityLogController::class, 'stats']);

    // Projects / Tasks / Time Logs
    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('tasks', TaskController::class);
    Route::apiResource('timelogs', TimeLogController::class);

    // Reports
    Route::get('/reports/dashboard', [ReportController::class, 'getDashboard']);
    Route::get('/reports/{period}', [ReportController::class, 'getReport']);

    // Sales & Marketing
    Route::get('/leads/stats', [LeadController::class, 'stats']);
    Route::apiResource('leads', LeadController::class);

    Route::get('/marketing/stats', [MarketingController::class, 'stats']);
    Route::apiResource('marketing', MarketingController::class);

    Route::get('/customers/stats', [CustomerController::class, 'stats']);
    Route::apiResource('customers', CustomerController::class);

    // Employee Profiles - me route must come before {id} route
    Route::get('/employee-profiles', [EmployeeProfileController::class, 'index']); // List all (admin/manager)
    Route::get('/employee-profiles/me', [EmployeeProfileController::class, 'getMyProfile']); // Get own profile
    Route::post('/employee-profiles', [EmployeeProfileController::class, 'store']); // Create/Update own profile
    Route::get('/employee-profiles/{id}', [EmployeeProfileController::class, 'show']); // Get specific profile
    Route::put('/employee-profiles/{id}/admin', [EmployeeProfileController::class, 'adminUpdate']); // Admin update
    Route::delete('/employee-profiles/{id}', [EmployeeProfileController::class, 'destroy']); // Delete (admin)

    // Progress Attachments
    Route::get('/progress/{progressId}/attachments', [ProgressAttachmentController::class, 'index']);
    Route::post('/progress/{progressId}/attachments', [ProgressAttachmentController::class, 'store']);
    Route::delete('/progress/{progressId}/attachments/{attachmentId}', [ProgressAttachmentController::class, 'destroy']);
    Route::get('/progress/{progressId}/attachments/{attachmentId}/download', [ProgressAttachmentController::class, 'download']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    // Leaves
    Route::get('/leaves', [LeaveController::class, 'index']);
    Route::post('/leaves', [LeaveController::class, 'store']);
    Route::get('/leaves/stats', [LeaveController::class, 'stats']);
    Route::put('/leaves/{id}/approve', [LeaveController::class, 'approve']);
    Route::put('/leaves/{id}/reject', [LeaveController::class, 'reject']);
    Route::put('/leaves/{id}/cancel', [LeaveController::class, 'cancel']);
    Route::delete('/leaves/{id}', [LeaveController::class, 'destroy']);

    // Export PDF
    Route::get('/export/work-targets-pdf', [ExportController::class, 'exportWorkTargetsPDF']);
    Route::get('/export/work-progress-pdf', [ExportController::class, 'exportProgressPDF']);
    Route::get('/export/employees-pdf', [ExportController::class, 'exportEmployeesPDF']);
    Route::get('/export/leaves-pdf', [ExportController::class, 'exportLeavesPDF']);

    // Team Chat (Legacy - keep for backward compatibility)
    Route::get('/messages/conversations', [MessageController::class, 'getConversations']);
    Route::get('/messages/unread-count', [MessageController::class, 'getUnreadCount']);
    Route::get('/messages/team/{team}', [MessageController::class, 'getTeamMessages']);
    Route::get('/messages/private/{userId}', [MessageController::class, 'getPrivateMessages']);
    Route::post('/messages/team', [MessageController::class, 'sendTeamMessage']);
    Route::post('/messages/private', [MessageController::class, 'sendPrivateMessage']);
    Route::delete('/messages/{id}', [MessageController::class, 'destroy']);

    // Chat Groups (New flexible group system)
    Route::get('/chat-groups', [ChatGroupController::class, 'index']);
    Route::post('/chat-groups', [ChatGroupController::class, 'store']);
    Route::get('/chat-groups/{id}', [ChatGroupController::class, 'show']);
    Route::put('/chat-groups/{id}', [ChatGroupController::class, 'update']);
    Route::delete('/chat-groups/{id}', [ChatGroupController::class, 'destroy']);
    Route::get('/chat-groups/{id}/messages', [ChatGroupController::class, 'getMessages']);
    Route::post('/chat-groups/{id}/messages', [ChatGroupController::class, 'sendMessage']);
    Route::post('/chat-groups/{id}/members', [ChatGroupController::class, 'addMember']);
    Route::delete('/chat-groups/{id}/members/{memberId}', [ChatGroupController::class, 'removeMember']);
    Route::get('/chat-groups/{id}/available-users', [ChatGroupController::class, 'getAvailableUsers']);
});

