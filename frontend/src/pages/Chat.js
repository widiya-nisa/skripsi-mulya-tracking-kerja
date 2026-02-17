import React, { useState, useEffect, useRef } from "react";
import {
  FaPaperPlane,
  FaUsers,
  FaUser,
  FaPaperclip,
  FaDownload,
  FaTrash,
  FaPlus,
  FaSave,
  FaTimes,
  FaEdit,
  FaUserMinus,
  FaInfoCircle,
  FaFilePdf,
  FaFileWord,
  FaFileAlt,
  FaImage,
} from "react-icons/fa";
import api from "../services/api";
import { authService } from "../services";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const currentUser = authService.getCurrentUser();
  const { toasts, showToast, hideToast } = useToast();

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    member_ids: [],
  });

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  });

  // Fetch all users for creating group
  const fetchAllUsers = async () => {
    try {
      console.log("Fetching users...");
      const response = await api.get("/users");
      console.log("Users response:", response.data);

      let users = [];
      if (response.data.data) {
        users = response.data.data;
      } else if (Array.isArray(response.data)) {
        users = response.data;
      }

      console.log("All users before filter:", users);
      const filteredUsers = users.filter((u) => u.id !== currentUser?.id);
      console.log("Filtered users (excluding current):", filteredUsers);
      console.log("Current user ID:", currentUser?.id);

      setAllUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      console.error("Error details:", error.response?.data);
      showToast(
        `Gagal mengambil data user: ${error.response?.data?.message || error.message}`,
        "error",
      );
    }
  };

  // Fetch conversations (team + private + groups)
  const fetchConversations = async () => {
    try {
      // Fetch regular conversations (team + private)
      const convResponse = await api.get("/messages/conversations");

      // Fetch group chats
      const groupResponse = await api.get("/chat-groups");
      const groups = groupResponse.data || [];

      // Convert groups to conversation format
      const groupConversations = groups.map((group) => ({
        type: "group",
        group_id: group.id,
        name: group.name,
        last_message: group.last_message || "Belum ada pesan",
        last_message_at: group.updated_at,
        unread_count: group.unread_count || 0,
      }));

      // Combine both
      const allConversations = [...convResponse.data, ...groupConversations];
      setConversations(allConversations);

      // Auto-select team conversation if available
      if (allConversations.length > 0 && !activeConversation) {
        const teamConv = allConversations.find((c) => c.type === "team");
        if (teamConv) {
          setActiveConversation(teamConv);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    if (!activeConversation) return;

    setLoading(true);
    try {
      let response;
      if (activeConversation.type === "team") {
        response = await api.get(`/messages/team/${activeConversation.team}`);
      } else if (activeConversation.type === "group") {
        response = await api.get(
          `/chat-groups/${activeConversation.group_id}/messages`,
        );
      } else {
        response = await api.get(
          `/messages/private/${activeConversation.user_id}`,
        );
      }
      setMessages(response.data.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() && !attachment) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("message", messageInput.trim());

      if (activeConversation.type === "team") {
        formData.append("team", activeConversation.team);
        if (attachment) formData.append("attachment", attachment);
        await api.post("/messages/team", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (activeConversation.type === "group") {
        if (attachment) formData.append("attachment", attachment);
        await api.post(
          `/chat-groups/${activeConversation.group_id}/messages`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      } else {
        formData.append("receiver_id", activeConversation.user_id);
        if (attachment) formData.append("attachment", attachment);
        await api.post("/messages/private", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setMessageInput("");
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchMessages();
      fetchConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      showToast("Gagal mengirim pesan", "error");
    } finally {
      setSending(false);
    }
  };

  // Create new group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post("/chat-groups", createForm);
      showToast("Grup berhasil dibuat!", "success");
      setShowCreateModal(false);
      setCreateForm({ name: "", description: "", member_ids: [] });
      fetchConversations();
    } catch (error) {
      console.error("Error creating group:", error);
      showToast(error.response?.data?.message || "Gagal membuat grup", "error");
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Hapus pesan ini?")) return;

    try {
      await api.delete(`/messages/${messageId}`);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      showToast("Pesan berhasil dihapus", "success");
    } catch (error) {
      console.error("Error deleting message:", error);
      showToast("Gagal menghapus pesan", "error");
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // View group members
  const handleViewMembers = async (group) => {
    try {
      const response = await api.get(`/chat-groups/${group.group_id}`);
      setSelectedGroup(response.data);
      setGroupMembers(response.data.members || []);
      setShowMembersModal(true);
    } catch (error) {
      console.error("Error fetching group members:", error);
      showToast("Gagal mengambil data member grup", "error");
    }
  };

  // Edit group name
  const handleEditGroup = (group) => {
    setSelectedGroup(group);
    setEditForm({
      name: group.name || "",
      description: group.description || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    try {
      await api.put(
        `/chat-groups/${selectedGroup.group_id || selectedGroup.id}`,
        editForm,
      );
      showToast("Grup berhasil diupdate!", "success");
      setShowEditModal(false);
      setShowMembersModal(false);
      fetchConversations();
      // Update active conversation if it's the edited group
      if (
        activeConversation?.group_id ===
        (selectedGroup.group_id || selectedGroup.id)
      ) {
        setActiveConversation({
          ...activeConversation,
          name: editForm.name,
        });
      }
    } catch (error) {
      console.error("Error updating group:", error);
      showToast(error.response?.data?.message || "Gagal update grup", "error");
    }
  };

  // Remove member from group
  const handleRemoveMember = async (groupId, memberId, memberName) => {
    if (!window.confirm(`Keluarkan ${memberName} dari grup?`)) return;

    try {
      await api.delete(`/chat-groups/${groupId}/members/${memberId}`);
      showToast(`${memberName} berhasil dikeluarkan`, "success");
      // Refresh member list
      const response = await api.get(`/chat-groups/${groupId}`);
      setGroupMembers(response.data.members || []);
      setSelectedGroup(response.data);
    } catch (error) {
      console.error("Error removing member:", error);
      showToast(
        error.response?.data?.message || "Gagal mengeluarkan member",
        "error",
      );
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 10000); // Refresh messages every 10s
      return () => clearInterval(interval);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get file icon based on extension
  const getFileIcon = (filename) => {
    if (!filename) return <FaFileAlt />;
    const ext = filename.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(ext))
      return <FaImage className="text-blue-600" />;
    if (ext === "pdf") return <FaFilePdf className="text-red-600" />;
    if (["doc", "docx"].includes(ext))
      return <FaFileWord className="text-blue-500" />;
    return <FaFileAlt className="text-gray-600" />;
  };

  // Check if file is image
  const isImageFile = (filename) => {
    if (!filename) return false;
    const ext = filename.split(".").pop().toLowerCase();
    return ["jpg", "jpeg", "png", "gif"].includes(ext);
  };

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
    <>
      <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Percakapan</h2>
            <button
              onClick={() => {
                fetchAllUsers();
                setShowCreateModal(true);
              }}
              className="bg-white text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition"
              title="Buat Grup Baru"
            >
              <FaPlus />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaUsers className="mx-auto text-4xl mb-2 text-gray-300" />
                <p className="text-sm">Belum ada percakapan</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.type === "team" ? conv.team : conv.user_id}
                  onClick={() => setActiveConversation(conv)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition ${
                    activeConversation === conv
                      ? "bg-blue-50 border-l-4 border-l-blue-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        conv.type === "team"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600"
                          : "bg-gradient-to-br from-gray-500 to-gray-600"
                      } text-white`}
                    >
                      {conv.type === "team" ? (
                        <FaUsers className="text-xl" />
                      ) : (
                        <FaUser className="text-lg" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conv.name}
                        </h3>
                        {conv.unread_count > 0 && (
                          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conv.last_message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(conv.last_message_at)}
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
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activeConversation.type === "team"
                        ? "bg-white bg-opacity-20"
                        : "bg-white bg-opacity-20"
                    } text-white`}
                  >
                    {activeConversation.type === "team" ||
                    activeConversation.type === "group" ? (
                      <FaUsers />
                    ) : (
                      <FaUser />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">
                      {activeConversation.name}
                    </h3>
                    <p className="text-sm text-blue-100">
                      {activeConversation.type === "team"
                        ? "Grup Tim"
                        : activeConversation.type === "group"
                          ? "Grup Chat"
                          : "Pesan Pribadi"}
                    </p>
                  </div>
                </div>
                {activeConversation.type === "group" && (
                  <button
                    onClick={() => handleViewMembers(activeConversation)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition flex items-center gap-2"
                    title="Info Grup"
                  >
                    <FaInfoCircle />
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <FaPaperPlane className="mx-auto text-5xl text-gray-300 mb-3" />
                      <p>Belum ada pesan</p>
                      <p className="text-sm mt-1">Mulai percakapan!</p>
                    </div>
                  </div>
                ) : (
                  messages
                    .slice()
                    .reverse()
                    .map((msg) => {
                      const isOwnMessage = msg.sender_id === currentUser?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`mb-4 flex ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-md ${
                              isOwnMessage ? "items-end" : "items-start"
                            }`}
                          >
                            {!isOwnMessage && (
                              <p className="text-xs text-gray-600 mb-1 px-1">
                                {msg.sender?.name}
                              </p>
                            )}
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isOwnMessage
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-gray-900 border border-gray-200"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {msg.message}
                              </p>
                              {msg.attachment && (
                                <div className="mt-2">
                                  {isImageFile(msg.attachment) ? (
                                    // Image preview
                                    <a
                                      href={`${process.env.REACT_APP_API_URL}/storage/${msg.attachment}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block"
                                    >
                                      <img
                                        src={`${process.env.REACT_APP_API_URL}/storage/${msg.attachment}`}
                                        alt="Attachment"
                                        className="max-w-xs rounded-lg border-2 border-white shadow-md hover:shadow-lg transition cursor-pointer"
                                      />
                                    </a>
                                  ) : (
                                    // File download link
                                    <a
                                      href={`${process.env.REACT_APP_API_URL}/storage/${msg.attachment}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                        isOwnMessage
                                          ? "bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
                                          : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                                      } transition`}
                                    >
                                      {getFileIcon(msg.attachment)}
                                      <span className="font-medium max-w-[200px] truncate">
                                        {msg.attachment.split("/").pop()}
                                      </span>
                                      <FaDownload className="text-xs" />
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                            <div
                              className={`flex items-center gap-2 mt-1 px-1 ${
                                isOwnMessage ? "justify-end" : "justify-start"
                              }`}
                            >
                              <p className="text-xs text-gray-400">
                                {formatTime(msg.created_at)}
                              </p>
                              {isOwnMessage && (
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="text-xs text-red-500 hover:text-red-700"
                                  title="Hapus"
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="bg-white border-t border-gray-200 p-4">
                {attachment && (
                  <div className="mb-3 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 flex-1">
                      {isImageFile(attachment.name) ? (
                        <div className="relative">
                          <img
                            src={URL.createObjectURL(attachment)}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded border-2 border-blue-300"
                          />
                          <div className="absolute -top-1 -left-1 bg-blue-600 text-white rounded-full p-1">
                            <FaImage className="text-xs" />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white p-3 rounded border-2 border-blue-300">
                          {getFileIcon(attachment.name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(attachment.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setAttachment(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                      title="Hapus file"
                    >
                      <FaTimes className="text-lg" />
                    </button>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setAttachment(e.target.files[0])}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex-shrink-0"
                    disabled={sending}
                    title="Upload file (foto, PDF, dokumen)"
                  >
                    <FaPaperclip className="text-xl" />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Ketik pesan..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || (!messageInput.trim() && !attachment)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2"
                  >
                    {sending ? "Mengirim..." : <FaPaperPlane />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FaUsers className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-lg">Pilih percakapan untuk memulai chat</p>
              </div>
            </div>
          )}
        </div>
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

      {/* Members Modal */}
      {showMembersModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-gray-800">
                  Info Grup: {selectedGroup.name}
                </h3>
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              <button
                onClick={() => handleEditGroup(selectedGroup)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FaEdit />
                <span>Edit Nama Grup</span>
              </button>
            </div>

            <div className="p-6">
              {selectedGroup.description && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {selectedGroup.description}
                  </p>
                </div>
              )}

              <h4 className="font-semibold text-gray-700 mb-3">
                Anggota Grup ({groupMembers.length})
              </h4>
              <div className="space-y-2">
                {groupMembers.map((member) => {
                  const isCreator = member.id === selectedGroup.created_by;
                  const isCurrentUser = member.id === currentUser?.id;
                  const canRemove =
                    (currentUser?.role === "admin" ||
                      selectedGroup.created_by === currentUser?.id) &&
                    !isCreator;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {member.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {member.name}
                            {isCreator && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                Admin Grup
                              </span>
                            )}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {member.email} • {member.role}
                          </div>
                        </div>
                      </div>
                      {canRemove && (
                        <button
                          onClick={() =>
                            handleRemoveMember(
                              selectedGroup.id,
                              member.id,
                              member.name,
                            )
                          }
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Keluarkan dari grup"
                        >
                          <FaUserMinus />
                          <span>Keluarkan</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {showEditModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Edit Grup</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleUpdateGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Grup <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama grup"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Deskripsi grup (opsional)"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <FaTimes />
                  <span>Batal</span>
                </button>
                <button
                  type="submit"
                  disabled={!editForm.name}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <FaSave />
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </>
  );
};

export default Chat;
