import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import api from "../services/api";
import Notification from "../components/Notification";

function Users() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    admin: 0,
    ceo: 0,
    manager: 0,
    karyawan: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "karyawan",
    department: "",
    job_description: "",
    manager_id: "",
  });
  const [filterRole, setFilterRole] = useState("all");
  const [notification, setNotification] = useState(null);
  const [canEdit, setCanEdit] = useState(false); // Track if user can edit
  const [departments, setDepartments] = useState([]); // Dynamic departments list
  const [managers, setManagers] = useState([]); // List of managers
  const currentUser = JSON.parse(localStorage.getItem("user"));

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchDepartments();
    fetchManagers();
  }, [filterRole]);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users", {
        params: { role: filterRole },
      });
      setUsers(response.data.data);
      setCanEdit(response.data.can_edit); // Set whether user can edit
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/users/stats");
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await api.get("/users", {
        params: { role: "manager" },
      });
      setManagers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
        setNotification({
          message: "User berhasil diupdate!",
          type: "success",
        });
      } else {
        await api.post("/users", formData);
        setNotification({
          message: "User berhasil ditambahkan!",
          type: "success",
        });
      }
      setShowModal(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "karyawan",
        department: "",
        job_description: "",
        manager_id: "",
      });
      setEditingUser(null);
      fetchUsers();
      fetchStats();
    } catch (error) {
      setNotification({
        message:
          error.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan data",
        type: "error",
      });
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      department: user.department || "",
      job_description: user.job_description || "",
      manager_id: user.manager_id || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus user ini?")) {
      try {
        await api.delete(`/users/${id}`);
        setNotification({ message: "User berhasil dihapus!", type: "success" });
        fetchUsers();
        fetchStats();
      } catch (error) {
        setNotification({
          message: error.response?.data?.message || "Gagal menghapus user",
          type: "error",
        });
      }
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: "bg-red-100 text-red-800",
      ceo: "bg-purple-100 text-purple-800",
      manager: "bg-blue-100 text-blue-800",
      karyawan: "bg-green-100 text-green-800",
    };
    return badges[role] || "bg-gray-100 text-gray-800";
  };

  const getRoleLabel = (role, department) => {
    if (role === "admin") return "Administrator";
    if (role === "ceo") return "CEO / Direktur";
    if (role === "manager") {
      if (department === "it") return "Manager IT";
      if (department === "operasional") return "Manager Operasional";
      return "Manager";
    }
    if (role === "karyawan") {
      if (department === "frontend") return "Frontend Developer";
      if (department === "backend") return "Backend Developer";
      if (department === "mobile") return "Mobile Developer";
      if (department === "business_analyst") return "Business Analyst";
      if (department === "pemasaran") return "Staff Pemasaran";
      return "Karyawan";
    }
    return role;
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  // Filter and search
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.job_description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-[#001f3f] rounded-md p-2 md:p-3">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div className="ml-2 md:ml-4">
              <p className="text-xs md:text-sm font-medium text-gray-500">
                Total Users
              </p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-600 rounded-md p-2 md:p-3">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <div className="ml-2 md:ml-4">
              <p className="text-xs md:text-sm font-medium text-gray-500">
                CEO
              </p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">
                {stats.ceo}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-600 rounded-md p-2 md:p-3">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-2 md:ml-4">
              <p className="text-xs md:text-sm font-medium text-gray-500">
                Manager
              </p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">
                {stats.manager}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-600 rounded-md p-2 md:p-3">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-2 md:ml-4">
              <p className="text-xs md:text-sm font-medium text-gray-500">
                Karyawan
              </p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">
                {stats.karyawan}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-600 rounded-md p-2 md:p-3">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div className="ml-2 md:ml-4">
              <p className="text-xs md:text-sm font-medium text-gray-500">
                Admin
              </p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">
                {stats.admin}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow">
        {/* Search & Filter */}
        <div className="px-4 md:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari nama, email, atau posisi..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f]"
              />
            </div>

            {/* Filter & Add Button */}
            <div className="flex items-center space-x-3">
              <select
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f]"
              >
                <option value="all">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="ceo">CEO / Direktur</option>
                <option value="manager">Manager</option>
                <option value="karyawan">Karyawan</option>
              </select>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setFormData({
                    name: "",
                    email: "",
                    password: "",
                    role: "karyawan",
                    department: "",
                    job_description: "",
                    manager_id: "",
                  });
                  setShowModal(true);
                }}
                className="px-3 md:px-4 py-2 bg-[#001f3f] text-white rounded-lg hover:bg-[#003366] transition flex items-center whitespace-nowrap text-sm"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Tambah User
              </button>
            </div>
          </div>

          {/* Result count */}
          <div className="mt-3 text-sm text-gray-600">
            Menampilkan {currentUsers.length} dari {filteredUsers.length} user
          </div>
        </div>

        {/* Table - Compact */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Department & Posisi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Manager
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchTerm || filterRole !== "all"
                      ? "Tidak ada user yang sesuai dengan filter"
                      : "Belum ada user"}
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-[#001f3f] flex items-center justify-center text-white font-bold">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : user.role === "ceo"
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "manager"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role === "ceo"
                          ? "CEO"
                          : user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>
                        {user.department && (
                          <span className="text-xs font-medium text-gray-900">
                            {user.department.toUpperCase()}
                          </span>
                        )}
                        {user.job_description && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {user.job_description}
                          </div>
                        )}
                        {!user.department && !user.job_description && (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {user.manager?.name || (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm space-x-2">
                      {canEdit && (
                        <>
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition"
                            title="Edit"
                          >
                            <FaEdit className="text-lg" />
                          </button>
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition"
                              title="Hapus"
                            >
                              <FaTrash className="text-lg" />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400"
                    : "bg-[#001f3f] text-white hover:bg-[#003366]"
                }`}
              >
                ← Prev
              </button>

              {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = index + 1;
                } else if (currentPage <= 3) {
                  pageNum = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + index;
                } else {
                  pageNum = currentPage - 2 + index;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === pageNum
                        ? "bg-[#001f3f] text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400"
                    : "bg-[#001f3f] text-white hover:bg-[#003366]"
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              {editingUser ? "Edit User" : "Tambah User Baru"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent"
                  placeholder="Masukkan email pengguna"
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password{" "}
                  {editingUser && "(kosongkan jika tidak ingin mengubah)"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent"
                  required={!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent"
                  required
                >
                  <option value="karyawan">Karyawan</option>
                  <option value="manager">Manager</option>
                  <option value="ceo">CEO / Direktur</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {/* Department - Only for Manager and Karyawan */}
              {(formData.role === "manager" ||
                formData.role === "karyawan") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      setFormData({
                        ...formData,
                        department: newDept,
                        job_description: "", // Reset job description when department changes
                        manager_id: "", // Reset manager when department changes
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent"
                    required
                  >
                    <option value="">Pilih Department</option>
                    <option value="it">IT</option>
                    <option value="operasional">Operasional</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description / Posisi{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.job_description || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      job_description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent"
                  required
                  disabled={
                    !formData.department &&
                    (formData.role === "manager" ||
                      formData.role === "karyawan")
                  }
                >
                  <option value="">
                    {!formData.department &&
                    (formData.role === "manager" ||
                      formData.role === "karyawan")
                      ? "Pilih Department terlebih dahulu"
                      : "Pilih Job Description"}
                  </option>

                  {/* Show IT departments if role is manager/karyawan with IT dept */}
                  {formData.department === "it" &&
                    (formData.role === "manager" ||
                      formData.role === "karyawan") &&
                    departments
                      .filter((d) => d.type === "it")
                      .map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}{" "}
                          {dept.description && `- ${dept.description}`}
                        </option>
                      ))}

                  {/* Show Operasional departments if role is manager/karyawan with Operasional dept */}
                  {formData.department === "operasional" &&
                    (formData.role === "manager" ||
                      formData.role === "karyawan") &&
                    departments
                      .filter((d) => d.type === "operasional")
                      .map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}{" "}
                          {dept.description && `- ${dept.description}`}
                        </option>
                      ))}

                  {/* Show Admin job description for admin role */}
                  {formData.role === "admin" &&
                    departments
                      .filter((d) => d.type === "admin")
                      .map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}{" "}
                          {dept.description && `- ${dept.description}`}
                        </option>
                      ))}

                  {/* Show CEO job description for ceo role */}
                  {formData.role === "ceo" &&
                    departments
                      .filter((d) => d.type === "ceo")
                      .map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}{" "}
                          {dept.description && `- ${dept.description}`}
                        </option>
                      ))}
                </select>
                {!formData.department &&
                  (formData.role === "manager" ||
                    formData.role === "karyawan") && (
                    <p className="text-xs text-gray-500 mt-1">
                      Silakan pilih Department terlebih dahulu untuk melihat
                      opsi Job Description
                    </p>
                  )}
              </div>
              {formData.role === "karyawan" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manager
                  </label>
                  <select
                    value={formData.manager_id || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        manager_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent"
                  >
                    <option value="">Pilih Manager (Opsional)</option>
                    {managers
                      .filter((m) => m.department === formData.department)
                      .map((manager) => (
                        <option key={manager.id} value={manager.id}>
                          {manager.name} -{" "}
                          {manager.department &&
                            `Manager ${manager.department.toUpperCase()}`}
                        </option>
                      ))}
                  </select>
                </div>
              )}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#001f3f] text-white px-4 py-2 rounded-lg hover:bg-[#003366] transition flex items-center justify-center gap-2"
                >
                  <FaSave />
                  {editingUser ? "Update" : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    setFormData({
                      name: "",
                      email: "",
                      password: "",
                      role: "karyawan",
                      department: "",
                      job_description: "",
                      manager_id: "",
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition flex items-center justify-center gap-2"
                >
                  <FaTimes />
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
