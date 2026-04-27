import React from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { FaArrowLeft, FaUserShield } from "react-icons/fa";
import { adminRoutes } from "./adminRoutes";
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

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <span className="admin-kicker">Lucky Impex</span>
                    <h1>Admin Workspace</h1>
                    <p>Unified control center for HR, orders, catalog, and support.</p>
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
