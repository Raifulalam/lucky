import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { authRequest } from "../../api/api";
import { UserContext } from "../../Components/UserContext";
import { clearPersistedQueryCache } from "../../utils/catalogCache";

const ProfileForm = ({ userData, setUserData, setIsEditing }) => {
    const [formData, setFormData] = useState({
        name: userData?.name || userData?.username || "",
        email: userData?.email || "",
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(userData?.avatar || userData?.image || userData?.profileImage || "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { refreshUser } = useContext(UserContext);

    useEffect(() => {
        setFormData({
            name: userData?.name || userData?.username || "",
            email: userData?.email || "",
        });
        setImagePreview(userData?.avatar || userData?.image || userData?.profileImage || "");
        setSelectedImage(null);
    }, [userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0] || null;
        setSelectedImage(file);
        setImagePreview(file ? URL.createObjectURL(file) : (userData?.avatar || userData?.image || userData?.profileImage || ""));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const formDataPayload = new FormData();
            formDataPayload.append("name", formData.name);
            if (selectedImage) {
                formDataPayload.append("avatar", selectedImage);
            }

            const data = await authRequest("/users/me", {
                method: "PUT",
                body: formDataPayload,
                isFormData: true,
            });

            setUserData(data);
            await refreshUser(localStorage.getItem("authToken"));
            clearPersistedQueryCache();
            setIsEditing(false);
            navigate("/profile");
        } catch (err) {
            setError(err.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form className="profile-form" onSubmit={handleSubmit}>
            <div className="profile-section-head compact">
                <div>
                    <span className="profile-kicker">Edit Profile</span>
                    <h2>Update your account details</h2>
                </div>
            </div>

            <div className="profile-form-grid">
                <label className="profile-field profile-upload-field">
                    <span>Profile picture</span>
                    <div className="profile-upload-wrap">
                        <div className="profile-upload-preview">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Profile preview" />
                            ) : (
                                <span>Preview</span>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>
                </label>

                <label className="profile-field">
                    <span>Full name</span>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                    />
                </label>

                <label className="profile-field">
                    <span>Email address</span>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        readOnly
                    />
                </label>
            </div>

            {error && <div className="profile-error">{error}</div>}

            <div className="profile-form-actions">
                <button type="button" className="secondary-btn" onClick={() => setIsEditing(false)}>
                    Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
};

export default ProfileForm;
