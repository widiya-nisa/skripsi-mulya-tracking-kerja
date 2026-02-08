import React, { useState, useEffect } from "react";
import { FaEye, FaTimes, FaPaperPlane } from "react-icons/fa";
import api from "../services/api";
import Notification from "../components/Notification";

function TeamProgress() {
  const [progress, setProgress] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [notification, setNotification] = useState(null);
  const [selectedProgress, setSelectedProgress] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchData = async () => {
    try {
      const [targetsRes, progressRes] = await Promise.all([
        api.get("/work-targets"),
        api.get("/work-progress"),
      ]);

      console.log("Targets response:", targetsRes.data);
      console.log("Progress response:", progressRes.data);

      setTargets(targetsRes.data);
      setProgress(progressRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      console.error("Error response:", error.response);
      setNotification({
        message: "Gagal memuat data progress tim",
        type: "error",
      });
      setLoading(false);
    }
  };

  const filteredTargets = targets.filter((target) => {
    if (filter === "all") return true;
    return target.status === filter;
  });

  const getProgressForTarget = (targetId) => {
    return progress
      .filter((p) => p.work_target_id === targetId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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

  const openDetailModal = (prog) => {
    setSelectedProgress(prog);
    setShowDetailModal(true);
    setComment("");
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProgress(null);
    setComment("");
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingComment(true);
    try {
      await api.post(`/work-progress/${selectedProgress.id}/comments`, {
        comment: comment.trim(),
      });

      setNotification({
        message: "Komentar berhasil dikirim ke karyawan",
        type: "success",
      });

      // Refresh data to get updated comments
      await fetchData();

      // Update selected progress with new comment
      const updatedProgress = progress.find(
        (p) => p.id === selectedProgress.id,
      );
      if (updatedProgress) {
        setSelectedProgress(updatedProgress);
      }

      setComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
      setNotification({
        message: "Gagal mengirim komentar",
        type: "error",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReplyComment = async (parentCommentId, replyText) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/work-progress/${selectedProgress.id}/comments`,
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

      // Update selected progress with new comments
      const updatedProgress = progress.find(
        (p) => p.id === selectedProgress.id,
      );
      if (updatedProgress) {
        setSelectedProgress(updatedProgress);
      }

      setNotification({
        message: "Balasan berhasil dikirim",
        type: "success",
      });
    } catch (error) {
      console.error("Error replying to comment:", error);
      setNotification({
        message: "Gagal mengirim balasan",
        type: "error",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  // Filter and search
  const filtered = filteredTargets.filter((target) => {
    const matchesSearch =
      target.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      target.assigned_user?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Filter & Search - Compact */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
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
              placeholder="Ketik untuk mencari..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f]"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Status
            </label>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f]"
            >
              <option value="all">Semua Status</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          Menampilkan {currentItems.length} dari {filtered.length} target
        </div>
      </div>
      {/* Targets Table - Compact View */}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Update Terakhir
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchTerm || filter !== "all"
                      ? "Tidak ada target yang sesuai dengan filter"
                      : "Belum ada target untuk tim Anda"}
                  </td>
                </tr>
              ) : (
                currentItems.map((target) => {
                  const targetProgress = getProgressForTarget(target.id);
                  const latestProgress = targetProgress[0];

                  return (
                    <tr key={target.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {target.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          👤 {target.assigned_user?.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {new Date(target.deadline).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusBadge(target.status)}`}
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
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                        {latestProgress ? (
                          <>
                            {new Date(
                              latestProgress.created_at,
                            ).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                            })}
                            <br />
                            <span className="text-gray-400">
                              {targetProgress.length} update
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400">Belum ada</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {latestProgress && (
                          <button
                            onClick={() => openDetailModal(latestProgress)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition"
                            title="Detail"
                          >
                            <FaEye className="text-lg" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
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

      {/* Detail Modal */}
      {showDetailModal && selectedProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Detail Progress
              </h3>
              <button
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 space-y-6">
              {/* Progress Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gray-500"
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
                  <span className="font-semibold text-gray-900">
                    {selectedProgress.user?.name}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                    {selectedProgress.percentage}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {new Date(selectedProgress.created_at).toLocaleString(
                    "id-ID",
                    {
                      dateStyle: "full",
                      timeStyle: "short",
                    },
                  )}
                </div>
              </div>

              {/* Deskripsi Progress */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Deskripsi Progress:
                </h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedProgress.progress_note}
                </p>
              </div>

              {/* Bukti Foto/PDF */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Bukti Progress:
                </h4>
                {selectedProgress.attachment ? (
                  <div className="border rounded-lg overflow-hidden bg-gray-50">
                    {selectedProgress.attachment.endsWith(".pdf") ? (
                      <div className="space-y-3">
                        {/* PDF Preview with iframe */}
                        <div className="bg-white p-2">
                          <iframe
                            src={`http://127.0.0.1:8000/storage/${selectedProgress.attachment}#toolbar=0`}
                            className="w-full h-96 border-0"
                            title="PDF Preview"
                          />
                        </div>
                        {/* PDF Download Link */}
                        <a
                          href={`http://127.0.0.1:8000/storage/${selectedProgress.attachment}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="flex items-center justify-center gap-3 p-4 bg-white border-t hover:bg-gray-50 transition-colors"
                        >
                          <svg
                            className="w-6 h-6 text-red-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div className="text-center">
                            <p className="font-semibold text-gray-900 text-sm">
                              Download Dokumen PDF
                            </p>
                            <p className="text-xs text-gray-500">
                              Klik untuk download atau buka di tab baru
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
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </a>
                      </div>
                    ) : (
                      <img
                        src={`http://127.0.0.1:8000/storage/${selectedProgress.attachment}`}
                        alt="Bukti Progress"
                        className="w-full h-auto"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    )}
                    <div
                      className="hidden items-center justify-center p-12 bg-gray-100 text-gray-500"
                      style={{ display: "none" }}
                    >
                      <svg
                        className="w-16 h-16"
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
                      <p className="ml-3">Gambar tidak dapat dimuat</p>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg p-8 bg-gray-50 text-center">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-500 text-sm">
                      Tidak ada bukti progress yang diupload
                    </p>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Komentar ({selectedProgress.comments?.length || 0})
                </h4>

                {/* Existing Comments */}
                {selectedProgress.comments &&
                  selectedProgress.comments.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {selectedProgress.comments.map((c) => (
                        <div key={c.id}>
                          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-900 text-sm">
                                {c.user?.name}
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                                {c.user?.role}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(c.created_at).toLocaleDateString(
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
                            <p className="text-gray-700">{c.comment}</p>

                            {/* Replies */}
                            {c.replies && c.replies.length > 0 && (
                              <div className="mt-3 ml-4 space-y-2">
                                {c.replies.map((reply) => (
                                  <div
                                    key={reply.id}
                                    className="bg-white border-l-2 border-green-400 rounded p-3"
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-gray-900 text-sm">
                                        {reply.user?.name}
                                      </span>
                                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">
                                        {reply.user?.role}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(
                                          reply.created_at,
                                        ).toLocaleDateString("id-ID", {
                                          day: "numeric",
                                          month: "short",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 text-sm">
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
                                    handleReplyComment(c.id, replyText);
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

                {/* Add Comment Form */}
                <form onSubmit={handleSubmitComment} className="space-y-3">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tulis komentar untuk karyawan..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#001f3f] focus:border-transparent resize-none"
                    rows="3"
                    disabled={submittingComment}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeDetailModal}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                      disabled={submittingComment}
                    >
                      <FaTimes />
                      Tutup
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#001f3f] text-white rounded-lg hover:bg-[#003366] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      disabled={!comment.trim() || submittingComment}
                    >
                      <FaPaperPlane />
                      {submittingComment ? "Mengirim..." : "Kirim Komentar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamProgress;
