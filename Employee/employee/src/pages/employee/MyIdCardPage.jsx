import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useAuth } from "../../context/AuthContext";
import { downloadBinary } from "../../lib/api";

export default function MyIdCardPage() {
  const { user } = useAuth();

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="My ID Card"
        title="Employee identity card"
        description="Download your latest company ID card with employee code, department details, and verification QR."
      />

      <SectionCard
        title="Document access"
        action={
          <button className="primary-button" onClick={() => downloadBinary("/documents/my-id-card", `${user?.employeeCode || "employee"}-id-card.pdf`)}>
            Download my ID card
          </button>
        }
      >
        <p className="page-description">
          Your personal ID card is generated directly from the HRMS employee profile and can be used for onboarding, internal verification, and office access workflows.
        </p>
      </SectionCard>
    </div>
  );
}
