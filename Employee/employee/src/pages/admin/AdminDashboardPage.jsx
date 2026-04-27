import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import StatCard from "../../components/StatCard";
import { api } from "../../lib/api";
import { formatCurrency, mapAggregation } from "../../lib/formatters";

const pieColors = ["#3b82f6", "#22c55e", "#f97316", "#ef4444", "#8b5cf6"];

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      const { data } = await api.get("/reports/dashboard");
      setDashboard(data.dashboard);
    }

    loadDashboard();
  }, []);

  const attendanceToday = useMemo(() => {
    const values = mapAggregation(dashboard?.attendanceToday || []);
    return [
      { name: "Present", value: values.present || 0 },
      { name: "Absent", value: values.absent || 0 },
      { name: "Half Day", value: values.half_day || 0 },
      { name: "Leave", value: values.leave || 0 },
    ];
  }, [dashboard]);

  const revenueData = useMemo(
    () =>
      (dashboard?.analytics?.monthlyRevenue || []).map((item) => ({
        month: `M${item._id.month}`,
        revenue: item.revenue,
      })),
    [dashboard]
  );

  const yearlyData = useMemo(() => {
    const revenueByYear = new Map((dashboard?.analytics?.yearlyRevenue || []).map((item) => [item._id.year, item.revenue]));
    return (dashboard?.analytics?.yearlySalary || []).map((item) => ({
      year: item._id.year,
      salaryExpense: item.salaryExpense,
      revenue: revenueByYear.get(item._id.year) || 0,
    }));
  }, [dashboard]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Admin Panel"
        title="Company HR dashboard"
        description="Track workforce health, payroll spend, revenue trends, and attendance performance in one place."
      />

      <div className="stats-grid">
        <StatCard title="Total employees" value={dashboard?.employees?.total || 0} note="Across all departments" tone="blue" />
        <StatCard title="Active employees" value={dashboard?.employees?.active || 0} note="Currently enabled accounts" tone="green" />
        <StatCard title="Inactive employees" value={dashboard?.employees?.inactive || 0} note="Deactivated or archived" tone="amber" />
        <StatCard
          title="Monthly salary spend"
          value={formatCurrency(dashboard?.salaryOverview?.totalNet || 0)}
          note={`Gross: ${formatCurrency(dashboard?.salaryOverview?.totalGross || 0)}`}
          tone="slate"
        />
      </div>

      <div className="dashboard-grid">
        <SectionCard title="Monthly revenue">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7e0ea" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Today’s attendance">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={attendanceToday} dataKey="value" innerRadius={70} outerRadius={100}>
                {attendanceToday.map((entry, index) => (
                  <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Yearly revenue vs salary expense">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={yearlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d7e0ea" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            <Bar dataKey="salaryExpense" fill="#f97316" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
}
