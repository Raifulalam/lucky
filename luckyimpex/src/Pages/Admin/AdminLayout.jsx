import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { FaArrowLeft, FaUserShield, FaBell, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { adminRoutes } from "./adminRoutes";
import {
    isPushNotificationSupported,
    getNotificationPermissionStatus,
    subscribeUserToPush,
} from "../../utils/pushNotification";
import { authRequest } from "../../api/api";
import "./AdminLayout.css";

const getRouteTitle = (pathname) => {
    const match = [...adminRoutes]
        .sort((a, b) => b.path.length - a.path.length)
        .find((route) => pathname === route.path || pathname.startsWith(`${route.path}/`));

    return match || adminRoutes[0];
};

export default function AdminLayout() {
    const location = useLocation();
    const currentRoute = getRouteTitle(location.pathname);
    const [pushStatus, setPushStatus] = useState("default");
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [testStatus, setTestStatus] = useState("");

    useEffect(() => {
        if (isPushNotificationSupported()) {
            const status = getNotificationPermissionStatus();
            setPushStatus(status);
            if (status === "granted") {
                // Auto renew/sync push subscription with backend on load
                subscribeUserToPush().catch(() => { });
            }
        } else {
            setPushStatus("unsupported");
        }
    }, []);

    const handleEnablePush = async () => {
        setIsSubscribing(true);
        setTestStatus("");
        try {
            await subscribeUserToPush();
            setPushStatus(getNotificationPermissionStatus());
            setTestStatus("✅ Push alerts enabled!");
        } catch (err) {
            console.error("Error subscribing admin to push:", err);
            setTestStatus("⚠️ " + (err.message || "Failed to enable"));
        } finally {
            setIsSubscribing(false);
        }
    };

    const handleTestPush = async () => {
        setTestStatus("Sending test...");
        try {
            const res = await authRequest("/push/test", { method: "POST" });
            setTestStatus(res?.message || "Test push sent!");
        } catch (err) {
            setTestStatus("⚠️ " + (err.message || "Test failed"));
        }
    };

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <span className="admin-kicker">Lucky Impex</span>
                    <h1>Admin Workspace</h1>
                    <p>Unified control center for orders, catalog, users, and support.</p>
                </div>

                <nav className="admin-nav">
                    {adminRoutes.map((route) => {
                        const Icon = route.icon;
                        return (
                            <NavLink
                                key={route.path}
                                to={route.path}
                                end={route.path === "/admin"}
                                className={({ isActive }) =>
                                    `admin-nav-link ${isActive ? "active" : ""}`
                                }
                            >
                                <Icon />
                                <div>
                                    <strong>{route.label}</strong>
                                    <span>{route.description}</span>
                                </div>
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>

            <main className="admin-workspace">
                <header className="admin-topbar">
                    <div>
                        <p className="admin-kicker">Admin route</p>
                        <h2>{currentRoute.label}</h2>
                    </div>
                    <div className="admin-topbar-actions">
                        {pushStatus === "granted" ? (
                            <div className="admin-push-group">
                                <span className="admin-badge admin-push-badge success" title="Background notifications active for new orders when app is closed">
                                    <FaCheck />
                                    Push Alerts Active
                                </span>
                                <button type="button" className="admin-push-btn test" onClick={handleTestPush}>
                                    Test Push
                                </button>
                            </div>
                        ) : pushStatus === "default" ? (
                            <button
                                type="button"
                                className="admin-push-btn enable"
                                onClick={handleEnablePush}
                                disabled={isSubscribing}
                            >
                                <FaBell />
                                {isSubscribing ? "Enabling..." : "Enable Push Alerts"}
                            </button>
                        ) : (
                            <span className="admin-badge admin-push-badge warning" title="Push notifications are blocked in browser settings">
                                <FaExclamationTriangle />
                                Push Alerts Blocked
                            </span>
                        )}

                        {testStatus && <span className="admin-push-status-text">{testStatus}</span>}

                        <span className="admin-badge">
                            <FaUserShield />
                            Admin secured
                        </span>
                        <Link className="admin-store-link" to="/">
                            <FaArrowLeft />
                            Back to store
                        </Link>
                    </div>
                </header>

                <section className="admin-content-panel">
                    <Outlet />
                </section>
            </main>
        </div>
    );
}
