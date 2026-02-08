<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ChatGroup;
use App\Models\ChatGroupMember;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ChatGroupController extends Controller
{
    /**
     * Get all groups where user is member
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $userRole = $request->user()->role;

        // Admin can see all groups
        if ($userRole === 'admin') {
            $groups = ChatGroup::with(['creator:id,name', 'members:id,name'])
                ->withCount('members')
                ->get();
        } else {
            // Regular users only see groups they're member of
            $groups = ChatGroup::whereHas('members', function($q) use ($userId) {
                    $q->where('user_id', $userId);
                })
                ->with(['creator:id,name', 'members:id,name'])
                ->withCount('members')
                ->get();
        }

        // Add last message and unread count for each group
        $groups->each(function($group) use ($userId) {
            $lastMessage = $group->messages()->latest()->first();
            $group->last_message = $lastMessage ? $lastMessage->message : null;
            $group->last_message_at = $lastMessage ? $lastMessage->created_at : $group->created_at;
            
            $group->unread_count = Message::where('group_id', $group->id)
                ->where('sender_id', '!=', $userId)
                ->where('is_read', false)
                ->count();
        });

        return response()->json($groups);
    }

    /**
     * Create new group
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'member_ids' => 'required|array|min:1',
            'member_ids.*' => 'exists:users,id'
        ]);

        DB::beginTransaction();
        try {
            // Create group
            $group = ChatGroup::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'created_by' => $request->user()->id,
                'is_private' => false
            ]);

            // Add creator as admin member
            ChatGroupMember::create([
                'group_id' => $group->id,
                'user_id' => $request->user()->id,
                'is_admin' => true,
                'joined_at' => now()
            ]);

            // Add other members
            foreach ($validated['member_ids'] as $memberId) {
                if ($memberId != $request->user()->id) {
                    ChatGroupMember::create([
                        'group_id' => $group->id,
                        'user_id' => $memberId,
                        'is_admin' => false,
                        'joined_at' => now()
                    ]);
                }
            }

            DB::commit();

            $group->load(['creator', 'members']);
            $group->loadCount('members');

            return response()->json([
                'message' => 'Grup berhasil dibuat',
                'data' => $group
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal membuat grup',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get group details with members
     */
    public function show(Request $request, $id)
    {
        $group = ChatGroup::with(['creator:id,name', 'members:id,name,email,role'])
            ->withCount('members')
            ->findOrFail($id);

        // Check if user is member or admin
        $userId = $request->user()->id;
        $userRole = $request->user()->role;
        
        if ($userRole !== 'admin' && !$group->hasMember($userId)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($group);
    }

    /**
     * Update group (name, description)
     */
    public function update(Request $request, $id)
    {
        $group = ChatGroup::findOrFail($id);

        // Check if user is group admin or system admin
        $userId = $request->user()->id;
        $userRole = $request->user()->role;
        
        if ($userRole !== 'admin' && !$group->isGroupAdmin($userId)) {
            return response()->json(['message' => 'Hanya admin grup yang bisa edit'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string'
        ]);

        $group->update($validated);

        return response()->json([
            'message' => 'Grup berhasil diupdate',
            'data' => $group
        ]);
    }

    /**
     * Add member to group
     */
    public function addMember(Request $request, $id)
    {
        $group = ChatGroup::findOrFail($id);

        // Check if user is group admin or system admin
        $userId = $request->user()->id;
        $userRole = $request->user()->role;
        
        if ($userRole !== 'admin' && !$group->isGroupAdmin($userId)) {
            return response()->json(['message' => 'Hanya admin grup yang bisa menambah member'], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        // Check if already member
        if ($group->hasMember($validated['user_id'])) {
            return response()->json(['message' => 'User sudah menjadi member grup'], 400);
        }

        ChatGroupMember::create([
            'group_id' => $group->id,
            'user_id' => $validated['user_id'],
            'is_admin' => false,
            'joined_at' => now()
        ]);

        $group->load('members');

        return response()->json([
            'message' => 'Member berhasil ditambahkan',
            'data' => $group
        ]);
    }

    /**
     * Remove member from group
     */
    public function removeMember(Request $request, $id, $memberId)
    {
        $group = ChatGroup::findOrFail($id);

        // Check if user is group admin or system admin
        $userId = $request->user()->id;
        $userRole = $request->user()->role;
        
        if ($userRole !== 'admin' && !$group->isGroupAdmin($userId)) {
            return response()->json(['message' => 'Hanya admin grup yang bisa hapus member'], 403);
        }

        // Cannot remove creator
        if ($group->created_by == $memberId) {
            return response()->json(['message' => 'Tidak bisa menghapus pembuat grup'], 400);
        }

        ChatGroupMember::where('group_id', $id)
            ->where('user_id', $memberId)
            ->delete();

        return response()->json(['message' => 'Member berhasil dihapus']);
    }

    /**
     * Delete group (creator or admin only)
     */
    public function destroy(Request $request, $id)
    {
        $group = ChatGroup::findOrFail($id);

        // Only creator or system admin can delete
        $userId = $request->user()->id;
        $userRole = $request->user()->role;
        
        if ($userRole !== 'admin' && $group->created_by !== $userId) {
            return response()->json(['message' => 'Hanya pembuat grup atau admin yang bisa hapus grup'], 403);
        }

        $group->delete(); // Will cascade delete members and messages

        return response()->json(['message' => 'Grup berhasil dihapus']);
    }

    /**
     * Get group messages
     */
    public function getMessages(Request $request, $id)
    {
        $group = ChatGroup::findOrFail($id);

        // Check if user is member or admin
        $userId = $request->user()->id;
        $userRole = $request->user()->role;
        
        if ($userRole !== 'admin' && !$group->hasMember($userId)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $messages = Message::where('group_id', $id)
            ->with(['sender:id,name,email'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        // Mark messages as read
        Message::where('group_id', $id)
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now()
            ]);

        return response()->json($messages);
    }

    /**
     * Send message to group
     */
    public function sendMessage(Request $request, $id)
    {
        $group = ChatGroup::findOrFail($id);

        // Check if user is member
        $userId = $request->user()->id;
        if (!$group->hasMember($userId)) {
            return response()->json(['message' => 'Anda bukan member grup ini'], 403);
        }

        $validated = $request->validate([
            'message' => 'nullable|string|max:5000',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,gif,pdf,doc,docx,txt,zip|max:10240'
        ]);

        // At least message or attachment must be present
        if (empty($validated['message']) && !$request->hasFile('attachment')) {
            return response()->json(['message' => 'Pesan atau file harus diisi'], 400);
        }

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentPath = $file->store('chat_attachments', 'public');
        }

        $message = Message::create([
            'group_id' => $id,
            'sender_id' => $userId,
            'receiver_id' => null,
            'team' => null,
            'message' => $validated['message'] ?? '',
            'attachment' => $attachmentPath
        ]);

        $message->load('sender:id,name,email');

        return response()->json([
            'message' => 'Pesan berhasil dikirim',
            'data' => $message
        ], 201);
    }

    /**
     * Get available users to add to group
     */
    public function getAvailableUsers(Request $request, $id)
    {
        $group = ChatGroup::findOrFail($id);

        // Get users who are NOT in this group
        $existingMemberIds = $group->members()->pluck('user_id')->toArray();
        
        $availableUsers = User::whereNotIn('id', $existingMemberIds)
            ->select('id', 'name', 'email', 'role', 'department')
            ->orderBy('name')
            ->get();

        return response()->json($availableUsers);
    }
}
