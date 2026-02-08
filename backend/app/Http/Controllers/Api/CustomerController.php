<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
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
        $query = Customer::with('salesPerson');

        // Filter by package
        if ($request->has('package') && $request->package !== 'all') {
            $query->where('package', $request->package);
        }

        // Filter by category
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                    ->orWhere('owner_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $customers = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $customers
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
            'business_name' => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers,email',
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'category' => 'required|in:fashion,food,electronics,beauty,home,other',
            'package' => 'required|in:basic,premium,enterprise',
            'status' => 'required|in:active,inactive,suspended',
            'monthly_revenue' => 'nullable|numeric',
            'total_products' => 'nullable|integer',
            'marketplace_link' => 'nullable|url',
            'sales_person_id' => 'nullable|exists:users,id',
            'join_date' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $customer = Customer::create($request->all());
        $customer->load('salesPerson');

        return response()->json([
            'success' => true,
            'message' => 'Customer berhasil ditambahkan',
            'data' => $customer
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $customer = Customer::with('salesPerson')->find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $customer
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
        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'business_name' => 'sometimes|required|string|max:255',
            'owner_name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:customers,email,' . $id,
            'phone' => 'sometimes|required|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'category' => 'sometimes|required|in:fashion,food,electronics,beauty,home,other',
            'package' => 'sometimes|required|in:basic,premium,enterprise',
            'status' => 'sometimes|required|in:active,inactive,suspended',
            'monthly_revenue' => 'nullable|numeric',
            'total_products' => 'nullable|integer',
            'marketplace_link' => 'nullable|url',
            'sales_person_id' => 'nullable|exists:users,id',
            'join_date' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $customer->update($request->all());
        $customer->load('salesPerson');

        return response()->json([
            'success' => true,
            'message' => 'Customer berhasil diupdate',
            'data' => $customer
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
        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer tidak ditemukan'
            ], 404);
        }

        $customer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Customer berhasil dihapus'
        ]);
    }

    /**
     * Get statistics
     */
    public function stats()
    {
        $total = Customer::count();
        $active = Customer::where('status', 'active')->count();
        $premium = Customer::where('package', 'premium')->orWhere('package', 'enterprise')->count();
        $totalRevenue = Customer::where('status', 'active')->sum('monthly_revenue');

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'active' => $active,
                'premium' => $premium,
                'total_revenue' => $totalRevenue
            ]
        ]);
    }
}
