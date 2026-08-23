import React, { useState } from "react";
import {
    Link,
    NavLink,
    Outlet,
    useLocation,
} from "react-router-dom";
import {
    FaArrowLeft,
    FaUserShield,
    FaBars,
    FaChevronLeft,
} from "react-icons/fa";
import { adminRoutes } from "./adminRoutes";
import "./AdminLayout.css";

const getRouteTitle = (pathname) => {
    const match = [...adminRoutes]
        .sort(
            (a, b) =>
                b.path.length - a.path.length
        )
        .find(
            (route) =>
                pathname === route.path ||
                pathname.startsWith(`${route.path}/`)
        );

    return match || adminRoutes[0];
};

export default function AdminLayout() {
    const location = useLocation();

    const currentRoute = getRouteTitle(
        location.pathname
    );

    const [sidebarCollapsed, setSidebarCollapsed] =
        useState(false);

    return (
        <div
            className={`admin-shell ${
                sidebarCollapsed
                    ? "sidebar-collapsed"
                    : ""
            }`}
        >

            {/* =====================================
                SIDEBAR
            ===================================== */}

            <aside className="admin-sidebar">

                {/* BRAND */}

                <div className="admin-brand">

                    <div className="admin-brand-logo">
                        LI
                    </div>

                    <div className="admin-brand-text">
                        <span className="admin-kicker">
                            Lucky Impex
                        </span>

                        <h1>
                            Admin Workspace
                        </h1>
                    </div>

                </div>

                {/* NAVIGATION */}

                <nav className="admin-nav">

                    {adminRoutes.map((route) => {
                        const Icon = route.icon;

                        return (
                            <NavLink
                                key={route.path}
                                to={route.path}
                                end={
                                    route.path ===
                                    "/admin"
                                }
                                className={({ isActive }) =>
                                    `admin-nav-link ${
                                        isActive
                                            ? "active"
                                            : ""
                                    }`
                                }
                                title={
                                    sidebarCollapsed
                                        ? route.label
                                        : undefined
                                }
                            >

                                <Icon />

                                <div className="admin-nav-content">

                                    <strong>
                                        {route.label}
                                    </strong>

                                    <span>
                                        {
                                            route.description
                                        }
                                    </span>

                                </div>

                            </NavLink>
                        );
                    })}

                </nav>

                {/* SIDEBAR TOGGLE */}

                <button
                    type="button"
                    className="admin-sidebar-toggle"
                    onClick={() =>
                        setSidebarCollapsed(
                            (prev) => !prev
                        )
                    }
                    aria-label={
                        sidebarCollapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                    title={
                        sidebarCollapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                >
                    {sidebarCollapsed ? (
                        <FaBars />
                    ) : (
                        <FaChevronLeft />
                    )}
                </button>

            </aside>

            {/* =====================================
                MAIN WORKSPACE
            ===================================== */}

            <main className="admin-workspace">

                {/* TOP BAR */}

                <header className="admin-topbar">

                    <div>

                        <p className="admin-kicker">
                            Admin route
                        </p>

                        <h2>
                            {currentRoute.label}
                        </h2>

                    </div>

                    <div className="admin-topbar-actions">

                        <span className="admin-badge">

                            <FaUserShield />

                            Admin secured

                        </span>

                        <Link
                            className="admin-store-link"
                            to="/"
                        >
                            <FaArrowLeft />

                            Back to store

                        </Link>

                    </div>

                </header>

                {/* CONTENT */}

                <section className="admin-content-panel">

                    <Outlet />

                </section>

            </main>

        </div>
    );
}