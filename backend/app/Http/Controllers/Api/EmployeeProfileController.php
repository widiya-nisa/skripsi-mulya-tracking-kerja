<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmployeeProfile;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EmployeeProfileController extends Controller
{
    /**
     * Display a listing of employee profiles (Admin/Manager only)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = EmployeeProfile::with(['user' => function($q) {
            $q->select('id', 'name', 'email', 'role', 'department', 'job_description');
        }]);

        // Admin and CEO can see all profiles
        if (in_array($user->role, ['admin', 'ceo'])) {
            $query; // See all
        }
        // Karyawan and others can only see their own profile
        else {
            $query->where('user_id', $user->id);
        }

        $profiles = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $profiles
        ]);
    }

    /**
     * Get current user's own profile
     */
    public function getMyProfile(Request $request)
    {
        $user = $request->user();
        
        $profile = EmployeeProfile::where('user_id', $user->id)
            ->with('user')
            ->first();
        
        if (!$profile) {
            // Create empty profile if not exists
            $profile = EmployeeProfile::create([
                'user_id' => $user->id,
                'full_name' => $user->name,
            ]);
            $profile->load('user');
        }
        
        return response()->json(['success' => true, 'data' => $profile]);
    }

    /**
     * Get specific user profile (admin/CEO only)
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        
        // Admin and CEO can view any profile
        if (in_array($user->role, ['admin', 'ceo'])) {
            $profile = EmployeeProfile::with('user')->findOrFail($id);
            return response()->json(['success' => true, 'data' => $profile]);
        }
        
        // Karyawan can only view their own profile
        $profile = EmployeeProfile::with('user')->findOrFail($id);
        if ($profile->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        return response()->json(['success' => true, 'data' => $profile]);
    }

    /**
     * Store or update employee profile
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        // Only admin can create/update profiles
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya admin yang dapat membuat atau mengupdate profil karyawan. Silakan hubungi admin untuk update data.'
            ], 403);
        }
        
        // Get target user ID from request, default to current user
        $targetUserId = $request->input('user_id', $user->id);
        
        // Get existing profile to check NIK
        $existingProfile = EmployeeProfile::where('user_id', $targetUserId)->first();
        $ignoreNikId = $existingProfile ? $existingProfile->id : null;
        
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'nik' => 'nullable|string|max:20|unique:employee_profiles,nik,' . $ignoreNikId,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'birth_date' => 'nullable|date',
            'birth_place' => 'nullable|string|max:100',
            'gender' => 'nullable|in:male,female',
            'marital_status' => 'nullable|in:single,married,divorced,widowed',
            'join_date' => 'nullable|date',
            'employee_id' => 'nullable|string|max:50',
            'position' => 'nullable|string|max:255',
            'employment_status' => 'nullable|in:permanent,contract,probation,internship',
            'last_education' => 'nullable|string|max:50',
            'institution' => 'nullable|string|max:200',
            'major' => 'nullable|string|max:100',
            'graduation_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 10),
            'emergency_contact_name' => 'nullable|string|max:100',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_relation' => 'nullable|string|max:50',
            'bank_name' => 'nullable|string|max:100',
            'bank_account_number' => 'nullable|string|max:50',
            'bank_account_name' => 'nullable|string|max:100',
            'ktp_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'ijazah_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'cv_file' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png|max:1024',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $profile = EmployeeProfile::firstOrNew(['user_id' => $targetUserId]);
        
        // Set is_verified true for new profiles or if admin is creating
        $isNewProfile = !$profile->exists;

        // Handle file uploads
        if ($request->hasFile('ktp_file')) {
            if ($profile->ktp_file && Storage::exists('public/' . $profile->ktp_file)) {
                Storage::delete('public/' . $profile->ktp_file);
            }
            $path = $request->file('ktp_file')->store('employee_documents/ktp', 'public');
            $validated['ktp_file'] = $path;
        }

        if ($request->hasFile('ijazah_file')) {
            if ($profile->ijazah_file && Storage::exists('public/' . $profile->ijazah_file)) {
                Storage::delete('public/' . $profile->ijazah_file);
            }
            $path = $request->file('ijazah_file')->store('employee_documents/ijazah', 'public');
            $validated['ijazah_file'] = $path;
        }

        if ($request->hasFile('cv_file')) {
            if ($profile->cv_file && Storage::exists('public/' . $profile->cv_file)) {
                Storage::delete('public/' . $profile->cv_file);
            }
            $path = $request->file('cv_file')->store('employee_documents/cv', 'public');
            $validated['cv_file'] = $path;
        }

        if ($request->hasFile('photo')) {
            if ($profile->photo && Storage::exists('public/' . $profile->photo)) {
                Storage::delete('public/' . $profile->photo);
            }
            $path = $request->file('photo')->store('employee_photos', 'public');
            $validated['photo'] = $path;
        }

        $profile->fill($validated);
        
        // Auto-verify if admin creates or if it's a new profile
        if ($isNewProfile || $user->role === 'admin') {
            $profile->is_verified = true;
        }
        
        $profile->save();

        // Log activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => $profile->wasRecentlyCreated ? 'create' : 'update',
            'model' => 'EmployeeProfile',
            'model_id' => $profile->id,
            'description' => $user->name . ' ' . ($profile->wasRecentlyCreated ? 'membuat' : 'mengupdate') . ' profil karyawan',
        ]);

        $profile->load('user');
        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil ' . ($profile->wasRecentlyCreated ? 'dibuat' : 'diupdate'),
            'data' => $profile
        ], $profile->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Admin update profile (including verification)
     */
    public function adminUpdate(Request $request, $id)
    {
        $user = $request->user();
        
        // Only admin can update
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $profile = EmployeeProfile::findOrFail($id);
        
        $validated = $request->validate([
            'is_verified' => 'nullable|boolean',
            'notes' => 'nullable|string',
            'salary' => 'nullable|numeric|min:0',
            'employment_status' => 'nullable|in:permanent,contract,probation,internship',
        ]);

        $profile->update($validated);

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'verify',
            'model' => 'EmployeeProfile',
            'model_id' => $profile->id,
            'description' => $user->name . ' memverifikasi profil ' . $profile->user->name,
        ]);

        return response()->json($profile);
    }

    /**
     * Delete employee profile (Admin only)
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        
        // Only admin can delete
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $profile = EmployeeProfile::findOrFail($id);
        
        // Delete associated files
        if ($profile->ktp_file && Storage::exists('public/' . $profile->ktp_file)) {
            Storage::delete('public/' . $profile->ktp_file);
        }
        if ($profile->ijazah_file && Storage::exists('public/' . $profile->ijazah_file)) {
            Storage::delete('public/' . $profile->ijazah_file);
        }
        if ($profile->cv_file && Storage::exists('public/' . $profile->cv_file)) {
            Storage::delete('public/' . $profile->cv_file);
        }
        if ($profile->photo && Storage::exists('public/' . $profile->photo)) {
            Storage::delete('public/' . $profile->photo);
        }

        $profileUserName = $profile->user->name;
        $profile->delete();

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'delete',
            'model' => 'EmployeeProfile',
            'model_id' => $id,
            'description' => $user->name . ' menghapus profil ' . $profileUserName,
        ]);

        return response()->json(['message' => 'Profil berhasil dihapus']);
    }
}
