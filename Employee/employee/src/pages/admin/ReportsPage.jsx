import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { api, downloadBinary } from "../../lib/api";

export default function ReportsPage() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function loadAnalytics() {
      const { data } = await api.get("/reports/analytics");
      setAnalytics(data.analytics);
    }

    loadAnalytics();
  }, []);

  const revenueByMonth = useMemo(
    () =>
      (analytics?.revenueByMonth || []).map((item) => ({
        month: `M${item._id.month}`,
        revenue: item.revenue,
      })),
    [analytics]
  );

  const salaryByMonth = useMemo(
    () =>
      (analytics?.salaryByMonth || []).map((item) => ({
        month: `M${item._id}`,
        salaryExpense: item.salaryExpense,
      })),
    [analytics]
  );

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Reports"
        title="Analytics and exports"
        description="Use the reporting workspace for monthly and yearly revenue, salary spending, attendance insights, and CSV exports."
        actions={
          <div className="button-row">
            <button className="secondary-button" onClick={() => downloadBinary("/reports/export/employees", "employees-report.csv")}>
              Export employees
            </button>
            <button className="secondary-button" onClick={() => downloadBinary("/reports/export/attendance", "attendance-report.csv")}>
              Export attendance
            </button>
            <button className="secondary-button" onClick={() => downloadBinary("/reports/export/payroll", "payroll-report.csv")}>
              Export payroll
            </button>
          </div>
        }
      />

      <div className="dashboard-grid">
        <SectionCard title="Revenue trend">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7e0ea" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Salary expense trend">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salaryByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7e0ea" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="salaryExpense" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
    </div>
  );
}
