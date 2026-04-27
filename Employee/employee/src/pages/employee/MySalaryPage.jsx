import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import StatusBadge from "../../components/StatusBadge";
import { api, downloadBinary } from "../../lib/api";
import { formatCurrency } from "../../lib/formatters";

export default function MySalaryPage() {
  const [payrolls, setPayrolls] = useState([]);

  useEffect(() => {
    async function loadPayrolls() {
      const { data } = await api.get("/payroll");
      setPayrolls(data.data || []);
    }

    loadPayrolls();
  }, []);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="My Salary"
        title="Payroll and payslips"
        description="Access your salary history, net pay, deductions, and download official payslips for each payroll cycle."
      />

      <SectionCard title="Salary statements">
        <DataTable
          columns={[
            { key: "payslipNumber", label: "Payslip" },
            { key: "period", label: "Period", render: (row) => `${row.month}/${row.year}` },
            { key: "grossSalary", label: "Gross", render: (row) => formatCurrency(row.grossSalary) },
            { key: "totalDeductions", label: "Deductions", render: (row) => formatCurrency(row.totalDeductions) },
            { key: "netSalary", label: "Net", render: (row) => formatCurrency(row.netSalary) },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
            {
              key: "actions",
              label: "Download",
              render: (row) => (
                <button className="table-button" onClick={() => downloadBinary(`/payroll/${row._id}/payslip`, `${row.payslipNumber}.pdf`)}>
                  Download PDF
                </button>
              ),
            },
          ]}
          rows={payrolls}
        />
      </SectionCard>
    </div>
  );
}
