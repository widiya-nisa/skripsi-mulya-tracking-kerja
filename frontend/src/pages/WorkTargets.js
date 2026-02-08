import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import api from "../services/api";
import Notification from "../components/Notification";

function WorkTargets() {
  const [targets, setTargets] = useState([]);
  const [subordinates, setSubordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    priority: "medium",
    deadline: "",
  });
  const user = JSON.parse(localStorage.getItem("user"));
  const [notification, setNotification] = useState(null);

  // Pagination & Filter
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchTargets();
    fetchSubordinates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTargets = async () => {
    try {
      const response = await api.get("/work-targets");
      setTargets(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching targets:", error);
      setLoading(false);
    }
  };

  const fetchSubordinates = async () => {
    try {
      const response = await api.get("/work-targets/subordinates");
      console.log("Subordinates response:", response.data);
      setSubordinates(response.data);
    } catch (error) {
      console.error("Error fetching subordinates:", error);
      console.error("Error response:", error.response);
      // Jika error 403, user tidak punya akses (karyawan)
      if (error.response?.status === 403) {
        setSubordinates([]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    // Validasi manual
    if (
      !formData.title ||
      !formData.description ||
      !formData.assigned_to ||
      !formData.priority ||
      !formData.deadline
    ) {
      setNotification({
        message: "Semua field harus diisi!",
        type: "error",
      });
      return;
    }

    try {
      if (editingTarget) {
        await api.put(`/work-targets/${editingTarget.id}`, formData);
        setNotification({
          message: "Target berhasil diupdate!",
          type: "success",
        });
      } else {
        await api.post("/work-targets", formData);
        setNotification({
          message: "Target berhasil ditambahkan!",
          type: "success",
        });
      }
      setShowModal(false);
      setFormData({
        title: "",
        description: "",
        assigned_to: "",
        priority: "medium",
        deadline: "",
      });
      setEditingTarget(null);
      fetchTargets();
    } catch (error) {
      console.error("Error submitting:", error);
      setNotification({
        message:
          error.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan target",
        type: "error",
      });
    }
  };

  const handleEdit = (target) => {
    setEditingTarget(target);
    setFormData({
      title: target.title,
      description: target.description,
      assigned_to: target.assigned_to,
      priority: target.priority || "medium",
      deadline: target.deadline.split("T")[0],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus target ini?")) {
      try {
        await api.delete(`/work-targets/${id}`);
        setNotification({
          message: "Target berhasil dihapus!",
          type: "success",
        });
        fetchTargets();
      } catch (error) {
        setNotification({
          message: error.response?.data?.message || "Gagal menghapus target",
          type: "error",
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-gray-100 text-gray-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pending",
      in_progress: "In Progress",
      completed: "Completed",
      overdue: "Overdue",
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  // Filter targets
  const filteredTargets = targets.filter((target) => {
    const matchesSearch =
      target.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      target.assigned_user?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || target.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTargets = filteredTargets.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredTargets.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => {
            setEditingTarget(null);
            setFormData({
              title: "",
              description: "",
              assigned_to: "",
              priority: "medium",
              deadline: "",
            });
            setShowModal(true);
          }}
          className="px-6 py-3 bg-[#001f3f] text-white rounded-lg hover:bg-[#003366] transition flex items-center space-x-2"
        >
          <FaPlus className="text-lg" />
          <span>Tambah Target</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Target atau Karyawan
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Ketik nama target atau karyawan..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Result count */}
        <div className="mt-3 text-sm text-gray-600">
          Menampilkan {currentTargets.length} dari {filteredTargets.length}{" "}
          target
        </div>
      </div>

      {/* Targets Table - Compact */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Target & Karyawan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Deadline
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Progress
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTargets.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchTerm || statusFilter !== "all"
                      ? "Tidak ada target yang sesuai dengan filter"
                      : "Belum ada target. Klik tombol 'Tambah Target' untuk membuat target baru."}
                  </td>
                </tr>
              ) : (
                currentTargets.map((target) => (
                  <tr key={target.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {target.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        👤 {target.assigned_user?.name} •{" "}
                        {target.assigned_user?.job_description}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {new Date(target.deadline).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(target.status)}`}
                      >
                        {getStatusLabel(target.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              target.current_percentage === 100
                                ? "bg-green-500"
                                : target.current_percentage > 0
                                  ? "bg-blue-500"
                                  : "bg-gray-300"
                            }`}
                            style={{
                              width: `${target.current_percentage || 0}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-700 font-medium">
                          {target.current_percentage || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(target)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition"
                        title="Edit"
                      >
                        <FaEdit className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDelete(target.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition"
                        title="Hapus"
                      >
                        <FaTrash className="text-lg" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#001f3f] text-white hover:bg-[#003366]"
                }`}
              >
                ← Prev
              </button>

              {/* Page numbers */}
              <div className="flex space-x-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  // Show first, last, current, and adjacent pages
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded ${
                          currentPage === pageNum
                            ? "bg-[#001f3f] text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return (
                      <span key={pageNum} className="px-2">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative z-[10000]">
            <h3 className="text-xl font-bold mb-4">
              {editingTarget ? "Edit Target" : "Tambah Target Baru"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Target
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent"
                  placeholder="Contoh: Develop Fitur Login"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi Detail
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent"
                  rows="4"
                  placeholder="Jelaskan detail target yang harus dikerjakan..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Ke
                </label>
                <select
                  value={formData.assigned_to}
                  onChange={(e) =>
                    setFormData({ ...formData, assigned_to: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent"
                  required
                >
                  <option value="">Pilih Karyawan</option>

                  {/* Group by department */}
                  {subordinates.filter((s) => s.department === "it").length >
                    0 && (
                    <optgroup label="── IT Department ──">
                      {subordinates
                        .filter((s) => s.department === "it")
                        .map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name} - {sub.job_description || sub.role}
                          </option>
                        ))}
                    </optgroup>
                  )}

                  {subordinates.filter((s) => s.department === "operasional")
                    .length > 0 && (
                    <optgroup label="── Operasional Department ──">
                      {subordinates
                        .filter((s) => s.department === "operasional")
                        .map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name} - {sub.job_description || sub.role}
                          </option>
                        ))}
                    </optgroup>
                  )}

                  {/* Others without department */}
                  {subordinates.filter(
                    (s) =>
                      !s.department ||
                      (s.department !== "it" && s.department !== "operasional"),
                  ).length > 0 && (
                    <optgroup label="── Lainnya ──">
                      {subordinates
                        .filter(
                          (s) =>
                            !s.department ||
                            (s.department !== "it" &&
                              s.department !== "operasional"),
                        )
                        .map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name} {sub.department && `- ${sub.department}`}{" "}
                            {sub.job_description && `(${sub.job_description})`}
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioritas
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent"
                  required
                >
                  <option value="low">🟢 Rendah (Low)</option>
                  <option value="medium">🟡 Sedang (Medium)</option>
                  <option value="high">🟠 Tinggi (High)</option>
                  <option value="urgent">🔴 Mendesak (Urgent)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#001f3f] text-white px-4 py-2 rounded-lg hover:bg-[#003366] transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <FaSave />
                  {editingTarget ? "Update" : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTarget(null);
                    setFormData({
                      title: "",
                      description: "",
                      assigned_to: "",
                      priority: "medium",
                      deadline: "",
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition cursor-pointer flex items-center justify-center gap-2"
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

export default WorkTargets;
