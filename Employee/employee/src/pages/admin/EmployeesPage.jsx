import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/formatters";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "employee",
  department: "",
  designation: "",
  salary: "",
  status: "active",
};

export default function EmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "", department: "" });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");

  async function loadEmployees() {
    const { data } = await api.get("/employees", { params: filters });
    setEmployees(data.data || []);
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = { ...form, salary: Number(form.salary || 0) };

    if (editingId) {
      await api.put(`/employees/${editingId}`, payload);
    } else {
      await api.post("/employees", payload);
    }

    setForm(emptyForm);
    setEditingId("");
    loadEmployees();
  }

  async function handleDelete(id) {
    await api.delete(`/employees/${id}`);
    loadEmployees();
  }

  async function applyFilters(event) {
    event.preventDefault();
    loadEmployees();
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Admin Panel"
        title="Employee management"
        description="Create employee accounts, assign roles, and maintain core HR records with filters and quick edits."
      />

      <div className="dashboard-grid">
        <SectionCard title="Search and filter">
          <form className="form-grid compact-grid" onSubmit={applyFilters}>
            <label>
              Search
              <input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Name, email, code" />
            </label>
            <label>
              Status
              <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On leave</option>
              </select>
            </label>
            <label>
              Department
              <input value={filters.department} onChange={(event) => setFilters({ ...filters, department: event.target.value })} placeholder="Design, Sales, HR" />
            </label>
            <div className="button-row align-end">
              <button className="secondary-button" type="submit">
                Apply filters
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title={editingId ? "Update employee" : "Add employee"}>
          <form className="form-grid compact-grid" onSubmit={handleSubmit}>
            <label>
              Full name
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>
            <label>
              Email
              <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" required />
            </label>
            <label>
              Password
              <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" placeholder={editingId ? "Leave blank to keep current" : "Temporary password"} />
            </label>
            <label>
              Phone
              <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </label>
            <label>
              Role
              <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label>
              Status
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On leave</option>
              </select>
            </label>
            <label>
              Department
              <input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} />
            </label>
            <label>
              Designation
              <input value={form.designation} onChange={(event) => setForm({ ...form, designation: event.target.value })} />
            </label>
            <label>
              Salary
              <input value={form.salary} onChange={(event) => setForm({ ...form, salary: event.target.value })} type="number" min="0" />
            </label>
            <div className="button-row align-end">
              <button className="primary-button" type="submit">
                {editingId ? "Update employee" : "Create employee"}
              </button>
            </div>
          </form>
        </SectionCard>
      </div>

      <SectionCard title="Employee directory">
        <DataTable
          columns={[
            { key: "employeeCode", label: "Employee ID" },
            { key: "name", label: "Name" },
            { key: "role", label: "Role" },
            { key: "department", label: "Department" },
            { key: "designation", label: "Designation" },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
            { key: "joinDate", label: "Joined", render: (row) => formatDate(row.joinDate) },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <div className="button-row">
                  <button
                    className="table-button"
                    onClick={() => {
                      setEditingId(row._id);
                      setForm({
                        name: row.name || "",
                        email: row.email || "",
                        password: "",
                        phone: row.phone || "",
                        role: row.role || "employee",
                        department: row.department || "",
                        designation: row.designation || "",
                        salary: row.salary || "",
                        status: row.status || "active",
                      });
                    }}
                  >
                    Edit
                  </button>
                  {user?.role === "admin" ? (
                    <button className="table-button danger" onClick={() => handleDelete(row._id)}>
                      Delete
                    </button>
                  ) : null}
                </div>
              ),
            },
          ]}
          rows={employees}
        />
      </SectionCard>
    </div>
  );
}
