import React, { useState, useEffect } from "react";
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Target Tim</h2>
          <p className="text-gray-600">Kelola target kerja untuk tim Anda</p>
        </div>
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
          <svg
            className="w-5 h-5"
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
          <span>Tambah Target</span>
        </button>
      </div>

      {/* Targets List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deadline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {targets.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  Belum ada target. Klik tombol "Tambah Target" untuk membuat
                  target baru.
                </td>
              </tr>
            ) : (
              targets.map((target) => (
                <tr key={target.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {target.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {target.description?.substring(0, 60)}...
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {target.assigned_user?.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {target.assigned_user?.department}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(target.deadline).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(target.status)}`}
                    >
                      {getStatusLabel(target.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
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
                      <span className="text-sm text-gray-700">
                        {target.current_percentage || 0}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(target)}
                      className="text-[#001f3f] hover:text-[#003366]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(target.id)}
                      className="text-red-600 hover:text-red-900"
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
                  {subordinates.filter(s => s.department === 'it').length > 0 && (
                    <optgroup label="── IT Department ──">
                      {subordinates
                        .filter(s => s.department === 'it')
                        .map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name} - {sub.job_description || sub.role}
                          </option>
                        ))}
                    </optgroup>
                  )}
                  
                  {subordinates.filter(s => s.department === 'operasional').length > 0 && (
                    <optgroup label="── Operasional Department ──">
                      {subordinates
                        .filter(s => s.department === 'operasional')
                        .map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name} - {sub.job_description || sub.role}
                          </option>
                        ))}
                    </optgroup>
                  )}
                  
                  {/* Others without department */}
                  {subordinates.filter(s => !s.department || (s.department !== 'it' && s.department !== 'operasional')).length > 0 && (
                    <optgroup label="── Lainnya ──">
                      {subordinates
                        .filter(s => !s.department || (s.department !== 'it' && s.department !== 'operasional'))
                        .map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name} {sub.department && `- ${sub.department}`} {sub.job_description && `(${sub.job_description})`}
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
                  className="flex-1 bg-[#001f3f] text-white px-4 py-2 rounded-lg hover:bg-[#003366] transition cursor-pointer"
                >
                  {editingTarget ? "Update" : "Tambah"}
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
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition cursor-pointer"
                >
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
