import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import StatusBadge from "../../components/StatusBadge";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/formatters";

export default function MyLeavePage() {
  const [leaves, setLeaves] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState({
    leaveType: "annual",
    startDate: "",
    endDate: "",
    reason: "",
    handoverNotes: "",
  });

  async function loadData() {
    const [{ data: leaveData }, { data: policyData }] = await Promise.all([
      api.get("/leave"),
      api.get("/leave/policies"),
    ]);

    setLeaves(leaveData.data || []);
    setPolicies(policyData.policies || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    await api.post("/leave", form);
    setForm({ leaveType: "annual", startDate: "", endDate: "", reason: "", handoverNotes: "" });
    loadData();
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="My Leave"
        title="Leave balance and requests"
        description="Apply for annual, sick, casual, or unpaid leave and monitor every approval decision."
      />

      <SectionCard title="Apply for leave">
        <form className="form-grid compact-grid" onSubmit={handleSubmit}>
          <label>
            Leave type
            <select value={form.leaveType} onChange={(event) => setForm({ ...form, leaveType: event.target.value })}>
              {policies.map((policy) => (
                <option key={policy._id} value={policy.leaveType}>
                  {policy.leaveType}
                </option>
              ))}
            </select>
          </label>
          <label>
            Start date
            <input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} required />
          </label>
          <label>
            End date
            <input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} required />
          </label>
          <label>
            Reason
            <input value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} required />
          </label>
          <label>
            Handover notes
            <input value={form.handoverNotes} onChange={(event) => setForm({ ...form, handoverNotes: event.target.value })} />
          </label>
          <div className="button-row align-end">
            <button className="primary-button" type="submit">
              Submit request
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="My leave history">
        <DataTable
          columns={[
            { key: "leaveType", label: "Type" },
            { key: "startDate", label: "From", render: (row) => formatDate(row.startDate) },
            { key: "endDate", label: "To", render: (row) => formatDate(row.endDate) },
            { key: "totalDays", label: "Days" },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
            { key: "reason", label: "Reason" },
          ]}
          rows={leaves}
        />
      </SectionCard>
    </div>
  );
}
