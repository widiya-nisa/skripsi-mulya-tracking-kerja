<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LeadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Lead::with('assignedTo');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by source
        if ($request->has('source') && $request->source !== 'all') {
            $query->where('source', $request->source);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('business_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $leads = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $leads
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'business_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'source' => 'required|in:website,referral,social_media,event,cold_call,other',
            'status' => 'required|in:new,contacted,qualified,proposal,negotiation,won,lost',
            'interest' => 'nullable|string',
            'estimated_value' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'last_contact' => 'nullable|date',
            'next_followup' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $lead = Lead::create($request->all());
        $lead->load('assignedTo');

        return response()->json([
            'success' => true,
            'message' => 'Lead berhasil ditambahkan',
            'data' => $lead
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $lead = Lead::with('assignedTo')->find($id);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $lead
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $lead = Lead::find($id);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'business_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'source' => 'sometimes|required|in:website,referral,social_media,event,cold_call,other',
            'status' => 'sometimes|required|in:new,contacted,qualified,proposal,negotiation,won,lost',
            'interest' => 'nullable|string',
            'estimated_value' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'last_contact' => 'nullable|date',
            'next_followup' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $lead->update($request->all());
        $lead->load('assignedTo');

        return response()->json([
            'success' => true,
            'message' => 'Lead berhasil diupdate',
            'data' => $lead
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $lead = Lead::find($id);

        if (!$lead) {
            return response()->json([
                'success' => false,
                'message' => 'Lead tidak ditemukan'
            ], 404);
        }

        $lead->delete();

        return response()->json([
            'success' => true,
            'message' => 'Lead berhasil dihapus'
        ]);
    }

    /**
     * Get statistics
     */
    public function stats()
    {
        $total = Lead::count();
        $hot = Lead::whereIn('status', ['qualified', 'proposal', 'negotiation'])->count();
        $converted = Lead::where('status', 'won')->count();
        $potentialValue = Lead::where('status', '!=', 'lost')->sum('estimated_value');

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'hot' => $hot,
                'converted' => $converted,
                'potential_value' => $potentialValue
            ]
        ]);
    }
}

