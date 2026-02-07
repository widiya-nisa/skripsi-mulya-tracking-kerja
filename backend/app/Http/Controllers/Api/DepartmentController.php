<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    /**
     * Display a listing of departments
     */
    public function index(Request $request)
    {
        $type = $request->query('type'); // Filter by IT or Operasional
        
        $query = Department::query();
        
        if ($type) {
            $query->where('type', $type);
        }
        
        $departments = $query->orderBy('type')->orderBy('name')->get();
        
        return response()->json($departments);
    }

    /**
     * Store a newly created department
     */
    public function store(Request $request)
    {
        // Only admin can create departments
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Only admin can create departments.'], 403);
        }
        
        $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
            'description' => 'nullable|string',
            'type' => 'required|in:it,operasional',
        ]);

        $department = Department::create([
            'name' => $request->name,
            'description' => $request->description,
            'type' => $request->type,
        ]);

        // Log activity
        ActivityLog::log(
            'create_department',
            "Created new department '{$request->name}' in {$request->type}",
            'Department',
            $department->id
        );

        return response()->json($department, 201);
    }

    /**
     * Display the specified department
     */
    public function show(string $id)
    {
        $department = Department::with('users')->findOrFail($id);
        return response()->json($department);
    }

    /**
     * Update the specified department
     */
    public function update(Request $request, string $id)
    {
        // Only admin can update departments
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Only admin can update departments.'], 403);
        }
        
        $department = Department::findOrFail($id);
        
        $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:departments,name,' . $id,
            'description' => 'nullable|string',
            'type' => 'sometimes|required|in:it,operasional',
        ]);

        $department->update($request->all());

        // Log activity
        ActivityLog::log(
            'update_department',
            "Updated department '{$department->name}'",
            'Department',
            $department->id
        );

        return response()->json($department);
    }

    /**
     * Remove the specified department
     */
    public function destroy(string $id)
    {
        // Only admin can delete departments
        if (request()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Only admin can delete departments.'], 403);
        }
        
        $department = Department::findOrFail($id);
        
        // Check if department is used by users
        $usersCount = User::where('job_description', $department->name)->count();
        if ($usersCount > 0) {
            return response()->json([
                'message' => "Cannot delete department. It is currently used by {$usersCount} user(s)."
            ], 422);
        }
        
        $departmentName = $department->name;
        $department->delete();

        // Log activity
        ActivityLog::log(
            'delete_department',
            "Deleted department '{$departmentName}'",
            'Department',
            $id
        );

        return response()->json(['message' => 'Department deleted successfully']);
    }
}
