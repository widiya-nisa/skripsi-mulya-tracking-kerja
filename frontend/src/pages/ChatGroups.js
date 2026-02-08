import React, { useState, useEffect, useRef } from "react";
import {
  FaPaperPlane,
  FaUsers,
  FaUser,
  FaPaperclip,
  FaDownload,
  FaTrash,
  FaPlus,
  FaTimes,
  FaSave,
  FaCog,
  FaUserPlus,
  FaUserMinus,
} from "react-icons/fa";
import api from "../services/api";
import { authService } from "../services";

const ChatGroups = () => {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const currentUser = authService.getCurrentUser();

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    member_ids: [],
  });

  // Fetch groups
  const fetchGroups = async () => {
    try {
      const response = await api.get("/chat-groups");
      setGroups(response.data);

      // Auto-select first group if available
      if (response.data.length > 0 && !activeGroup) {
        setActiveGroup(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  // Fetch all users for creating group
  const fetchAllUsers = async () => {
    try {
      const response = await api.get("/users");
      console.log("Fetched users response:", response.data);

      // Handle different response structures
      let users = [];
      if (response.data.data) {
        users = response.data.data;
      } else if (Array.isArray(response.data)) {
        users = response.data;
      }

      // Filter out current user
      const filteredUsers = users.filter((u) => u.id !== currentUser?.id);
      console.log("All users (excluding current):", filteredUsers);
      setAllUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Gagal mengambil data user. Silakan refresh halaman.");
    }
  };

  // Fetch available users (not in current group)
  const fetchAvailableUsers = async () => {
    if (!activeGroup) return;
    try {
      const response = await api.get(
        `/chat-groups/${activeGroup.id}/available-users`,
      );
      setAvailableUsers(response.data);
    } catch (error) {
      console.error("Error fetching available users:", error);
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    if (!activeGroup) return;

    setLoading(true);
    try {
      const response = await api.get(`/chat-groups/${activeGroup.id}/messages`);
      setMessages(response.data.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create new group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post("/chat-groups", createForm);
      alert("Grup berhasil dibuat!");
      setShowCreateModal(false);
      setCreateForm({ name: "", description: "", member_ids: [] });
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
      alert(error.response?.data?.message || "Gagal membuat grup");
    }
  };

  // Add member to group
  const handleAddMember = async (userId) => {
    if (!activeGroup) return;
    try {
      await api.post(`/chat-groups/${activeGroup.id}/members`, {
        user_id: userId,
      });
      alert("Member berhasil ditambahkan!");
      fetchGroups();
      fetchAvailableUsers();
      const updatedGroup = await api.get(`/chat-groups/${activeGroup.id}`);
      setActiveGroup(updatedGroup.data);
    } catch (error) {
      console.error("Error adding member:", error);
      alert(error.response?.data?.message || "Gagal menambah member");
    }
  };

  // Remove member from group
  const handleRemoveMember = async (memberId) => {
    if (!activeGroup) return;
    if (!window.confirm("Hapus member dari grup?")) return;

    try {
      await api.delete(`/chat-groups/${activeGroup.id}/members/${memberId}`);
      alert("Member berhasil dihapus!");
      fetchGroups();
      const updatedGroup = await api.get(`/chat-groups/${activeGroup.id}`);
      setActiveGroup(updatedGroup.data);
    } catch (error) {
      console.error("Error removing member:", error);
      alert(error.response?.data?.message || "Gagal menghapus member");
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() && !attachment) return;
    if (!activeGroup) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("message", messageInput.trim());
      if (attachment) formData.append("attachment", attachment);

      await api.post(`/chat-groups/${activeGroup.id}/messages`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessageInput("");
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchMessages();
      fetchGroups();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Hapus pesan ini?")) return;

    try {
      await api.delete(`/messages/${messageId}`);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Gagal menghapus pesan");
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchGroups();
    fetchAllUsers();
    const interval = setInterval(fetchGroups, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeGroup) {
      fetchMessages();
      fetchAvailableUsers();
      const interval = setInterval(fetchMessages, 10000); // Refresh messages every 10s
      return () => clearInterval(interval);
    }
  }, [activeGroup]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Kemarin";
    } else {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Groups Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Grup Chat</h2>
          <button
            onClick={() => {
              fetchAllUsers(); // Refresh user list before opening modal
              setShowCreateModal(true);
            }}
            className="bg-white text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition"
            title="Buat Grup Baru"
          >
            <FaPlus />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {groups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaUsers className="mx-auto text-4xl mb-2 text-gray-300" />
              <p className="text-sm">Belum ada grup</p>
              <button
                onClick={() => {
                  fetchAllUsers(); // Refresh user list before opening modal
                  setShowCreateModal(true);
                }}
                className="mt-3 text-blue-600 hover:underline text-sm"
              >
                Buat Grup Pertama
              </button>
            </div>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                onClick={() => setActiveGroup(group)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition ${
                  activeGroup?.id === group.id
                    ? "bg-blue-50 border-l-4 border-l-blue-600"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <FaUsers className="text-xl" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {group.name}
                      </h3>
                      {group.unread_count > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {group.unread_count > 9 ? "9+" : group.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {group.members_count} anggota
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {group.last_message || "Belum ada pesan"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeGroup ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900">{activeGroup.name}</h3>
                <p className="text-sm text-gray-500">
                  {activeGroup.members_count} anggota
                  {activeGroup.description && ` • ${activeGroup.description}`}
                </p>
              </div>
              <button
                onClick={() => setShowManageModal(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Kelola Grup"
              >
                <FaCog className="text-lg" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <FaUsers className="text-6xl mb-4 opacity-30" />
                  <p className="text-lg font-medium">Belum ada pesan</p>
                  <p className="text-sm">
                    Mulai percakapan dengan mengirim pesan
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isOwnMessage = msg.sender_id === currentUser.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-md lg:max-w-lg xl:max-w-xl ${
                            isOwnMessage ? "order-2" : "order-1"
                          }`}
                        >
                          {!isOwnMessage && (
                            <div className="text-xs text-gray-600 mb-1 ml-2 font-medium">
                              {msg.sender?.name}
                            </div>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwnMessage
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-900"
                            } shadow-sm`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {msg.message}
                            </p>

                            {msg.attachment && (
                              <div className="mt-2 pt-2 border-t border-blue-500 border-opacity-30">
                                <a
                                  href={`/storage/${msg.attachment}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-xs hover:underline"
                                >
                                  <FaPaperclip className="text-xs" />
                                  <span>Lihat Lampiran</span>
                                </a>
                              </div>
                            )}

                            <div
                              className={`text-xs mt-1 flex items-center gap-2 ${
                                isOwnMessage ? "text-blue-100" : "text-gray-500"
                              }`}
                            >
                              <span>{formatTime(msg.created_at)}</span>
                              {isOwnMessage && (
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="hover:text-red-300 transition"
                                  title="Hapus"
                                >
                                  <FaTrash className="text-xs" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setAttachment(e.target.files[0])}
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  title="Lampiran"
                >
                  <FaPaperclip className="text-lg" />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Ketik pesan..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {attachment && (
                    <div className="absolute top-full left-0 mt-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded flex items-center gap-2">
                      <FaPaperclip />
                      <span>{attachment.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachment(null);
                          fileInputRef.current.value = "";
                        }}
                        className="hover:text-blue-900"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={sending || (!messageInput.trim() && !attachment)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  <FaPaperPlane />
                  <span>{sending ? "Kirim..." : "Kirim"}</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <FaUsers className="mx-auto text-6xl mb-4 opacity-30" />
              <p className="text-lg">Pilih grup untuk memulai chat</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                Buat Grup Baru
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Grup <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Tim IT, Project X, dll"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Deskripsi singkat tentang grup..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Anggota <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                  {allUsers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <FaUsers className="mx-auto text-3xl mb-2 opacity-30" />
                      <p className="text-sm">
                        Tidak ada user lain yang tersedia
                      </p>
                      <p className="text-xs mt-1">
                        Semua user sudah menjadi anggota atau sedang loading...
                      </p>
                    </div>
                  ) : (
                    allUsers.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={createForm.member_ids.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCreateForm({
                                ...createForm,
                                member_ids: [...createForm.member_ids, user.id],
                              });
                            } else {
                              setCreateForm({
                                ...createForm,
                                member_ids: createForm.member_ids.filter(
                                  (id) => id !== user.id,
                                ),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.email} • {user.role}
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {createForm.member_ids.length} anggota dipilih (Anda akan
                  otomatis menjadi admin grup)
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <FaTimes />
                  <span>Batal</span>
                </button>
                <button
                  type="submit"
                  disabled={
                    !createForm.name || createForm.member_ids.length === 0
                  }
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <FaSave />
                  <span>Buat Grup</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Group Modal */}
      {showManageModal && activeGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                Kelola Grup: {activeGroup.name}
              </h3>
              <button
                onClick={() => setShowManageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Members */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Anggota Saat Ini ({activeGroup.members?.length || 0})
                </h4>
                <div className="space-y-2">
                  {activeGroup.members?.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {member.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {member.email} • {member.role}
                        </div>
                      </div>
                      {member.id !== activeGroup.created_by && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus dari grup"
                        >
                          <FaUserMinus />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Members */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Tambah Anggota Baru
                </h4>
                {availableUsers.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Semua user sudah menjadi anggota grup
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.email} • {user.role}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddMember(user.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                        >
                          <FaUserPlus />
                          <span>Tambah</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={() => setShowManageModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatGroups;
