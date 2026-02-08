import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Components
import Layout from "./components/Layout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import WorkTargets from "./pages/WorkTargets";
import TeamProgress from "./pages/TeamProgress";
import MyTasks from "./pages/MyTasks";
import MyProgress from "./pages/MyProgress";
import EmployeeProfile from "./pages/EmployeeProfile";
import EmployeeManagement from "./pages/EmployeeManagement";
import EmployeeDetail from "./pages/EmployeeDetail";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import ActivityLog from "./pages/ActivityLog";
import Departments from "./pages/Departments";

// Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

// Admin Route Component
function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) return <Navigate to="/login" />;
  if (user.role !== "admin") return <Navigate to="/dashboard" />;

  return children;
}

// Public Route Component (redirect to dashboard if logged in)
function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  return !token ? children : <Navigate to="/dashboard" />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/work-targets"
          element={
            <ProtectedRoute>
              <Layout>
                <WorkTargets />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/team-progress"
          element={
            <ProtectedRoute>
              <Layout>
                <TeamProgress />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-tasks"
          element={
            <ProtectedRoute>
              <Layout>
                <MyTasks />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-progress"
          element={
            <ProtectedRoute>
              <Layout>
                <MyProgress />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-profile"
          element={
            <ProtectedRoute>
              <Layout>
                <EmployeeProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-management"
          element={
            <ProtectedRoute>
              <Layout>
                <EmployeeManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-detail/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EmployeeDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity-log"
          element={
            <ProtectedRoute>
              <Layout>
                <ActivityLog />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <AdminRoute>
              <Layout>
                <Users />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/departments"
          element={
            <AdminRoute>
              <Layout>
                <Departments />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <AdminRoute>
              <Layout>
                <Settings />
              </Layout>
            </AdminRoute>
          }
        />

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* 404 - Redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
