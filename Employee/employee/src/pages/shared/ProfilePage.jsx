import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useAuth } from "../../context/AuthContext";
import { api, fileUrl } from "../../lib/api";

const defaultAvatar =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="28" fill="%23dbeafe"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Segoe UI" font-size="28" fill="%230f172a">EMP</text></svg>';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    alternatePhone: user?.alternatePhone || "",
    dateOfBirth: user?.dateOfBirth?.slice(0, 10) || "",
    gender: user?.gender || "",
    address: user?.address || {
      line1: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
    emergencyContact: user?.emergencyContact || {
      name: "",
      relationship: "",
      phone: "",
    },
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  async function saveProfile(event) {
    event.preventDefault();
    await api.put("/auth/me", profile);
    await refreshProfile();
  }

  async function changePassword(event) {
    event.preventDefault();
    await api.put("/auth/change-password", passwordForm);
    setPasswordForm({ currentPassword: "", newPassword: "" });
  }

  async function uploadAvatar(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);
    await api.post("/auth/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await refreshProfile();
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Profile"
        title="Personal details and security"
        description="Update your personal information, upload a profile photo, and keep your account credentials secure."
      />

      <div className="dashboard-grid">
        <SectionCard title="Profile photo">
          <div className="profile-card">
            <img alt={user?.name} className="avatar-image" src={fileUrl(user?.avatar) || defaultAvatar} />
            <div>
              <p className="metric-label">{user?.employeeCode}</p>
              <h3>{user?.name}</h3>
              <p>{user?.designation || "Employee"}</p>
              <input type="file" accept="image/*" onChange={uploadAvatar} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Change password">
          <form className="form-grid compact-grid" onSubmit={changePassword}>
            <label>
              Current password
              <input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} />
            </label>
            <label>
              New password
              <input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} />
            </label>
            <div className="button-row align-end">
              <button className="secondary-button" type="submit">
                Update password
              </button>
            </div>
          </form>
        </SectionCard>
      </div>

      <SectionCard title="Personal information">
        <form className="form-grid" onSubmit={saveProfile}>
          <label>
            Full name
            <input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
          </label>
          <label>
            Phone
            <input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
          </label>
          <label>
            Alternate phone
            <input value={profile.alternatePhone} onChange={(event) => setProfile({ ...profile, alternatePhone: event.target.value })} />
          </label>
          <label>
            Date of birth
            <input type="date" value={profile.dateOfBirth} onChange={(event) => setProfile({ ...profile, dateOfBirth: event.target.value })} />
          </label>
          <label>
            Gender
            <select value={profile.gender} onChange={(event) => setProfile({ ...profile, gender: event.target.value })}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non_binary">Non-binary</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </label>
          <label>
            Address line
            <input
              value={profile.address.line1 || ""}
              onChange={(event) =>
                setProfile({
                  ...profile,
                  address: { ...profile.address, line1: event.target.value },
                })
              }
            />
          </label>
          <label>
            City
            <input
              value={profile.address.city || ""}
              onChange={(event) =>
                setProfile({
                  ...profile,
                  address: { ...profile.address, city: event.target.value },
                })
              }
            />
          </label>
          <label>
            State
            <input
              value={profile.address.state || ""}
              onChange={(event) =>
                setProfile({
                  ...profile,
                  address: { ...profile.address, state: event.target.value },
                })
              }
            />
          </label>
          <label>
            Country
            <input
              value={profile.address.country || ""}
              onChange={(event) =>
                setProfile({
                  ...profile,
                  address: { ...profile.address, country: event.target.value },
                })
              }
            />
          </label>
          <label>
            Postal code
            <input
              value={profile.address.postalCode || ""}
              onChange={(event) =>
                setProfile({
                  ...profile,
                  address: { ...profile.address, postalCode: event.target.value },
                })
              }
            />
          </label>
          <label>
            Emergency contact name
            <input
              value={profile.emergencyContact.name || ""}
              onChange={(event) =>
                setProfile({
                  ...profile,
                  emergencyContact: { ...profile.emergencyContact, name: event.target.value },
                })
              }
            />
          </label>
          <label>
            Emergency relationship
            <input
              value={profile.emergencyContact.relationship || ""}
              onChange={(event) =>
                setProfile({
                  ...profile,
                  emergencyContact: { ...profile.emergencyContact, relationship: event.target.value },
                })
              }
            />
          </label>
          <label>
            Emergency phone
            <input
              value={profile.emergencyContact.phone || ""}
              onChange={(event) =>
                setProfile({
                  ...profile,
                  emergencyContact: { ...profile.emergencyContact, phone: event.target.value },
                })
              }
            />
          </label>
          <div className="button-row align-end">
            <button className="primary-button" type="submit">
              Save profile
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
