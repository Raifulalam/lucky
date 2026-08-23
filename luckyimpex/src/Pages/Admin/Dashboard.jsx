import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaBoxOpen,
    FaClipboardList,
    FaExclamationTriangle,
    FaStar,
    FaShoppingCart,
    FaUsers,

    FaChevronRight,
   
} from "react-icons/fa";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import "./Dashboard.css";
import { BASE_URL } from "../../api/api";



const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);

const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN").format(Number(value) || 0);

export default function Dashboard() {
    const navigate = useNavigate();

    const token = localStorage.getItem("authToken");

    const [storeStats, setStoreStats] = useState({
        orders: 0,
        users: 0,
        products: 0,
        complaints: 0,
        reviews: 0,
        revenue: 0,
        outOfStockProducts: 0,
    });

    const [loading, setLoading] = useState(true);

    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                const [
                    storeRes,
                    complaintRes,
                    feedbackRes,
                ] = await Promise.all([
                    fetch(`${BASE_URL}/dashboard/stats`, {
                        headers,
                    }),

                    fetch(
                        `${BASE_URL}/complaints/complaints`,
                        {
                            headers,
                        }
                    ),

                    fetch(
                        `${BASE_URL}/contact/contact`,
                        {
                            headers,
                        }
                    ),
                ]);

                const storeData = await storeRes.json();
                const complaintData =
                    await complaintRes.json();

                const feedbackData =
                    await feedbackRes.json();

                setStoreStats({
                    orders:
                        storeData.data?.orders || 0,

                    users:
                        storeData.data?.users || 0,

                    products:
                        storeData.data?.products || 0,

                    complaints:
                        Array.isArray(complaintData)
                            ? complaintData.length
                            : 0,

                    reviews:
                        Array.isArray(feedbackData)
                            ? feedbackData.length
                            : 0,

                    revenue:
                        storeData.data?.revenue || 0,

                    outOfStockProducts:
                        storeData.data
                            ?.outOfStockProducts || 0,
                });

                setLastUpdated(new Date());
            } catch (error) {
                console.error(
                    "Dashboard fetch failed",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    /*
     * Until your backend provides daily revenue/order
     * analytics, don't manufacture fake chart numbers.
     */
    const statusData = useMemo(
        () => [
            {
                name: "Orders",
                value: storeStats.orders,
            },
            {
                name: "Customers",
                value: storeStats.users,
            },
            {
                name: "Products",
                value: storeStats.products,
            },
        ],
        [storeStats]
    );

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="dashboard-loading-spinner" />
                <span>
                    Loading your store dashboard...
                </span>
            </div>
        );
    }

    return (
        <div className="dashboard-main">

            {/* ======================================
                HEADER
            ====================================== */}

            <header className="dashboard-header">

                <div>
                    <span className="dashboard-eyebrow">
                        Lucky Impex
                    </span>

                    <h1>
                        Store overview
                    </h1>

                    <p>
                        Monitor your store performance,
                        orders and inventory.
                    </p>
                </div>

                <div className="dashboard-header-right">

                    <div className="dashboard-date">
                        <span>Today</span>

                        <strong>
                            {new Date().toLocaleDateString(
                                "en-IN",
                                {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                }
                            )}
                        </strong>
                    </div>

                    <button
                        className="dashboard-refresh"
                        onClick={() =>
                            window.location.reload()
                        }
                    >
                        Refresh
                    </button>

                </div>

            </header>


            {/* ======================================
                KPI CARDS
            ====================================== */}

            <section className="dashboard-kpis">

                <KpiCard
                    title="Total revenue"
                    value={formatCurrency(
                        storeStats.revenue
                    )}
                    icon={<FaShoppingCart />}
                    description="All recorded sales"
                    onClick={() =>
                        navigate("/admin/orders")
                    }
                />

                <KpiCard
                    title="Total orders"
                    value={formatNumber(
                        storeStats.orders
                    )}
                    icon={<FaClipboardList />}
                    description="Orders received"
                    onClick={() =>
                        navigate("/admin/orders")
                    }
                />

                <KpiCard
                    title="Customers"
                    value={formatNumber(
                        storeStats.users
                    )}
                    icon={<FaUsers />}
                    description="Registered customers"
                    onClick={() =>
                        navigate("/admin/users")
                    }
                />

                <KpiCard
                    title="Products"
                    value={formatNumber(
                        storeStats.products
                    )}
                    icon={<FaBoxOpen />}
                    description={`${storeStats.outOfStockProducts} need attention`}
                    warning={
                        storeStats.outOfStockProducts > 0
                    }
                    onClick={() =>
                        navigate("/products")
                    }
                />

            </section>


            {/* ======================================
                MAIN GRID
            ====================================== */}

            <section className="dashboard-main-grid">

                {/* REVENUE PANEL */}

                <article className="dashboard-panel revenue-panel">

                    <div className="panel-header">

                        <div>
                            <span>
                                Performance
                            </span>

                            <h2>
                                Revenue overview
                            </h2>
                        </div>

                        <select
                            className="period-select"
                            defaultValue="30"
                        >
                            <option value="7">
                                Last 7 days
                            </option>

                            <option value="30">
                                Last 30 days
                            </option>

                            <option value="90">
                                Last 3 months
                            </option>
                        </select>

                    </div>

                    <div className="revenue-summary">

                        <strong>
                            {formatCurrency(
                                storeStats.revenue
                            )}
                        </strong>

                        <span>
                            Total recorded revenue
                        </span>

                    </div>

                    <div className="chart-container">

                        <ResponsiveContainer
                            width="100%"
                            height={280}
                        >
                            <AreaChart
                                data={[
                                    {
                                        name: "Total",
                                        revenue:
                                            storeStats.revenue,
                                    },
                                ]}
                            >
                                <defs>
                                    <linearGradient
                                        id="revenueGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#2563eb"
                                            stopOpacity={0.25}
                                        />

                                        <stop
                                            offset="100%"
                                            stopColor="#2563eb"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid
                                    strokeDasharray="4 4"
                                    stroke="#e5e7eb"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="name"
                                    hide
                                />

                                <YAxis
                                    hide
                                />

                                <Tooltip
                                    formatter={(value) =>
                                        formatCurrency(
                                            value
                                        )
                                    }
                                />

                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    fill="url(#revenueGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>

                    </div>

                    <div className="chart-empty-note">
                        Revenue history will appear here once
                        your dashboard API provides
                        date-wise sales data.
                    </div>

                </article>


                {/* STORE HEALTH */}

                <article className="dashboard-panel">

                    <div className="panel-header">

                        <div>
                            <span>
                                Store health
                            </span>

                            <h2>
                                Needs attention
                            </h2>
                        </div>

                    </div>

                    <div className="health-list">

                        <HealthItem
                            icon={<FaExclamationTriangle />}
                            title="Low stock"
                            value={
                                storeStats
                                    .outOfStockProducts
                            }
                            description="Products need restocking"
                            type={
                                storeStats
                                    .outOfStockProducts > 0
                                    ? "warning"
                                    : "success"
                            }
                            onClick={() =>
                                navigate("/products")
                            }
                        />

                        <HealthItem
                            icon={<FaClipboardList />}
                            title="Orders"
                            value={
                                storeStats.orders
                            }
                            description="Total orders"
                            type="blue"
                            onClick={() =>
                                navigate(
                                    "/admin/orders"
                                )
                            }
                        />

                        <HealthItem
                            icon={<FaExclamationTriangle />}
                            title="Complaints"
                            value={
                                storeStats.complaints
                            }
                            description="Customer complaints"
                            type={
                                storeStats.complaints > 0
                                    ? "warning"
                                    : "success"
                            }
                            onClick={() =>
                                navigate(
                                    "/admin/complaints"
                                )
                            }
                        />

                        <HealthItem
                            icon={<FaStar />}
                            title="Feedback"
                            value={
                                storeStats.reviews
                            }
                            description="Customer feedback"
                            type="purple"
                            onClick={() =>
                                navigate(
                                    "/admin/feedback"
                                )
                            }
                        />

                    </div>

                </article>

            </section>


            {/* ======================================
                SECOND ROW
            ====================================== */}

            <section className="dashboard-secondary-grid">

                {/* STORE SNAPSHOT */}

                <article className="dashboard-panel">

                    <div className="panel-header">

                        <div>
                            <span>
                                Store data
                            </span>

                            <h2>
                                Business snapshot
                            </h2>
                        </div>

                    </div>

                    <div className="snapshot-list">

                        <SnapshotRow
                            label="Orders"
                            value={storeStats.orders}
                            icon={<FaClipboardList />}
                        />

                        <SnapshotRow
                            label="Customers"
                            value={storeStats.users}
                            icon={<FaUsers />}
                        />

                        <SnapshotRow
                            label="Products"
                            value={storeStats.products}
                            icon={<FaBoxOpen />}
                        />

                        <SnapshotRow
                            label="Complaints"
                            value={storeStats.complaints}
                            icon={
                                <FaExclamationTriangle />
                            }
                        />

                        <SnapshotRow
                            label="Feedback"
                            value={storeStats.reviews}
                            icon={<FaStar />}
                        />

                    </div>

                </article>


                {/* DISTRIBUTION */}

                <article className="dashboard-panel">

                    <div className="panel-header">

                        <div>
                            <span>
                                Overview
                            </span>

                            <h2>
                                Store distribution
                            </h2>
                        </div>

                    </div>

                    <div className="distribution-chart">

                        <ResponsiveContainer
                            width="100%"
                            height={240}
                        >
                            <PieChart>

                                <Pie
                                    data={statusData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={65}
                                    outerRadius={95}
                                    paddingAngle={3}
                                >
                                    <Cell fill="#2563eb" />
                                    <Cell fill="#16a34a" />
                                    <Cell fill="#f59e0b" />
                                </Pie>

                                <Tooltip />

                            </PieChart>
                        </ResponsiveContainer>

                        <div className="distribution-center">

                            <strong>
                                {formatNumber(
                                    storeStats.orders +
                                    storeStats.users +
                                    storeStats.products
                                )}
                            </strong>

                            <span>
                                Records
                            </span>

                        </div>

                    </div>

                    <div className="distribution-legend">

                        {statusData.map(
                            (item, index) => (
                                <div
                                    key={item.name}
                                >
                                    <span
                                        className="legend-dot"
                                        style={{
                                            background:
                                                [
                                                    "#2563eb",
                                                    "#16a34a",
                                                    "#f59e0b",
                                                ][
                                                    index
                                                ],
                                        }}
                                    />

                                    <span>
                                        {item.name}
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            item.value
                                        )}
                                    </strong>
                                </div>
                            )
                        )}

                    </div>

                </article>

            </section>


            {/* ======================================
                QUICK ACTIONS
            ====================================== */}

            <section className="dashboard-panel quick-access-panel">

                <div className="panel-header">

                    <div>
                        <span>
                            Shortcuts
                        </span>

                        <h2>
                            Quick actions
                        </h2>
                    </div>

                </div>

                <div className="quick-actions">

                    <QuickAction
                        title="Orders"
                        description="View and manage orders"
                        icon={<FaClipboardList />}
                        onClick={() =>
                            navigate(
                                "/admin/orders"
                            )
                        }
                    />

                    <QuickAction
                        title="Customers"
                        description="Manage customer accounts"
                        icon={<FaUsers />}
                        onClick={() =>
                            navigate(
                                "/admin/users"
                            )
                        }
                    />

                    <QuickAction
                        title="Products"
                        description="Manage your catalog"
                        icon={<FaBoxOpen />}
                        onClick={() =>
                            navigate("/products")
                        }
                    />

                    <QuickAction
                        title="Complaints"
                        description="Review customer issues"
                        icon={
                            <FaExclamationTriangle />
                        }
                        onClick={() =>
                            navigate(
                                "/admin/complaints"
                            )
                        }
                    />

                    <QuickAction
                        title="Feedback"
                        description="Read customer feedback"
                        icon={<FaStar />}
                        onClick={() =>
                            navigate(
                                "/admin/feedback"
                            )
                        }
                    />

                </div>

            </section>


            {/* FOOTER */}

            <div className="dashboard-footer">

                <span>
                    Last updated{" "}
                    {lastUpdated
                        ? lastUpdated.toLocaleTimeString(
                              "en-IN",
                              {
                                  hour: "2-digit",
                                  minute: "2-digit",
                              }
                          )
                        : "—"}
                </span>

                <span>
                    Lucky Impex Admin
                </span>

            </div>

        </div>
    );
}


/* =========================================
   KPI CARD
========================================= */

function KpiCard({
    title,
    value,
    icon,
    description,
    warning,
    onClick,
}) {
    return (
        <button
            className="dashboard-kpi"
            onClick={onClick}
        >

            <div className="kpi-top">

                <span className="kpi-icon">
                    {icon}
                </span>

                <FaChevronRight className="kpi-arrow" />

            </div>

            <div className="kpi-value">
                {value}
            </div>

            <div className="kpi-title">
                {title}
            </div>

            <div
                className={`kpi-description ${
                    warning
                        ? "warning"
                        : ""
                }`}
            >
                {description}
            </div>

        </button>
    );
}


/* =========================================
   HEALTH ITEM
========================================= */

function HealthItem({
    icon,
    title,
    value,
    description,
    type,
    onClick,
}) {
    return (
        <button
            className="health-item"
            onClick={onClick}
        >

            <span
                className={`health-icon ${type}`}
            >
                {icon}
            </span>

            <span className="health-content">

                <strong>
                    {title}
                </strong>

                <small>
                    {description}
                </small>

            </span>

            <strong className="health-value">
                {formatNumber(value)}
            </strong>

            <FaChevronRight />

        </button>
    );
}


/* =========================================
   SNAPSHOT ROW
========================================= */

function SnapshotRow({
    label,
    value,
    icon,
}) {
    return (
        <div className="snapshot-row">

            <span className="snapshot-icon">
                {icon}
            </span>

            <span>
                {label}
            </span>

            <strong>
                {formatNumber(value)}
            </strong>

        </div>
    );
}


/* =========================================
   QUICK ACTION
========================================= */

function QuickAction({
    title,
    description,
    icon,
    onClick,
}) {
    return (
        <button
            className="quick-action"
            onClick={onClick}
        >

            <span className="quick-action-icon">
                {icon}
            </span>

            <span className="quick-action-content">

                <strong>
                    {title}
                </strong>

                <small>
                    {description}
                </small>

            </span>

            <FaChevronRight />

        </button>
    );
}