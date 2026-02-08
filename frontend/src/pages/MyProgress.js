import React, { useState, useEffect } from "react";
import api from "../services/api";
import Notification from "../components/Notification";

function MyProgress() {
  const [targets, setTargets] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [formData, setFormData] = useState({
    work_target_id: "",
    percentage: "",
    description: "",
    attachment: null,
  });
  const user = JSON.parse(localStorage.getItem("user"));
  const [notification, setNotification] = useState(null);
  const [showImages, setShowImages] = useState({});

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [targetsRes, progressRes] = await Promise.all([
        api.get("/work-targets"),
        api.get("/work-progress"),
      ]);
      console.log("📊 MyProgress - Targets:", targetsRes.data);
      console.log("📊 MyProgress - Progress:", progressRes.data);
      setTargets(targetsRes.data);
      setProgress(progressRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.work_target_id) {
      setNotification({
        message: "Pilih target terlebih dahulu",
        type: "error",
      });
      return;
    }
    if (
      !formData.percentage ||
      formData.percentage < 0 ||
      formData.percentage > 100
    ) {
      setNotification({
        message: "Percentage harus antara 0-100",
        type: "error",
      });
      return;
    }
    if (!formData.description || formData.description.trim() === "") {
      setNotification({
        message: "Deskripsi progress tidak boleh kosong",
        type: "error",
      });
      return;
    }

    try {
      const data = new FormData();
      data.append("work_target_id", formData.work_target_id);
      data.append("percentage", formData.percentage);
      data.append("progress_note", formData.description); // ✅ Ganti dari 'description' ke 'progress_note'
      if (formData.attachment) {
        data.append("attachment", formData.attachment);
      }

      await api.post("/work-progress", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setNotification({
        message: "Progress berhasil diupload!",
        type: "success",
      });
      setShowModal(false);
      setFormData({
        work_target_id: "",
        percentage: "",
        description: "",
        attachment: null,
      });
      setSelectedTarget(null);

      // Delay sedikit untuk memastikan backend selesai simpan, lalu fetch data terbaru
      setTimeout(() => {
        fetchData();
      }, 300);
    } catch (error) {
      console.error("❌ Error upload progress:", error);
      console.error("❌ Error response:", error.response?.data);
      setNotification({
        message: error.response?.data?.message || "Gagal mengupload progress",
        type: "error",
      });
    }
  };

  const handleReplyComment = async (progressId, parentCommentId, replyText) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/work-progress/${progressId}/comments`,
        {
          comment: replyText,
          parent_id: parentCommentId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Refresh data to show new reply
      await fetchData();

      setNotification({
        message: "Balasan berhasil dikirim",
        type: "success",
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error replying to comment:", error);
      setNotification({
        message: "Gagal mengirim balasan",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const getProgressForTarget = (targetId) => {
    return progress
      .filter((p) => p.work_target_id === targetId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  // Allow update for all targets except overdue
  const activeTargets = targets.filter((t) => t.status !== "overdue");

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

      {/* Upload Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            if (activeTargets.length === 0) {
              alert("Tidak ada target aktif untuk diupdate");
              return;
            }
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
          <span>Upload Progress</span>
        </button>
      </div>

      {/* Progress List by Target */}
      <div className="space-y-4">
        {targets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Belum ada target yang di-assign ke Anda
          </div>
        ) : (
          targets.map((target) => {
            const targetProgress = getProgressForTarget(target.id);
            return (
              <div
                key={target.id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                {/* Target Header */}
                <div className="bg-gradient-to-r from-[#001f3f] to-[#003366] text-white px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{target.title}</h3>
                      <p className="text-sm text-blue-100 mt-1">
                        {target.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span>
                          Deadline:{" "}
                          {new Date(target.deadline).toLocaleDateString(
                            "id-ID",
                          )}
                        </span>
                        <span>Progress: {target.current_percentage || 0}%</span>
                      </div>
                    </div>
                    {target.status !== "overdue" && (
                      <button
                        onClick={() => {
                          setSelectedTarget(target);
                          setFormData({
                            ...formData,
                            work_target_id: target.id,
                          });
                          setShowModal(true);
                        }}
                        className="bg-white text-[#001f3f] px-4 py-2 rounded-lg hover:bg-blue-50 transition text-sm font-medium"
                      >
                        Upload Progress
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Timeline */}
                <div className="px-6 py-4">
                  {targetProgress.length === 0 ? (
                    <p className="text-sm text-gray-500 italic text-center py-4">
                      Belum ada progress yang diupload
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {targetProgress.map((prog, index) => (
                        <div key={prog.id} className="flex">
                          {/* Timeline Line */}
                          <div className="flex flex-col items-center mr-4">
                            <div className="w-8 h-8 bg-[#001f3f] rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {prog.percentage}%
                            </div>
                            {index < targetProgress.length - 1 && (
                              <div className="w-0.5 h-full bg-gray-300 my-1"></div>
                            )}
                          </div>

                          {/* Progress Content */}
                          <div className="flex-1 pb-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <p className="text-sm text-gray-900 flex-1">
                                  {prog.progress_note || prog.description}
                                </p>
                                <span className="text-xs text-gray-500 ml-2">
                                  {new Date(prog.created_at).toLocaleString(
                                    "id-ID",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              </div>
                              {prog.attachment && (
                                <div className="mt-2">
                                  {prog.attachment.endsWith(".pdf") ? (
                                    <a
                                      href={`http://127.0.0.1:8000/storage/${prog.attachment}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-3 p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                      <svg
                                        className="w-12 h-12 text-red-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      <div className="flex-1">
                                        <p className="font-semibold text-gray-900 text-sm">
                                          Dokumen PDF
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Klik untuk membuka
                                        </p>
                                      </div>
                                      <svg
                                        className="w-5 h-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                        />
                                      </svg>
                                    </a>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() =>
                                          setShowImages({
                                            ...showImages,
                                            [prog.id]: !showImages[prog.id],
                                          })
                                        }
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
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
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                          />
                                        </svg>
                                        {showImages[prog.id]
                                          ? "Sembunyikan Foto"
                                          : "Lihat Foto"}
                                      </button>
                                      {showImages[prog.id] && (
                                        <img
                                          src={`http://127.0.0.1:8000/storage/${prog.attachment}`}
                                          alt="Progress attachment"
                                          className="mt-3 max-w-md rounded border"
                                        />
                                      )}
                                    </>
                                  )}
                                </div>
                              )}

                              {/* Manager Comments */}
                              {prog.comments && prog.comments.length > 0 && (
                                <div className="mt-4 space-y-3">
                                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                                    <svg
                                      className="w-4 h-4 text-green-600"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span className="text-green-600">
                                      Komentar Manager:
                                    </span>
                                  </div>
                                  {prog.comments.map((comment) => (
                                    <div key={comment.id}>
                                      <div className="bg-white border-l-4 border-green-500 rounded p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-xs font-semibold text-gray-900">
                                            {comment.user?.name}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {new Date(
                                              comment.created_at,
                                            ).toLocaleDateString("id-ID", {
                                              day: "numeric",
                                              month: "short",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                          {comment.comment}
                                        </p>

                                        {/* Replies */}
                                        {comment.replies &&
                                          comment.replies.length > 0 && (
                                            <div className="mt-3 ml-4 space-y-2">
                                              {comment.replies.map((reply) => (
                                                <div
                                                  key={reply.id}
                                                  className="bg-blue-50 border-l-2 border-blue-400 rounded p-2"
                                                >
                                                  <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-semibold text-gray-900">
                                                      {reply.user?.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                      {new Date(
                                                        reply.created_at,
                                                      ).toLocaleDateString(
                                                        "id-ID",
                                                        {
                                                          day: "numeric",
                                                          month: "short",
                                                          hour: "2-digit",
                                                          minute: "2-digit",
                                                        },
                                                      )}
                                                    </span>
                                                  </div>
                                                  <p className="text-sm text-gray-700">
                                                    {reply.comment}
                                                  </p>
                                                </div>
                                              ))}
                                            </div>
                                          )}

                                        {/* Reply Form */}
                                        <div className="mt-3">
                                          <form
                                            onSubmit={(e) => {
                                              e.preventDefault();
                                              const replyText =
                                                e.target.replyText.value.trim();
                                              if (replyText) {
                                                handleReplyComment(
                                                  prog.id,
                                                  comment.id,
                                                  replyText,
                                                );
                                                e.target.reset();
                                              }
                                            }}
                                            className="flex gap-2"
                                          >
                                            <input
                                              type="text"
                                              name="replyText"
                                              placeholder="Balas komentar..."
                                              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <button
                                              type="submit"
                                              className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                              Balas
                                            </button>
                                          </form>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Upload Progress Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Kerja
                </label>
                <select
                  value={formData.work_target_id}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      work_target_id: e.target.value,
                    });
                    setSelectedTarget(
                      targets.find((t) => t.id === parseInt(e.target.value)),
                    );
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent"
                  required
                >
                  <option value="">Pilih Target</option>
                  {activeTargets.map((target) => (
                    <option key={target.id} value={target.id}>
                      {target.title} (Current: {target.current_percentage || 0}
                      %)
                      {target.status === "completed" ? " ✓ Selesai" : ""}
                    </option>
                  ))}
                </select>
                {selectedTarget && selectedTarget.status === "completed" && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Target sudah selesai. Upload untuk revisi/update berdasarkan
                    komentar manager.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Persentase Progress (0-100%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.percentage}
                  onChange={(e) =>
                    setFormData({ ...formData, percentage: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent"
                  placeholder="Masukkan persentase (0-100)"
                  required
                />
                {selectedTarget && (
                  <p className="text-xs text-gray-500 mt-1">
                    Progress saat ini: {selectedTarget.current_percentage || 0}%
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi Progress Hari Ini
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent"
                  rows="4"
                  placeholder="Jelaskan apa yang sudah dikerjakan hari ini..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Bukti (Foto/PDF) - Max 10MB
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    setFormData({ ...formData, attachment: e.target.files[0] })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: JPG, PNG, GIF, PDF (Max: 10MB)
                </p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#001f3f] text-white px-4 py-2 rounded-lg hover:bg-[#003366] transition"
                >
                  Upload Progress
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      work_target_id: "",
                      percentage: "",
                      description: "",
                      attachment: null,
                    });
                    setSelectedTarget(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
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

export default MyProgress;
