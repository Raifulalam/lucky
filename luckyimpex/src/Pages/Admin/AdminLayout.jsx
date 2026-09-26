import React, { useState, useEffect } from "react";
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
    FaChevronDown,
    FaChevronRight,
} from "react-icons/fa";
import { adminRoutes } from "./adminRoutes";
import "./AdminLayout.css";

const getRouteTitle = (pathname) => {
    const allRoutes = [];
    adminRoutes.forEach((route) => {
        allRoutes.push(route);
        if (route.children) {
            allRoutes.push(...route.children);
        }
    });

    const match = [...allRoutes]
        .sort((a, b) => b.path.length - a.path.length)
        .find(
            (route) =>
                pathname === route.path ||
                (route.path !== "/admin" && pathname.startsWith(`${route.path}/`))
        );

    return match || adminRoutes[0];
};

export default function AdminLayout() {
    const location = useLocation();

    const currentRoute = getRouteTitle(location.pathname);

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Track state for expandable parent menu sections
    const [expandedSections, setExpandedSections] = useState(() => {
        const initial = {};
        adminRoutes.forEach((route) => {
            if (route.isCollapsible) {
                initial[route.label] = location.pathname.startsWith(route.path);
            }
        });
        return initial;
    });

    // Auto-expand section when navigating to an inventory child route
    useEffect(() => {
        adminRoutes.forEach((route) => {
            if (route.isCollapsible && location.pathname.startsWith(route.path)) {
                setExpandedSections((prev) => ({
                    ...prev,
                    [route.label]: true,
                }));
            }
        });
    }, [location.pathname]);

    const toggleSection = (label) => {
        if (sidebarCollapsed) {
            setSidebarCollapsed(false);
        }
        setExpandedSections((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    return (
        <div
            className={`admin-shell ${
                sidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            {/* =====================================
                SIDEBAR
            ===================================== */}

            <aside className="admin-sidebar">
                {/* BRAND */}

                <div className="admin-brand">
                    <div className="admin-brand-logo">LI</div>

                    <div className="admin-brand-text">
                        <span className="admin-kicker">Lucky Impex</span>

                        <h1>Admin Workspace</h1>
                    </div>
                </div>

                {/* NAVIGATION */}

                <nav className="admin-nav">
                    {adminRoutes.map((route) => {
                        const Icon = route.icon;
                        const isCollapsible = route.isCollapsible && route.children?.length > 0;
                        const isExpanded = expandedSections[route.label];
                        const isParentActive = location.pathname.startsWith(route.path);

                        if (isCollapsible) {
                            return (
                                <div
                                    key={route.label}
                                    className={`admin-nav-group ${
                                        isParentActive ? "parent-active" : ""
                                    } ${isExpanded ? "is-expanded" : ""}`}
                                >
                                    <button
                                        type="button"
                                        className={`admin-nav-link parent-toggle ${
                                            isParentActive ? "active-parent" : ""
                                        }`}
                                        onClick={() => toggleSection(route.label)}
                                        title={sidebarCollapsed ? route.label : undefined}
                                    >
                                        <Icon className="nav-icon" />

                                        <div className="admin-nav-content">
                                            <strong>{route.label}</strong>
                                            <span>{route.children.length} sub-items</span>
                                        </div>

                                        {!sidebarCollapsed && (
                                            <span className="chevron-indicator">
                                                {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                                            </span>
                                        )}
                                    </button>

                                    {isExpanded && !sidebarCollapsed && (
                                        <div className="admin-subnav">
                                            {route.children.map((child) => {
                                                const ChildIcon = child.icon;

                                                return (
                                                    <NavLink
                                                        key={child.path}
                                                        to={child.path}
                                                        end={child.path === route.path}
                                                        className={({ isActive }) =>
                                                            `admin-subnav-link ${
                                                                isActive ? "active" : ""
                                                            }`
                                                        }
                                                    >
                                                        <ChildIcon className="subnav-icon" />
                                                        <div className="admin-subnav-content">
                                                            <strong>{child.label}</strong>
                                                        </div>
                                                    </NavLink>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <NavLink
                                key={route.path}
                                to={route.path}
                                end={route.path === "/admin"}
                                className={({ isActive }) =>
                                    `admin-nav-link ${isActive ? "active" : ""}`
                                }
                                title={sidebarCollapsed ? route.label : undefined}
                            >
                                <Icon />

                                <div className="admin-nav-content">
                                    <strong>{route.label}</strong>
                                    <span>{route.description}</span>
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