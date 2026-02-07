import React, { useState, useEffect } from "react";
import api from "../services/api";
import Notification from "../components/Notification";
import { Link } from "react-router-dom";

function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    overdue: 0,
    in_progress: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get("/work-targets/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      setNotification({
        message: "Gagal memuat data dashboard",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplay = (role, department) => {
    if (role === "admin") return "Administrator";
    if (role === "ceo") return "Direktur Utama";
    if (role === "boss") return "Boss / CEO";
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

  const isManager = user?.role === "manager";
  const isDeveloper = user?.role === "karyawan";
  const isAdmin = user?.role === "admin";
  const isCEO = user?.role === "ceo" || user?.role === "boss";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#001f3f] to-[#003366] text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Selamat Datang, {user?.name}!
        </h1>
        <p className="text-blue-100">
          Sistem Tracking Kerja - Management Perusahaan
        </p>
        <p className="text-sm text-blue-200 mt-1">
          Role:{" "}
          <span className="font-semibold">
            {getRoleDisplay(user?.role, user?.department)}
          </span>
        </p>
      </div>

      {/* Stats Overview */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          📊{" "}
          {isAdmin || isCEO
            ? "Statistik Target Kerja"
            : isManager
              ? "Statistik Tim"
              : "Statistik Target Kerja"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Total */}
          <Link
            to={isManager ? "/work-targets" : "/my-tasks"}
            className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Target
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-blue-600"
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
          </Link>

          {/* Completed */}
          <Link
            to={isManager ? "/team-progress" : "/my-progress"}
            className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Selesai</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.completed}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-green-600"
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
          </Link>

          {/* In Progress */}
          <Link
            to={isManager ? "/team-progress" : "/my-progress"}
            className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500 hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Dalam Progress
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.in_progress}
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </Link>

          {/* Pending */}
          <Link
            to={isManager ? "/work-targets" : "/my-tasks"}
            className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-500 hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-3xl font-bold text-gray-600">
                  {stats.pending}
                </p>
              </div>
              <div className="bg-gray-100 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-gray-600"
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
          </Link>

          {/* Overdue */}
          <Link
            to={isManager ? "/team-progress" : "/my-progress"}
            className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Terlambat</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.overdue}
                </p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          ⚡ Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Manager Actions */}
          {isManager && (
            <>
              <Link
                to="/work-targets"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-2 border-blue-200 hover:border-blue-400"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <svg
                      className="w-8 h-8 text-blue-600"
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
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      Buat Target Baru
                    </h3>
                    <p className="text-sm text-gray-500">
                      Assign target kerja ke tim Anda
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/team-progress"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-2 border-green-200 hover:border-green-400"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 rounded-lg p-3">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Lihat Laporan</h3>
                    <p className="text-sm text-gray-500">
                      Monitor progress tim Anda
                    </p>
                  </div>
                </div>
              </Link>
            </>
          )}

          {/* Developer Actions */}
          {isDeveloper && (
            <>
              <Link
                to="/my-tasks"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-2 border-blue-200 hover:border-blue-400"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      Lihat Target Saya
                    </h3>
                    <p className="text-sm text-gray-500">
                      Cek target yang di-assign ke Anda
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/my-progress"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-2 border-green-200 hover:border-green-400"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 rounded-lg p-3">
                    <svg
                      className="w-8 h-8 text-green-600"
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
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Upload Progress</h3>
                    <p className="text-sm text-gray-500">
                      Update progress & upload bukti kerja
                    </p>
                  </div>
                </div>
              </Link>
            </>
          )}

          {/* CEO/Boss Actions */}
          {isCEO && (
            <>
              <Link
                to="/work-targets"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-2 border-indigo-200 hover:border-indigo-400"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 rounded-lg p-3">
                    <svg
                      className="w-8 h-8 text-indigo-600"
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
                  <div>
                    <h3 className="font-bold text-gray-800">Semua Target</h3>
                    <p className="text-sm text-gray-500">
                      Monitor semua target kerja perusahaan
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/team-progress"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-2 border-green-200 hover:border-green-400"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 rounded-lg p-3">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      Laporan Semua Tim
                    </h3>
                    <p className="text-sm text-gray-500">
                      Monitor progress semua tim
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/users"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-2 border-purple-200 hover:border-purple-400"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-100 rounded-lg p-3">
                    <svg
                      className="w-8 h-8 text-purple-600"
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
                  <div>
                    <h3 className="font-bold text-gray-800">Data Karyawan</h3>
                    <p className="text-sm text-gray-500">
                      Lihat data semua karyawan
                    </p>
                  </div>
                </div>
              </Link>
            </>
          )}

          {/* Admin has access to everything */}
          {user?.role === "admin" && (
            <>
              <Link
                to="/users"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-2 border-purple-200 hover:border-purple-400"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-100 rounded-lg p-3">
                    <svg
                      className="w-8 h-8 text-purple-600"
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
                  <div>
                    <h3 className="font-bold text-gray-800">Kelola User</h3>
                    <p className="text-sm text-gray-500">
                      Tambah, edit, atau hapus user
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/settings"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-2 border-gray-200 hover:border-gray-400"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <svg
                      className="w-8 h-8 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Pengaturan</h3>
                    <p className="text-sm text-gray-500">
                      Konfigurasi sistem & upload logo
                    </p>
                  </div>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Sistem Tracking Kerja
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                {isManager &&
                  "Sebagai Manager, Anda dapat membuat target kerja untuk tim Anda dan memantau progress mereka."}
                {isDeveloper &&
                  "Sebagai Staff, Anda dapat melihat target yang di-assign ke Anda dan mengupdate progress beserta bukti kerja."}
                {user?.role === "admin" &&
                  "Sebagai Admin, Anda memiliki akses penuh untuk mengelola user, melihat semua target, dan konfigurasi sistem."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
