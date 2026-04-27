import { useEffect, useMemo, useState } from "react";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import { api } from "../../lib/api";
import { formatDate, formatDateTime, mapAggregation } from "../../lib/formatters";

export default function AdminAttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState([]);
  const [form, setForm] = useState({
    employeeId: "",
    date: "",
    status: "present",
    checkIn: "",
    checkOut: "",
    notes: "",
  });

  async function loadPageData() {
    const [{ data: employeesData }, { data: attendanceData }, { data: summaryData }] = await Promise.all([
      api.get("/employees"),
      api.get("/attendance"),
      api.get("/attendance/summary"),
    ]);

    setEmployees(employeesData.data || []);
    setAttendance(attendanceData.data || []);
    setSummary(summaryData.summary || []);
  }

  useEffect(() => {
    loadPageData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    await api.post("/attendance/manual", form);
    setForm({ employeeId: "", date: "", status: "present", checkIn: "", checkOut: "", notes: "" });
    loadPageData();
  }

  async function handleAutoAbsent() {
    await api.post("/attendance/auto-mark-absent", {});
    loadPageData();
  }

  const summaryMap = useMemo(() => mapAggregation(summary), [summary]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Attendance"
        title="Attendance operations"
        description="Track daily attendance, handle manual adjustments, and auto-mark missing records for absent employees."
        actions={<button className="secondary-button" onClick={handleAutoAbsent}>Auto mark absent</button>}
      />

      <div className="stats-grid">
        <StatCard title="Present" value={summaryMap.present || 0} tone="green" />
        <StatCard title="Absent" value={summaryMap.absent || 0} tone="amber" />
        <StatCard title="Half day" value={summaryMap.half_day || 0} tone="blue" />
        <StatCard title="On leave" value={summaryMap.leave || 0} tone="slate" />
      </div>

      <SectionCard title="Manual attendance entry">
        <form className="form-grid compact-grid" onSubmit={handleSubmit}>
          <label>
            Employee
            <select value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })} required>
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name} ({employee.employeeCode})
                </option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="half_day">Half day</option>
              <option value="leave">Leave</option>
            </select>
          </label>
          <label>
            Check in
            <input type="datetime-local" value={form.checkIn} onChange={(event) => setForm({ ...form, checkIn: event.target.value })} />
          </label>
          <label>
            Check out
            <input type="datetime-local" value={form.checkOut} onChange={(event) => setForm({ ...form, checkOut: event.target.value })} />
          </label>
          <label>
            Notes
            <input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </label>
          <div className="button-row align-end">
            <button className="primary-button" type="submit">
              Save attendance
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Attendance records">
        <DataTable
          columns={[
            { key: "date", label: "Date", render: (row) => formatDate(row.date) },
            { key: "employee", label: "Employee", render: (row) => row.employeeId?.name },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
            { key: "checkIn", label: "Check in", render: (row) => formatDateTime(row.checkIn) },
            { key: "checkOut", label: "Check out", render: (row) => formatDateTime(row.checkOut) },
            { key: "lateMinutes", label: "Late (min)" },
            { key: "workMinutes", label: "Worked (min)" },
          ]}
          rows={attendance}
        />
      </SectionCard>
    </div>
  );
}
