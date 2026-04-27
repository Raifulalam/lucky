import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import StatusBadge from "../../components/StatusBadge";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/formatters";

export default function AdminLeavePage() {
  const [leaves, setLeaves] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [policyForm, setPolicyForm] = useState({
    leaveType: "annual",
    annualAllocation: 18,
    maxConsecutiveDays: 10,
    description: "",
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

  async function handleReview(id, status) {
    await api.put(`/leave/${id}/review`, { status, reviewedComment: `${status} by admin panel` });
    loadData();
  }

  async function handlePolicySubmit(event) {
    event.preventDefault();
    await api.post("/leave/policies", {
      ...policyForm,
      annualAllocation: Number(policyForm.annualAllocation),
      maxConsecutiveDays: Number(policyForm.maxConsecutiveDays),
    });
    loadData();
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Leave management"
        title="Leave requests and policies"
        description="Review employee leave applications, keep approval history visible, and configure leave policy allocations."
      />

      <div className="dashboard-grid">
        <SectionCard title="Leave policies">
          <form className="form-grid compact-grid" onSubmit={handlePolicySubmit}>
            <label>
              Leave type
              <select value={policyForm.leaveType} onChange={(event) => setPolicyForm({ ...policyForm, leaveType: event.target.value })}>
                <option value="annual">Annual</option>
                <option value="sick">Sick</option>
                <option value="casual">Casual</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </label>
            <label>
              Annual allocation
              <input type="number" value={policyForm.annualAllocation} onChange={(event) => setPolicyForm({ ...policyForm, annualAllocation: event.target.value })} />
            </label>
            <label>
              Max consecutive days
              <input type="number" value={policyForm.maxConsecutiveDays} onChange={(event) => setPolicyForm({ ...policyForm, maxConsecutiveDays: event.target.value })} />
            </label>
            <label>
              Description
              <input value={policyForm.description} onChange={(event) => setPolicyForm({ ...policyForm, description: event.target.value })} />
            </label>
            <div className="button-row align-end">
              <button className="primary-button" type="submit">
                Save policy
              </button>
            </div>
          </form>

          <div className="tag-list">
            {policies.map((policy) => (
              <span key={policy._id} className="info-tag">
                {policy.leaveType}: {policy.annualAllocation} days
              </span>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Incoming leave requests">
          <DataTable
            columns={[
              { key: "employee", label: "Employee", render: (row) => row.employeeId?.name },
              { key: "leaveType", label: "Type" },
              { key: "startDate", label: "From", render: (row) => formatDate(row.startDate) },
              { key: "endDate", label: "To", render: (row) => formatDate(row.endDate) },
              { key: "totalDays", label: "Days" },
              { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
              {
                key: "actions",
                label: "Actions",
                render: (row) => (
                  <div className="button-row">
                    <button className="table-button" onClick={() => handleReview(row._id, "approved")}>
                      Approve
                    </button>
                    <button className="table-button danger" onClick={() => handleReview(row._id, "rejected")}>
                      Reject
                    </button>
                  </div>
                ),
              },
            ]}
            rows={leaves}
          />
        </SectionCard>
      </div>
    </div>
  );
}
