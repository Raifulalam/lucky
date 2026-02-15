import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUsers,
    FaShoppingCart,
    FaComments,
    FaStar,
    FaTachometerAlt,
    FaCogs,
    FaProductHunt,
    FaTags,
    FaUserTie,
    FaMoneyBillWave,
} from "react-icons/fa";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

/* ---------------- SIDEBAR ---------------- */
const Sidebar = ({ navigate }) => (
    <aside className="sidebar">
        <h1 className="sidebar-title">Admin Panel</h1>
        <ul className="menus">
            <li onClick={() => navigate("/dashboard")}><FaTachometerAlt /> Dashboard</li>
            <li onClick={() => navigate("/orders")}><FaShoppingCart /> Orders</li>
            <li onClick={() => navigate("/admindashboard")}><FaUsers /> Users</li>
            <li onClick={() => navigate("/complaints")}><FaComments /> Complaints</li>
            <li onClick={() => navigate("/feedback")}><FaStar /> Reviews</li>
            <li onClick={() => navigate("/employee-manage")}><FaUserTie /> Employees</li>
            <li onClick={() => navigate("/manage-products")}><FaProductHunt /> Products</li>
            <li onClick={() => navigate("/settings")}><FaCogs /> Settings</li>
        </ul>
    </aside>
);

/* ---------------- DASHBOARD ---------------- */
export default function Dashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    const [stats, setStats] = useState({});
    const [employeeStats, setEmployeeStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [statsRes, empRes] = await Promise.all([
                    fetch("https://lucky-1-6ma5.onrender.com/api/dashboard/stats", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch("https://lucky-1-6ma5.onrender.com/api/employees/admin-dashboard", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const statsData = await statsRes.json();
                const empData = await empRes.json();

                setStats(statsData.data || {});
                setEmployeeStats(empData.stats || {});
            } catch (err) {
                console.error("Dashboard fetch failed", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [token]);

    if (loading) return <div className="loading">Loading dashboard...</div>;

    /* ---------------- STATS CARDS ---------------- */
    const statCards = [
        { title: "Users", value: stats.users, icon: <FaUsers /> },
        { title: "Orders", value: stats.orders, icon: <FaShoppingCart /> },
        { title: "Complaints", value: stats.complaints, icon: <FaComments /> },
        { title: "Reviews", value: stats.reviews, icon: <FaStar /> },
        { title: "Products", value: stats.products, icon: <FaProductHunt /> },
        { title: "Brands", value: stats.brands, icon: <FaTags /> },
        { title: "Employees", value: employeeStats.totalEmployees, icon: <FaUserTie /> },
        {
            title: "Salary Paid",
            value: `₹${employeeStats.totalSalaryPaid || 0}`,
            icon: <FaMoneyBillWave />,
        },
    ];

    /* ---------------- CHART DATA ---------------- */
    const barData = [
        { name: "Users", value: stats.users || 0 },
        { name: "Orders", value: stats.orders || 0 },
        { name: "Products", value: stats.products || 0 },
    ];

    const pieData = [
        { name: "Complaints", value: stats.complaints || 0 },
        { name: "Reviews", value: stats.reviews || 0 },
    ];

    const salaryTrend = [
        { month: "Jan", salary: 20000 },
        { month: "Feb", salary: 25000 },
        { month: "Mar", salary: 30000 },
        { month: "Apr", salary: 40000 },
        { month: "May", salary: 35000 },
        { month: "Jun", salary: employeeStats.totalSalaryPaid || 0 },
    ];

    const COLORS = ["#f97316", "#2563eb"];

    return (
        <div className="dashboard-container">
            <Sidebar navigate={navigate} />

            <main className="dashboard-main">
                <h1 className="main-title">Dashboard Overview</h1>

                {/* STATS */}
                <div className="stats-grid">
                    {statCards.map((s, i) => (
                        <div className="stat-card" key={i}>
                            <div className="stat-icon">{s.icon}</div>
                            <div>
                                <p className="stat-title">{s.title}</p>
                                <p className="stat-value">{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CHARTS */}
                <div className="charts-section">
                    <div className="chart-card">
                        <h3>Business Overview</h3>
                        <ResponsiveContainer height={260}>
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#2563eb" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <h3>Complaints vs Reviews</h3>
                        <ResponsiveContainer height={260}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" outerRadius={90} label>
                                    {pieData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <h3>Salary Trend</h3>
                        <ResponsiveContainer height={260}>
                            <LineChart data={salaryTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line dataKey="salary" stroke="#16a34a" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </main>
        </div>
    );
}
