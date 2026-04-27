import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppShell from "./layouts/AppShell";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import EmployeesPage from "./pages/admin/EmployeesPage";
import AdminAttendancePage from "./pages/admin/AdminAttendancePage";
import AdminLeavePage from "./pages/admin/AdminLeavePage";
import AdminPayrollPage from "./pages/admin/AdminPayrollPage";
import ReportsPage from "./pages/admin/ReportsPage";
import IdCardsPage from "./pages/admin/IdCardsPage";
import EmployeeDashboardPage from "./pages/employee/EmployeeDashboardPage";
import MyAttendancePage from "./pages/employee/MyAttendancePage";
import MyLeavePage from "./pages/employee/MyLeavePage";
import MySalaryPage from "./pages/employee/MySalaryPage";
import MyIdCardPage from "./pages/employee/MyIdCardPage";
import ProfilePage from "./pages/shared/ProfilePage";

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
