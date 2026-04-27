import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import StatusBadge from "../../components/StatusBadge";
import { api, downloadBinary } from "../../lib/api";
import { formatCurrency } from "../../lib/formatters";

const initialForm = {
  employeeId: "",
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  basicSalary: "",
  hra: "",
  allowances: "",
  bonus: "",
  deductions: "",
};

export default function AdminPayrollPage() {
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [form, setForm] = useState(initialForm);

  async function loadData() {
    const [{ data: employeeData }, { data: payrollData }] = await Promise.all([
      api.get("/employees"),
      api.get("/payroll"),
    ]);

    setEmployees(employeeData.data || []);
    setPayrolls(payrollData.data || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    await api.post("/payroll", {
      employeeId: form.employeeId,
      month: Number(form.month),
      year: Number(form.year),
      basicSalary: Number(form.basicSalary || 0),
      hra: Number(form.hra || 0),
      allowances: form.allowances ? [{ label: "Allowance", amount: Number(form.allowances) }] : [],
      bonuses: form.bonus ? [{ label: "Bonus", amount: Number(form.bonus) }] : [],
      deductions: form.deductions ? [{ label: "Deduction", amount: Number(form.deductions) }] : [],
    });
    setForm(initialForm);
    loadData();
  }

  async function markPaid(payrollId) {
    await api.put(`/payroll/${payrollId}/pay`, { paidVia: "Bank Transfer" });
    loadData();
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Payroll"
        title="Salary structures and payslips"
        description="Generate monthly payroll, apply bonuses and deductions, mark payments, and issue employee payslips."
      />

      <SectionCard title="Generate payroll">
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
            Month
            <input type="number" min="1" max="12" value={form.month} onChange={(event) => setForm({ ...form, month: event.target.value })} />
          </label>
          <label>
            Year
            <input type="number" value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} />
          </label>
          <label>
            Basic salary
            <input type="number" min="0" value={form.basicSalary} onChange={(event) => setForm({ ...form, basicSalary: event.target.value })} />
          </label>
          <label>
            HRA
            <input type="number" min="0" value={form.hra} onChange={(event) => setForm({ ...form, hra: event.target.value })} />
          </label>
          <label>
            Allowance
            <input type="number" min="0" value={form.allowances} onChange={(event) => setForm({ ...form, allowances: event.target.value })} />
          </label>
          <label>
            Bonus
            <input type="number" min="0" value={form.bonus} onChange={(event) => setForm({ ...form, bonus: event.target.value })} />
          </label>
          <label>
            Deduction
            <input type="number" min="0" value={form.deductions} onChange={(event) => setForm({ ...form, deductions: event.target.value })} />
          </label>
          <div className="button-row align-end">
            <button className="primary-button" type="submit">
              Generate payroll
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Payroll ledger">
        <DataTable
          columns={[
            { key: "payslipNumber", label: "Payslip" },
            { key: "employee", label: "Employee", render: (row) => row.employeeId?.name },
            { key: "period", label: "Period", render: (row) => `${row.month}/${row.year}` },
            { key: "grossSalary", label: "Gross", render: (row) => formatCurrency(row.grossSalary) },
            { key: "totalDeductions", label: "Deductions", render: (row) => formatCurrency(row.totalDeductions) },
            { key: "netSalary", label: "Net", render: (row) => formatCurrency(row.netSalary) },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <div className="button-row">
                  <button className="table-button" onClick={() => downloadBinary(`/payroll/${row._id}/payslip`, `${row.payslipNumber}.pdf`)}>
                    Download
                  </button>
                  {row.status !== "paid" ? (
                    <button className="table-button" onClick={() => markPaid(row._id)}>
                      Mark paid
                    </button>
                  ) : null}
                </div>
              ),
            },
          ]}
          rows={payrolls}
        />
      </SectionCard>
    </div>
  );
}
