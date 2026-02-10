import React, { useState, useEffect } from "react";
import api from "../services/api";
import Notification from "../components/Notification";

function PasswordResetRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalType, setModalType] = useState(""); // 'approve' or 'reject'
  const [formData, setFormData] = useState({
    new_password: "",
    admin_notes: "",
  });
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [filterStatus]);

  const fetchRequests = async () => {
    try {
      const response = await api.get("/password-reset/requests", {
        params: { status: filterStatus },
      });
      setRequests(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/password-reset/requests/statistics");
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setModalType("approve");
    setFormData({ new_password: "", admin_notes: "" });
    setShowModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setModalType("reject");
    setFormData({ new_password: "", admin_notes: "" });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === "approve") {
        await api.post(
          `/password-reset/requests/${selectedRequest.id}/approve`,
          formData
        );
        setNotification({
          message: `Password berhasil direset! Password baru: ${formData.new_password}. Silakan kirim ke user via WhatsApp.`,
          type: "success",
        });
      } else {
        await api.post(
          `/password-reset/requests/${selectedRequest.id}/reject`,
          { admin_notes: formData.admin_notes }
        );
        setNotification({
          message: "Request berhasil ditolak",
          type: "success",
        });
      }
      setShowModal(false);
      fetchRequests();
      fetchStats();
    } catch (error) {
      setNotification({
        message:
          error.response?.data?.message || "Terjadi kesalahan saat memproses",
        type: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus request ini?")) {
      try {
        await api.delete(`/password-reset/requests/${id}`);
        setNotification({
          message: "Request berhasil dihapus",
          type: "success",
        });
        fetchRequests();
        fetchStats();
      } catch (error) {
        setNotification({
          message: error.response?.data?.message || "Gagal menghapus request",
          type: "error",
        });
      }
    }
  };

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, new_password: password });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Menunggu",
      approved: "Disetujui",
      rejected: "Ditolak",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#001f3f]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Password Reset Requests
        </h1>
        <p className="text-gray-600">
          Kelola permintaan reset password dari user
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Menunggu</p>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Disetujui</p>
              <p className="text-3xl font-bold">{stats.approved}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Ditolak</p>
              <p className="text-3xl font-bold">{stats.rejected}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#001f3f] to-[#003366] rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f]"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Menunggu</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Password Baru
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Tidak ada request
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {request.name || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {request.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(request.created_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(request.status)}`}
                      >
                        {getStatusLabel(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {request.new_password ? (
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {request.new_password}
                        </code>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {request.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(request)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleReject(request)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Tolak
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(request.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">
              {modalType === "approve"
                ? "Setujui Reset Password"
                : "Tolak Request"}
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {selectedRequest?.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Nama:</strong> {selectedRequest?.name || "-"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {modalType === "approve" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Baru <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.new_password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          new_password: e.target.value,
                        })
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f]"
                      placeholder="Masukkan password baru"
                      required
                    />
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Admin {modalType === "reject" && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={formData.admin_notes}
                  onChange={(e) =>
                    setFormData({ ...formData, admin_notes: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f]"
                  rows="3"
                  placeholder="Tambahkan catatan (opsional)"
                  required={modalType === "reject"}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2 rounded-lg text-white ${
                    modalType === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {modalType === "approve" ? "Setujui" : "Tolak"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PasswordResetRequests;
