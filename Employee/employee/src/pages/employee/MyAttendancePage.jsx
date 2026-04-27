import { useEffect, useMemo, useState } from "react";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import { api } from "../../lib/api";
import { formatDate, formatDateTime, mapAggregation } from "../../lib/formatters";

export default function MyAttendancePage() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);

  async function loadData() {
    const [{ data: recordsData }, { data: summaryData }] = await Promise.all([
      api.get("/attendance"),
      api.get("/attendance/summary"),
    ]);

    setRecords(recordsData.data || []);
    setSummary(summaryData.summary || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function markCheckIn() {
    await api.post("/attendance/check-in");
    loadData();
  }

  async function markCheckOut() {
    await api.post("/attendance/check-out");
    loadData();
  }

  const summaryMap = useMemo(() => mapAggregation(summary), [summary]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="My Attendance"
        title="Attendance history"
        description="Check in, check out, and review your daily attendance status with worked and late minutes."
        actions={
          <div className="button-row">
            <button className="secondary-button" onClick={markCheckIn}>
              Check in
            </button>
            <button className="primary-button" onClick={markCheckOut}>
              Check out
            </button>
          </div>
        }
      />

      <div className="stats-grid">
        <StatCard title="Present" value={summaryMap.present || 0} tone="green" />
        <StatCard title="Late records" value={summaryMap.half_day || 0} tone="amber" />
        <StatCard title="Leave days" value={summaryMap.leave || 0} tone="blue" />
        <StatCard title="Absent" value={summaryMap.absent || 0} tone="slate" />
      </div>

      <SectionCard title="My attendance records">
        <DataTable
          columns={[
            { key: "date", label: "Date", render: (row) => formatDate(row.date) },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
            { key: "checkIn", label: "Check in", render: (row) => formatDateTime(row.checkIn) },
            { key: "checkOut", label: "Check out", render: (row) => formatDateTime(row.checkOut) },
            { key: "lateMinutes", label: "Late (min)" },
            { key: "workMinutes", label: "Worked (min)" },
          ]}
          rows={records}
        />
      </SectionCard>
    </div>
  );
}
