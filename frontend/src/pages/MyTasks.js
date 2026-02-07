import React, { useState, useEffect } from "react";
import api from "../services/api";
import Notification from "../components/Notification";

function MyTasks() {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [notification, setNotification] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState(null);

  useEffect(() => {
    fetchTargets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTargets = async () => {
    try {
      console.log("📡 Fetching targets from backend...");
      const response = await api.get("/work-targets");
      console.log("📦 Targets received:", response.data);
      setTargets(response.data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching targets:", error);
      setLoading(false);
    }
  };

  /**
   * 🔥 INTEGRASI LENGKAP DENGAN BACKEND
   *
   * FLOW SAAT KLIK "YA, MULAI KERJA":
   *
   * [FRONTEND] → [BACKEND API] → [DATABASE]
   *
   * 1. User klik tombol "Mulai Kerja" di card
   * 2. Muncul popup konfirmasi custom
   * 3. User klik "Ya, Mulai Kerja"
   * 4. Function handleStartWork() dipanggil
   * 5. POST request ke: http://127.0.0.1:8000/api/work-progress
   * 6. Data dikirim: { work_target_id, percentage: 0, progress_note }
   * 7. Backend (WorkProgressController@store) memproses:
   *    - Validasi data
   *    - Simpan ke table work_progress
   *    - Update status work_target: pending → in_progress
   * 8. Backend return response sukses
   * 9. Frontend terima response
   * 10. Tutup modal
   * 11. Tampilkan notification sukses
   * 12. Refresh data (fetchTargets) - ambil data terbaru dari backend
   * 13. UI otomatis update: tombol "Mulai Kerja" hilang, status jadi "In Progress"
   */
  const handleStartWork = async (targetId) => {
    console.log(
      "✅ STEP 1: handleStartWork dipanggil dengan targetId:",
      targetId,
    );

    try {
      console.log(
        "✅ STEP 2: Mengirim POST request ke BACKEND /api/work-progress",
      );

      // 🔥 INTEGRASI DENGAN BACKEND - OTOMATIS HIT API
      const response = await api.post("/work-progress", {
        work_target_id: targetId,
        percentage: 0,
        progress_note: "Memulai pekerjaan",
      });

      console.log("✅ STEP 3: Response dari BACKEND berhasil:", response.data);
      console.log("📊 Data yang tersimpan di DATABASE:", {
        id: response.data.id,
        work_target_id: response.data.work_target_id,
        user_id: response.data.user_id,
        percentage: response.data.percentage,
        progress_note: response.data.progress_note,
      });

      // STEP 4: Tutup modal konfirmasi
      setShowConfirmModal(false);

      // STEP 5: Tampilkan notifikasi sukses
      setNotification({
        message:
          'Berhasil memulai pekerjaan! Status target berubah menjadi "In Progress"',
        type: "success",
      });

      // STEP 6: Refresh data dari backend untuk update UI
      console.log("✅ STEP 4: Me-refresh data targets dari backend...");
      fetchTargets(); // Ambil data terbaru dari backend
    } catch (error) {
      console.error("❌ ERROR: Gagal menyimpan ke backend", error);
      console.error("❌ Detail error dari backend:", error.response?.data);
      setShowConfirmModal(false);
      setNotification({
        message:
          error.response?.data?.message ||
          error.response?.data?.errors ||
          "Gagal memulai pekerjaan",
        type: "error",
      });
    }
  };

  const openConfirmModal = (targetId) => {
    console.log("Opening confirm modal for target:", targetId);
    setSelectedTargetId(targetId);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedTargetId(null);
  };

  const filteredTargets = targets.filter((target) => {
    if (filter === "all") return true;
    return target.status === filter;
  });

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
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Target Saya</h2>
        <p className="text-gray-600">
          Lihat dan kelola target kerja yang di-assign ke Anda
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "all"
                ? "bg-[#001f3f] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "pending"
                ? "bg-[#001f3f] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("in_progress")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "in_progress"
                ? "bg-[#001f3f] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "completed"
                ? "bg-[#001f3f] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTargets.length === 0 ? (
          <div className="col-span-3 bg-white rounded-lg shadow p-8 text-center text-gray-500">
            {filter === "all"
              ? "Belum ada target yang di-assign ke Anda"
              : `Tidak ada target dengan status ${getStatusLabel(filter)}`}
          </div>
        ) : (
          filteredTargets.map((target) => (
            <div
              key={target.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-[#001f3f] to-[#003366] text-white p-4">
                <h3 className="font-semibold text-lg mb-1">{target.title}</h3>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                    target.status,
                  )}`}
                >
                  {getStatusLabel(target.status)}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <p className="text-sm text-gray-600">{target.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-gray-700">
                      Manager: {target.manager?.name}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-700">
                      Deadline:{" "}
                      {new Date(target.deadline).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">
                      Progress
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      {target.current_percentage || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        target.current_percentage === 100
                          ? "bg-green-500"
                          : target.current_percentage > 0
                            ? "bg-blue-500"
                            : "bg-gray-300"
                      }`}
                      style={{ width: `${target.current_percentage || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Button */}
                {target.status === "pending" && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Button clicked! Target ID:", target.id);
                      openConfirmModal(target.id);
                    }}
                    className="w-full mt-3 bg-[#001f3f] text-white px-4 py-2 rounded-lg hover:bg-[#003366] transition flex items-center justify-center space-x-2 cursor-pointer relative z-10"
                    type="button"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Mulai Kerja</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Custom Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl transform transition-all">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Konfirmasi Mulai Kerja
                </h3>
                <p className="text-sm text-gray-600">
                  Apakah Anda yakin ingin memulai pekerjaan ini?
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 rounded">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Yang akan terjadi:</span>
              </p>
              <ul className="text-sm text-gray-600 mt-2 ml-4 list-disc space-y-1">
                <li>
                  Status target berubah menjadi{" "}
                  <span className="font-semibold text-blue-600">
                    "In Progress"
                  </span>
                </li>
                <li>Progress awal (0%) akan tercatat</li>
                <li>
                  Anda bisa mulai upload progress di menu{" "}
                  <span className="font-semibold">"Progress Kerja"</span>
                </li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  console.log("Confirm button clicked");
                  handleStartWork(selectedTargetId);
                }}
                className="flex-1 bg-[#001f3f] text-white px-4 py-3 rounded-lg hover:bg-[#003366] transition font-medium"
              >
                Ya, Mulai Kerja
              </button>
              <button
                onClick={closeConfirmModal}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyTasks;
