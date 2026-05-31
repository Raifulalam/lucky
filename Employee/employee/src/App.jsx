import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import React, { lazy, Suspense } from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppShell from "./layouts/AppShell";
import ProtectedRoute from "./routes/ProtectedRoute";

/* PAGES (Lazy Loaded) */
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const EmployeesPage = lazy(() => import("./pages/admin/EmployeesPage"));
const AdminAttendancePage = lazy(() => import("./pages/admin/AdminAttendancePage"));
const AdminLeavePage = lazy(() => import("./pages/admin/AdminLeavePage"));
const AdminPayrollPage = lazy(() => import("./pages/admin/AdminPayrollPage"));
const ReportsPage = lazy(() => import("./pages/admin/ReportsPage"));
const IdCardsPage = lazy(() => import("./pages/admin/IdCardsPage"));
const EmployeeDashboardPage = lazy(() => import("./pages/employee/EmployeeDashboardPage"));
const MyAttendancePage = lazy(() => import("./pages/employee/MyAttendancePage"));
const MyLeavePage = lazy(() => import("./pages/employee/MyLeavePage"));
const MySalaryPage = lazy(() => import("./pages/employee/MySalaryPage"));
const MyIdCardPage = lazy(() => import("./pages/employee/MyIdCardPage"));
const ProfilePage = lazy(() => import("./pages/shared/ProfilePage"));

function HomeRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin" || user.role === "manager") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/employee" replace />;
}

function AppRoutes() {
  return (
    <Suspense fallback={
      <div className="center-panel">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'sans-serif',
          color: '#1d4ed8',
          fontSize: '1.1rem',
          fontWeight: '500'
        }}>
          <div style={{
            border: '3px solid #e2e8f0',
            borderTop: '3px solid #1d4ed8',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            animation: 'spin 1s linear infinite',
            marginBottom: '12px'
          }}></div>
          Loading Employee Portal...
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    }>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomeRedirect />} />

          <Route
            path="admin"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/employees"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <EmployeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/attendance"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <AdminAttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/leave"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <AdminLeavePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/payroll"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <AdminPayrollPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/reports"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/id-cards"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <IdCardsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="employee"
            element={
              <ProtectedRoute roles={["employee", "manager", "admin"]}>
                <EmployeeDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="employee/attendance"
            element={
              <ProtectedRoute roles={["employee", "manager", "admin"]}>
                <MyAttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="employee/leave"
            element={
              <ProtectedRoute roles={["employee", "manager", "admin"]}>
                <MyLeavePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="employee/salary"
            element={
              <ProtectedRoute roles={["employee", "manager", "admin"]}>
                <MySalaryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="employee/id-card"
            element={
              <ProtectedRoute roles={["employee", "manager", "admin"]}>
                <MyIdCardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
