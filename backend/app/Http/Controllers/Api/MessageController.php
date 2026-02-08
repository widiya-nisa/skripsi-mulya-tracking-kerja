<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    // Get team messages (IT atau Operasional)
    public function getTeamMessages(Request $request, $team)
    {
        $messages = Message::teamMessages($team)
            ->with(['sender:id,name,email'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($messages);
    }

    // Get private messages between two users
    public function getPrivateMessages(Request $request, $userId)
    {
        $currentUserId = $request->user()->id;
        
        $messages = Message::privateMessages($currentUserId, $userId)
            ->with(['sender:id,name,email', 'receiver:id,name,email'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        // Mark as read
        Message::where('receiver_id', $currentUserId)
               ->where('sender_id', $userId)
               ->unread()
               ->update([
                   'is_read' => true,
                   'read_at' => now()
               ]);

        return response()->json($messages);
    }

    // Send message to team
    public function sendTeamMessage(Request $request)
    {
        $request->validate([
            'team' => 'required|in:IT,Operasional',
            'message' => 'nullable|string|max:5000',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,gif,pdf,doc,docx,txt,zip|max:10240' // 10MB
        ]);

        // At least message or attachment must be present
        if (empty($request->message) && !$request->hasFile('attachment')) {
            return response()->json(['message' => 'Pesan atau file harus diisi'], 400);
        }

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentPath = $file->store('chat_attachments', 'public');
        }

        $message = Message::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => null,
            'team' => $request->team,
            'message' => $request->message ?? '',
            'attachment' => $attachmentPath
        ]);

        $message->load('sender:id,name,email');

        return response()->json([
            'message' => 'Pesan berhasil dikirim',
            'data' => $message
        ], 201);
    }

    // Send private message
    public function sendPrivateMessage(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'nullable|string|max:5000',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,gif,pdf,doc,docx,txt,zip|max:10240' // 10MB
        ]);

        // At least message or attachment must be present
        if (empty($request->message) && !$request->hasFile('attachment')) {
            return response()->json(['message' => 'Pesan atau file harus diisi'], 400);
        }

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentPath = $file->store('chat_attachments', 'public');
        }

        $message = Message::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $request->receiver_id,
            'team' => null,
            'message' => $request->message ?? '',
            'attachment' => $attachmentPath
        ]);

        $message->load(['sender:id,name,email', 'receiver:id,name,email']);

        return response()->json([
            'message' => 'Pesan berhasil dikirim',
            'data' => $message
        ], 201);
    }

    // Get unread message count
    public function getUnreadCount(Request $request)
    {
        $userId = $request->user()->id;
        
        $count = Message::where('receiver_id', $userId)
                       ->unread()
                       ->count();

        return response()->json(['unread_count' => $count]);
    }

    // Get all conversations list (team + private)
    public function getConversations(Request $request)
    {
        $userId = $request->user()->id;
        $userDepartment = $request->user()->department;

        $conversations = [];

        // Team conversations - Show for users with IT or Operasional department
        if (in_array($userDepartment, ['IT', 'Operasional'])) {
            $lastTeamMessage = Message::teamMessages($userDepartment)
                ->with('sender:id,name')
                ->latest()
                ->first();

            $unreadCount = Message::teamMessages($userDepartment)
                ->where('sender_id', '!=', $userId)
                ->unread()
                ->count();

            $conversations[] = [
                'type' => 'team',
                'team' => $userDepartment,
                'name' => "Tim {$userDepartment}",
                'last_message' => $lastTeamMessage ? $lastTeamMessage->message : 'Belum ada pesan',
                'last_message_at' => $lastTeamMessage ? $lastTeamMessage->created_at : now(),
                'unread_count' => $unreadCount
            ];
        } else {
            // Users without team - create private chat with Admin
            $admin = User::where('role', 'admin')->first();
            if ($admin) {
                $lastPrivateMessage = Message::privateMessages($userId, $admin->id)
                    ->latest()
                    ->first();

                $unreadCount = Message::where('sender_id', $admin->id)
                    ->where('receiver_id', $userId)
                    ->unread()
                    ->count();

                $conversations[] = [
                    'type' => 'private',
                    'user_id' => $admin->id,
                    'name' => "Admin ({$admin->name})",
                    'last_message' => $lastPrivateMessage ? $lastPrivateMessage->message : 'Belum ada pesan',
                    'last_message_at' => $lastPrivateMessage ? $lastPrivateMessage->created_at : now(),
                    'unread_count' => $unreadCount
                ];
            }
        }

        // Private conversations
        $privateMessages = Message::where(function($q) use ($userId) {
                $q->where('sender_id', $userId)
                  ->orWhere('receiver_id', $userId);
            })
            ->whereNull('team')
            ->with(['sender:id,name', 'receiver:id,name'])
            ->latest()
            ->get()
            ->groupBy(function($msg) use ($userId) {
                return $msg->sender_id == $userId ? $msg->receiver_id : $msg->sender_id;
            });

        foreach ($privateMessages as $otherUserId => $messages) {
            $lastMsg = $messages->first();
            $otherUser = User::select('id', 'name')->find($otherUserId);
            
            $unreadCount = Message::where('sender_id', $otherUserId)
                ->where('receiver_id', $userId)
                ->unread()
                ->count();

            $conversations[] = [
                'type' => 'private',
                'user_id' => $otherUserId,
                'name' => $otherUser->name,
                'last_message' => $lastMsg->message,
                'last_message_at' => $lastMsg->created_at,
                'unread_count' => $unreadCount
            ];
        }

        // Sort by last message time
        usort($conversations, function($a, $b) {
            return $b['last_message_at'] <=> $a['last_message_at'];
        });

        return response()->json($conversations);
    }

    // Delete message (own messages only)
    public function destroy(Request $request, $id)
    {
        $message = Message::findOrFail($id);

        if ($message->sender_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($message->attachment) {
            Storage::disk('public')->delete($message->attachment);
        }

        $message->delete();

        return response()->json(['message' => 'Pesan berhasil dihapus']);
    }
}
