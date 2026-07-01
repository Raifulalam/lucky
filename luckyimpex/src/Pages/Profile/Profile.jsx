import React, { useContext, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Mail, ShieldCheck, ShoppingBag, UserCircle2 } from "lucide-react";
import { UserContext } from "../../Components/UserContext";
import ProfileForm from "./ProfileForm";
import Header from "../../Components/Header";
import "./Profile.css";

const Profile = () => {
    const { user, loading, logout } = useContext(UserContext);
    const [isEditing, setIsEditing] = useState(false);
    const [userDataState, setUserDataState] = useState(user);
    const navigate = useNavigate();

    useEffect(() => {
        setUserDataState(user);
    }, [user]);

    const stats = useMemo(
        () => [
            { label: "Account", value: user?.role || "Guest", icon: <ShieldCheck size={18} /> },
            { label: "Email", value: user?.email || "Not set", icon: <Mail size={18} /> },
            { label: "Orders", value: "View history", icon: <ShoppingBag size={18} /> },
        ],
        [user]
    );

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="profile-spinner" />
                <p>Loading your account...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-empty">
                <Header />
                <div className="profile-empty-card">
                    <UserCircle2 size={40} />
                    <h2>Please sign in</h2>
                    <p>Sign in to view your account, orders, and saved profile details.</p>
                    <button onClick={() => navigate("/login")}>Go to Login</button>
                </div>
            </div>
        );
    }

    const isAdmin = user.role === "admin";
    const displayName = user.name || user.username || "Customer";
    const profileImage = user.avatar || user.image || user.profileImage || "";
    const initials = displayName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <>
            <Helmet>
                <title>Your Profile - Lucky Impex</title>
                <meta name="description" content="Manage your Lucky Impex account, profile, and orders." />
            </Helmet>
            <Header />
            <main className="profile-page">
                <section className="profile-hero">
                    <div className="profile-hero-copy">
                        <span className="profile-kicker">Account Center</span>
                        <h1>Welcome back, {displayName}.</h1>
                        <p>
                            Manage your profile, review account details, and keep your shopping
                            experience polished and personal.
                        </p>
                    </div>
                    <div className="profile-status">
                        <div className="profile-avatar">
                            {profileImage ? <img src={profileImage} alt={displayName} /> : initials}
                        </div>
                        <div>
                            <strong>{isAdmin ? "Admin account" : "Verified customer"}</strong>
                            <span>
                                <CheckCircle2 size={14} /> Active session
                            </span>
                        </div>
                    </div>
                </section>

                <section className="profile-grid">
                    <aside className="profile-sidebar">
                        <div className="profile-card profile-summary">
                            <div className="profile-summary-head">
                                <div className="profile-avatar large">
                                    {profileImage ? <img src={profileImage} alt={displayName} /> : initials}
                                </div>
                                <div>
                                    <h2>{displayName}</h2>
                                    <p>{user.email}</p>
                                </div>
                            </div>

                            <div className="profile-metrics">
                                {stats.map((item) => (
                                    <div key={item.label} className="profile-metric">
                                        <span className="profile-metric-icon">{item.icon}</span>
                                        <div>
                                            <small>{item.label}</small>
                                            <strong>{item.value}</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="profile-actions">
                                <button onClick={() => navigate("/orderpage")} className="primary-btn">
                                    View Orders
                                </button>
                                <button onClick={() => setIsEditing((prev) => !prev)} className="secondary-btn">
                                    {isEditing ? "Close Editor" : "Edit Profile"}
                                </button>
                                {isAdmin && (
                                    <button onClick={() => navigate("/admin")} className="ghost-btn">
                                        Open Dashboard
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        logout();
                                        navigate("/");
                                    }}
                                    className="danger-btn"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </aside>

                    <section className="profile-card profile-main">
                        {!isEditing ? (
                            <>
                                <div className="profile-section-head">
                                    <div>
                                        <span className="profile-kicker">Profile Details</span>
                                        <h2>Your account information</h2>
                                    </div>
                                    <button className="text-button" onClick={() => setIsEditing(true)}>
                                        Edit
                                    </button>
                                </div>

                                <div className="profile-details">
                                    <div className="profile-detail-item">
                                        <span>Full name</span>
                                        <strong>{displayName}</strong>
                                    </div>
                                    <div className="profile-detail-item">
                                        <span>Email address</span>
                                        <strong>{user.email}</strong>
                                    </div>
                                    <div className="profile-detail-item">
                                        <span>User ID</span>
                                        <strong>{user.id}</strong>
                                    </div>
                                    <div className="profile-detail-item">
                                        <span>Role</span>
                                        <strong>{user.role}</strong>
                                    </div>
                                    <div className="profile-detail-item">
                                        <span>Member since</span>
                                        <strong>{user.created || "Recently joined"}</strong>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <ProfileForm
                                userData={userDataState}
                                setUserData={setUserDataState}
                                setIsEditing={setIsEditing}
                            />
                        )}
                    </section>
                </section>
            </main>
        </>
    );
};

export default Profile;
