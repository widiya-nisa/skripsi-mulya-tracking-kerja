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
        Route::apiResource('users', UserController::class);
        Route::apiResource('departments', DepartmentController::class);
    });

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
});
