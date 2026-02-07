import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    // Fetch logo from localStorage or API
    const savedLogo = localStorage.getItem("appLogo");
    if (savedLogo) {
      setLogo(savedLogo);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navy */}
      <aside className="w-64 bg-gradient-to-b from-[#001f3f] to-[#003366] text-white flex flex-col shadow-xl">
        {/* Logo */}
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center space-x-3">
            {logo ? (
              <img
                src={logo}
                alt="Logo"
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="bg-white rounded-lg p-2">
                <svg
                  className="w-8 h-8 text-[#001f3f]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">Tracking Kerja</h1>
              <p className="text-xs text-blue-200">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link
            to="/dashboard"
            className={`flex items-center px-4 py-3 rounded-lg transition ${
              isActive("/dashboard")
                ? "bg-white text-[#001f3f] font-medium shadow-md"
                : "text-blue-100 hover:bg-white hover:bg-opacity-10"
            }`}
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Dashboard
          </Link>

          {/* Manager Menu - Semua Manager */}
          {user?.role === "manager" && (
            <>
              <Link
                to="/work-targets"
                className={`flex items-center px-4 py-3 rounded-lg transition ${
                  isActive("/work-targets")
                    ? "bg-white text-[#001f3f] font-medium shadow-md"
                    : "text-blue-100 hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                Target Tim
              </Link>

              <Link
                to="/team-progress"
                className={`flex items-center px-4 py-3 rounded-lg transition ${
                  isActive("/team-progress")
                    ? "bg-white text-[#001f3f] font-medium shadow-md"
                    : "text-blue-100 hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
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
                Laporan Tim
              </Link>

              {/* Activity Log for Manager */}
              <div className="border-t border-blue-800 my-2"></div>
              <Link
                to="/activity-log"
                className={`flex items-center px-4 py-3 rounded-lg transition ${
                  isActive("/activity-log")
                    ? "bg-white text-[#001f3f] font-medium shadow-md"
                    : "text-blue-100 hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
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
                Log Aktivitas
              </Link>
            </>
          )}

          {/* CEO Menu - Akses ke semua data (read-only) */}
          {user?.role === "ceo" && (
            <>
              <div className="border-t border-blue-800 my-2"></div>
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  Monitoring
                </p>
              </div>

              <Link
                to="/work-targets"
                className={`flex items-center px-4 py-3 rounded-lg transition ${
                  isActive("/work-targets")
                    ? "bg-white text-[#001f3f] font-medium shadow-md"
                    : "text-blue-100 hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                Semua Target
              </Link>

              <Link
                to="/team-progress"
                className={`flex items-center px-4 py-3 rounded-lg transition ${
                  isActive("/team-progress")
                    ? "bg-white text-[#001f3f] font-medium shadow-md"
                    : "text-blue-100 hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
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
                Laporan Semua Tim
              </Link>

              <Link
                to="/users"
                className={`flex items-center px-4 py-3 rounded-lg transition ${
                  isActive("/users")
                    ? "bg-white text-[#001f3f] font-medium shadow-md"
                    : "text-blue-100 hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
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
                Data Karyawan
              </Link>

              {/* Departments Management */}
              <Link
                to="/departments"
                className={`flex items-center px-4 py-3 rounded-lg transition ${
                  isActive("/departments")
                    ? "bg-white text-[#001f3f] font-medium shadow-md"
                    : "text-blue-100 hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                Department
              </Link>

              {/* Activity Log for CEO */}
              <div className="border-t border-blue-800 my-2"></div>
              <Link
                to="/activity-log"
                className={`flex items-center px-4 py-3 rounded-lg transition ${
                  isActive("/activity-log")
                    ? "bg-white text-[#001f3f] font-medium shadow-md"
                    : "text-blue-100 hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
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
                Log Aktivitas
              </Link>
            </>
          )}

          {/* Karyawan Menu - Semua Karyawan */}
          {user?.role === "karyawan" && (
            <>
              <Link
                to="/my-tasks"
                className={`flex items-center px-4 py-3 rounded-lg transition ${
                  isActive("/my-tasks")
                    ? "bg-white text-[#001f3f] font-medium shadow-md"
                    : "text-blue-100 hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
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
                Target Saya
              </Link>

              <Link
                to="/my-progress"
                className={`flex items-center px-4 py-3 rounded-lg transition ${
                  isActive("/my-progress")
                    ? "bg-white text-[#001f3f] font-medium shadow-md"
                    : "text-blue-100 hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
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
                Progress Saya
              </Link>

              {/* Activity Log for Karyawan */}
              <div className="border-t border-blue-800 my-2"></div>
              <Link
                to="/activity-log"
                className={`flex items-center px-4 py-3 rounded-lg transition ${
                  isActive("/activity-log")
                    ? "bg-white text-[#001f3f] font-medium shadow-md"
                    : "text-blue-100 hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
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
                Log Aktivitas
              </Link>
            </>
          )}

          {/* Admin Only Menu */}
          {user?.role === "admin" && (
            <>
              <div className="border-t border-blue-800 my-2"></div>
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  Monitoring
                </p>
              </div>

              <Link
                to="/work-targets"
                className={`flex items-center px-4 py-3 rounded-lg transition ${
                  isActive("/work-targets")
                    ? "bg-white text-[#001f3f] font-medium shadow-md"
                    : "text-blue-100 hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                Semua Target
              </Link>

              <Link
                to="/team-progress"
                className={`flex items-center px-4 py-3 rounded-lg transition ${
                  isActive("/team-progress")
                    ? "bg-white text-[#001f3f] font-medium shadow-md"
                    : "text-blue-100 hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
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
                Laporan Semua Tim
              </Link>

              <div className="border-t border-blue-800 my-2"></div>
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  Administrator
                </p>
              </div>

              <Link
                to="/users"
                className={`flex items-center px-4 py-3 rounded-lg transition ${
                  isActive("/users")
                    ? "bg-white text-[#001f3f] font-medium shadow-md"
                    : "text-blue-100 hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
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
                User Management
              </Link>

              <Link
                to="/settings"
                className={`flex items-center px-4 py-3 rounded-lg transition ${
                  isActive("/settings")
                    ? "bg-white text-[#001f3f] font-medium shadow-md"
                    : "text-blue-100 hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
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
                Pengaturan
              </Link>

              {/* Activity Log for Admin */}
              <div className="border-t border-blue-800 my-2"></div>
              <Link
                to="/activity-log"
                className={`flex items-center px-4 py-3 rounded-lg transition ${
                  isActive("/activity-log")
                    ? "bg-white text-[#001f3f] font-medium shadow-md"
                    : "text-blue-100 hover:bg-white hover:bg-opacity-10"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
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
                Log Aktivitas
              </Link>
            </>
          )}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-[#001f3f]">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-blue-200 truncate capitalize">
                  {user?.role === "admin" && "Administrator"}
                  {user?.role === "ceo" && "Direktur Utama"}
                  {user?.role === "boss" && "Boss / CEO"}
                  {user?.role === "manager" &&
                    user?.department &&
                    (user.department === "it" 
                      ? "Manager IT" 
                      : user.department === "operasional"
                        ? "Manager Operasional"
                        : `Manager ${user.department.charAt(0).toUpperCase() + user.department.slice(1)}`)}
                  {user?.role === "manager" &&
                    !user?.department &&
                    "Manager"}
                  {user?.role === "karyawan" &&
                    user?.department &&
                    (user.department === "frontend"
                      ? "Frontend Developer"
                      : user.department === "backend"
                        ? "Backend Developer"
                        : user.department === "mobile"
                          ? "Mobile Developer"
                          : user.department === "business_analyst"
                            ? "Business Analyst"
                            : user.department === "pemasaran"
                              ? "Staff Pemasaran"
                              : user.department.charAt(0).toUpperCase() +
                                user.department.slice(1))}
                  {user?.role === "karyawan" && !user?.department && "Karyawan"}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-white bg-opacity-10 hover:bg-white hover:text-[#001f3f] text-white px-4 py-2 rounded-lg transition flex items-center justify-center space-x-2 font-medium"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header - White */}
        <header className="bg-white shadow-sm px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#001f3f]">
              {location.pathname === "/dashboard" && "Dashboard"}
              {location.pathname === "/work-targets" && "Target Tim"}
              {location.pathname === "/team-progress" && "Laporan Tim"}
              {location.pathname === "/my-tasks" && "Target Saya"}
              {location.pathname === "/my-progress" && "Progress Kerja"}
              {location.pathname === "/users" && "User Management"}
              {location.pathname === "/settings" && "Pengaturan Sistem"}
            </h2>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
