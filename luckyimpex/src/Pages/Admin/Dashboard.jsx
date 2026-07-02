import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaBoxOpen,
    FaClipboardList,
    FaExclamationTriangle,
    FaStar,
    FaShoppingCart,
    FaUsers,
} from "react-icons/fa";
import {
    Bar,
    BarChart,
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

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#7c3aed"];

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

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

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const [storeRes, complaintRes, feedbackRes] = await Promise.all([
                    fetch(`${BASE_URL}/dashboard/stats`, { headers }),
                    fetch(`${BASE_URL}/complaints/complaints`, { headers }),
                    fetch(`${BASE_URL}/contact/contact`, { headers }),
                ]);

                const storeData = await storeRes.json();
                const complaintData = await complaintRes.json();
                const feedbackData = await feedbackRes.json();

                setStoreStats({
                    orders: storeData.data?.orders || 0,
                    users: storeData.data?.users || 0,
                    products: storeData.data?.products || 0,
                    complaints: Array.isArray(complaintData) ? complaintData.length : 0,
                    reviews: Array.isArray(feedbackData) ? feedbackData.length : 0,
                    revenue: storeData.data?.revenue || 0,
                    outOfStockProducts: storeData.data?.outOfStockProducts || 0,
                });
            } catch (error) {
                console.error("Dashboard fetch failed", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    const summaryCards = [
        { title: "Orders", value: storeStats.orders, icon: <FaClipboardList /> },
        { title: "Customers", value: storeStats.users, icon: <FaUsers /> },
        { title: "Products", value: storeStats.products, icon: <FaBoxOpen /> },
        { title: "Complaints", value: storeStats.complaints, icon: <FaExclamationTriangle /> },
        { title: "Feedback", value: storeStats.reviews, icon: <FaStar /> },
        { title: "Revenue", value: formatCurrency(storeStats.revenue), icon: <FaShoppingCart /> },
    ];

    const chartData = useMemo(
        () => [
            { name: "Orders", value: storeStats.orders },
            { name: "Customers", value: storeStats.users },
            { name: "Products", value: storeStats.products },
            { name: "Complaints", value: storeStats.complaints },
            { name: "Feedback", value: storeStats.reviews },
        ],
        [storeStats]
    );

    if (loading) {
        return <div className="loading">Loading store dashboard...</div>;
    }

    return (
        <div className="dashboard-main">
            <section className="dashboard-hero">
                <div>
                    <p className="hero-kicker">Admin overview</p>
                    <h1 className="main-title">Store control center</h1>
                    <p className="hero-copy">
                        Keep the ecommerce flow in view with orders, catalog, customer accounts, complaints, and feedback.
                    </p>
                </div>
                <div className="hero-pulse">
                    <span>Current revenue</span>
                    <strong>{formatCurrency(storeStats.revenue)}</strong>
                    <p>{storeStats.outOfStockProducts} products need restocking</p>
                </div>
            </section>

            <div className="stats-grid">
                {summaryCards.map((card) => (
                    <article className="stat-card tone-blue" key={card.title}>
                        <div className="stat-icon">{card.icon}</div>
                        <div>
                            <p className="stat-title">{card.title}</p>
                            <h3 className="stat-value">{card.value}</h3>
                        </div>
                    </article>
                ))}
            </div>

            <section className="dashboard-panels">
                <article className="panel-card panel-large">
                    <div className="panel-head">
                        <div>
                            <p className="panel-kicker">Operations</p>
                            <h3>Store snapshot</h3>
                        </div>
                    </div>
                    <ResponsiveContainer height={280}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#dbe4f0" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#2563eb" />
                        </BarChart>
                    </ResponsiveContainer>
                </article>

                <article className="panel-card">
                    <div className="panel-head">
                        <div>
                            <p className="panel-kicker">Actions</p>
                            <h3>Quick access</h3>
                        </div>
                    </div>
                    <div className="quick-actions">
                        <button onClick={() => navigate("/admin/orders")}>Open orders</button>
                        <button onClick={() => navigate("/admin/users")}>Manage users</button>
                        <button onClick={() => navigate("/products")}>Edit catalog</button>
                        <button onClick={() => navigate("/admin/complaints")}>Review complaints</button>
                        <button onClick={() => navigate("/admin/feedback")}>Read feedback</button>
                    </div>
                </article>
            </section>

            <section className="dashboard-panels">
                <article className="panel-card panel-large">
                    <div className="panel-head">
                        <div>
                            <p className="panel-kicker">Distribution</p>
                            <h3>Activity mix</h3>
                        </div>
                    </div>
                    <ResponsiveContainer height={280}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={100}
                                innerRadius={60}
                                paddingAngle={2}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </article>
            </section>
        </div>
    );
}
