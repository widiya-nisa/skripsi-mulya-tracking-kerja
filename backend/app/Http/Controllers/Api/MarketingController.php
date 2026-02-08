<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MarketingCampaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MarketingController extends Controller
{
    private function ensureWriteAccess(Request $request)
    {
        if (!in_array($request->user()->role, ['admin', 'ceo', 'manager'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return null;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = MarketingCampaign::with('creator');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $campaigns = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $campaigns
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if ($response = $this->ensureWriteAccess($request)) {
            return $response;
        }
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|in:social_media,email,webinar,event,ads,content,other',
            'status' => 'required|in:planning,active,paused,completed,cancelled',
            'description' => 'nullable|string',
            'budget' => 'required|numeric|min:0',
            'spent' => 'nullable|numeric|min:0',
            'target_reach' => 'nullable|integer',
            'actual_reach' => 'nullable|integer',
            'leads_generated' => 'nullable|integer',
            'conversions' => 'nullable|integer',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'platforms' => 'nullable|array',
            'created_by' => 'nullable|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $campaign = MarketingCampaign::create($request->all());
        $campaign->load('creator');

        return response()->json([
            'success' => true,
            'message' => 'Campaign berhasil ditambahkan',
            'data' => $campaign
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $campaign = MarketingCampaign::with('creator')->find($id);

        if (!$campaign) {
            return response()->json([
                'success' => false,
                'message' => 'Campaign tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $campaign
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        if ($response = $this->ensureWriteAccess($request)) {
            return $response;
        }
        $campaign = MarketingCampaign::find($id);

        if (!$campaign) {
            return response()->json([
                'success' => false,
                'message' => 'Campaign tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:social_media,email,webinar,event,ads,content,other',
            'status' => 'sometimes|required|in:planning,active,paused,completed,cancelled',
            'description' => 'nullable|string',
            'budget' => 'sometimes|required|numeric|min:0',
            'spent' => 'nullable|numeric|min:0',
            'target_reach' => 'nullable|integer',
            'actual_reach' => 'nullable|integer',
            'leads_generated' => 'nullable|integer',
            'conversions' => 'nullable|integer',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date|after:start_date',
            'platforms' => 'nullable|array',
            'created_by' => 'nullable|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $campaign->update($request->all());
        $campaign->load('creator');

        return response()->json([
            'success' => true,
            'message' => 'Campaign berhasil diupdate',
            'data' => $campaign
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        if ($response = $this->ensureWriteAccess(request())) {
            return $response;
        }
        $campaign = MarketingCampaign::find($id);

        if (!$campaign) {
            return response()->json([
                'success' => false,
                'message' => 'Campaign tidak ditemukan'
            ], 404);
        }

        $campaign->delete();

        return response()->json([
            'success' => true,
            'message' => 'Campaign berhasil dihapus'
        ]);
    }

    /**
     * Get statistics
     */
    public function stats()
    {
        $active = MarketingCampaign::where('status', 'active')->count();
        $totalBudget = MarketingCampaign::whereIn('status', ['active', 'planning'])->sum('budget');
        $totalReach = MarketingCampaign::where('status', 'active')->sum('actual_reach');
        $totalLeads = MarketingCampaign::sum('leads_generated');

        return response()->json([
            'success' => true,
            'data' => [
                'active' => $active,
                'total_budget' => $totalBudget,
                'total_reach' => $totalReach,
                'total_leads' => $totalLeads
            ]
        ]);
    }
}
