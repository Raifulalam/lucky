import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import { api, fileUrl } from "../../lib/api";
import { formatCurrency } from "../../lib/formatters";

const defaultAvatar =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="28" fill="%23dbeafe"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Segoe UI" font-size="28" fill="%230f172a">EMP</text></svg>';

export default function EmployeeDashboardPage() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      const { data } = await api.get("/reports/employee-dashboard");
      setDashboard(data.dashboard);
    }

    loadDashboard();
  }, []);

  const attendanceMap = useMemo(
    () =>
      (dashboard?.attendanceSummary || []).reduce((accumulator, item) => {
        accumulator[item._id] = item.count;
        return accumulator;
      }, {}),
    [dashboard]
  );

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Employee Panel"
        title={`Welcome back, ${dashboard?.profile?.name || "team member"}`}
        description="Review your attendance, leave balance, salary overview, and personal details from a single employee dashboard."
      />

      <div className="profile-hero">
        <div className="profile-card">
          <img
            alt={dashboard?.profile?.name}
            className="avatar-image"
            src={fileUrl(dashboard?.profile?.avatar) || defaultAvatar}
          />
          <div>
            <h3>{dashboard?.profile?.designation || "Employee"}</h3>
            <p>{dashboard?.profile?.department || "General department"}</p>
            <span className="muted-copy">{dashboard?.profile?.employeeCode}</span>
          </div>
        </div>
        <StatusBadge value={dashboard?.profile?.status} />
      </div>

      <div className="stats-grid">
        <StatCard title="Present days" value={attendanceMap.present || 0} tone="green" />
        <StatCard title="Leave balance" value={`${dashboard?.leaveBalance?.annual || 0} annual`} tone="blue" />
        <StatCard title="Latest salary" value={formatCurrency(dashboard?.latestPayroll?.netSalary || 0)} tone="amber" />
        <StatCard title="Pending leaves" value={(dashboard?.recentLeaves || []).filter((leave) => leave.status === "pending").length} tone="slate" />
      </div>

      <div className="dashboard-grid">
        <SectionCard title="Leave balances">
          <div className="tag-list">
            <span className="info-tag">Annual: {dashboard?.leaveBalance?.annual || 0}</span>
            <span className="info-tag">Sick: {dashboard?.leaveBalance?.sick || 0}</span>
            <span className="info-tag">Casual: {dashboard?.leaveBalance?.casual || 0}</span>
            <span className="info-tag">Unpaid: {dashboard?.leaveBalance?.unpaid || 0}</span>
          </div>
        </SectionCard>

        <SectionCard title="Latest payroll">
          <p className="metric-label">Payslip</p>
          <h2>{dashboard?.latestPayroll?.payslipNumber || "No payroll yet"}</h2>
          <p className="muted-copy">Status: {dashboard?.latestPayroll?.status || "draft"}</p>
        </SectionCard>
      </div>
    </div>
  );
}
