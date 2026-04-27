import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { api, downloadBinary } from "../../lib/api";

export default function IdCardsPage() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    async function loadEmployees() {
      const { data } = await api.get("/employees");
      setEmployees(data.data || []);
    }

    loadEmployees();
  }, []);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Documents"
        title="Employee ID cards"
        description="Generate downloadable company ID cards with employee photo, QR code, and employee ID for any active team member."
      />

      <SectionCard title="Generate ID cards">
        <DataTable
          columns={[
            { key: "employeeCode", label: "Employee ID" },
            { key: "name", label: "Name" },
            { key: "department", label: "Department" },
            { key: "designation", label: "Designation" },
            {
              key: "actions",
              label: "Download",
              render: (row) => (
                <button className="table-button" onClick={() => downloadBinary(`/documents/id-card/${row._id}`, `${row.employeeCode}-id-card.pdf`)}>
                  Download ID card
                </button>
              ),
            },
          ]}
          rows={employees}
        />
      </SectionCard>
    </div>
  );
}
