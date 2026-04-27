import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatDateTime } from "../lib/formatters";

const adminLinks = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/employees", label: "Employees" },
  { to: "/admin/attendance", label: "Attendance" },
  { to: "/admin/leave", label: "Leave" },
  { to: "/admin/payroll", label: "Payroll" },
  { to: "/admin/reports", label: "Reports" },
  { to: "/admin/id-cards", label: "ID Cards" },
];

const employeeLinks = [
  { to: "/employee", label: "Dashboard" },
  { to: "/employee/attendance", label: "My Attendance" },
  { to: "/employee/leave", label: "My Leave" },
  { to: "/employee/salary", label: "My Salary" },
  { to: "/employee/id-card", label: "My ID Card" },
  { to: "/profile", label: "Profile" },
];

export default function AppShell() {
  const { user, logout, notifications, unreadCount } = useAuth();
  const links = user?.role === "admin" || user?.role === "manager" ? [...adminLinks, ...employeeLinks] : employeeLinks;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-kicker">Employee Management System</span>
          <h2>Lucky HRMS</h2>
          <p>Admin and employee operations from one workspace.</p>
        </div>

        <nav className="nav-stack">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button className="ghost-button logout-button" onClick={logout}>
          Sign out
        </button>
      </aside>

      <main className="workspace">
        <header className="workspace-topbar">
          <div>
            <p className="eyebrow">Signed in as</p>
            <h3>{user?.name}</h3>
            <span className="muted-copy">
              {user?.role} · {user?.department || "General"}
            </span>
          </div>

          <div className="topbar-notifications">
            <div className="notification-pill">
              <strong>{unreadCount}</strong>
              <span>unread notifications</span>
            </div>
            <div className="notification-list">
              {notifications.slice(0, 3).map((item) => (
                <article key={item._id} className={`notification-item ${item.isRead ? "" : "unread"}`}>
                  <h4>{item.title}</h4>
                  <p>{item.message}</p>
                  <span>{formatDateTime(item.createdAt)}</span>
                </article>
              ))}
              {!notifications.length ? <p className="empty-inline">No notifications yet.</p> : null}
            </div>
          </div>
        </header>

        <div className="workspace-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
