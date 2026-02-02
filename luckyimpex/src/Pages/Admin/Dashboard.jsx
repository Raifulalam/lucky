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



export default function Dashboard() {
    const navigate = useNavigate();
    const [statsData, setStatsData] = useState({
        users: 0,
        orders: 0,
        complaints: 0,
        reviews: 0,
        products: 0,
        brands: 0,
    });
    const Sidebar = () => (
        <div className="sidebar">
            <h1 className="sidebar-title">Admin Panel</h1>

            <ul className="menus">
                <li>
                    <button onClick={() => navigate("/dashboard")}>
                        <FaTachometerAlt /> Dashboard
                    </button>
                </li>

                <li>
                    <button onClick={() => navigate("/orders")}>
                        <FaShoppingCart /> Orders
                    </button>
                </li>

                <li>
                    <button onClick={() => navigate("/admindashboard")}>
                        <FaUsers /> Users
                    </button>
                </li>

                <li>
                    <button onClick={() => navigate("/complaints")}>
                        <FaComments /> Complaints
                    </button>
                </li>

                <li>
                    <button onClick={() => navigate("/feedback")}>
                        <FaStar /> Reviews
                    </button>
                </li>

                <li>
                    <button onClick={() => navigate("/employee-manage")}>
                        <FaStar /> Manage Employee
                    </button>
                </li>
                <li>
                    <button onClick={() => navigate("/manage-products")}>
                        <FaStar /> Manage Products
                    </button>
                </li>

                <li>
                    <button onClick={() => navigate("/settings")}>
                        <FaCogs /> Settings
                    </button>
                </li>
            </ul>
        </div>
    );
    const [employeeStats, setEmployeeStats] = useState({
        totalEmployees: 0,
        totalAttendance: 0,
        totalLeaves: 0,
        totalSalaryPaid: 0,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(
                    "https://lucky-1-6ma5.onrender.com/api/dashboard/stats"
                );
                if (!res.ok) throw new Error("Stats request failed");
                const data = await res.json();
                setStatsData(data);
            } catch (err) {
                console.error("Failed to fetch stats:", err);
            }
        };

        const fetchEmployeeStats = async () => {
            try {
                const token = localStorage.getItem("authToken");
                const res = await fetch(
                    "https://lucky-back.onrender.com/api/admin-dashboard",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const data = await res.json();
                if (data.success) {
                    setEmployeeStats(data.stats);
                }
            } catch (err) {
                console.error("Error fetching employee stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        fetchEmployeeStats();
    }, []);

    const statCards = [
        { title: "Total Users", value: statsData.users, icon: <FaUsers /> },
        { title: "Orders", value: statsData.orders, icon: <FaShoppingCart /> },
        { title: "Complaints", value: statsData.complaints, icon: <FaComments /> },
        { title: "Reviews", value: statsData.reviews, icon: <FaStar /> },
        { title: "Products", value: statsData.products, icon: <FaProductHunt /> },
        { title: "Brands", value: statsData.brands, icon: <FaTags /> },

        // Employee stats
        { title: "Employees", value: employeeStats.totalEmployees, icon: <FaUserTie /> },
        { title: "Salary Paid", value: `₹${employeeStats.totalSalaryPaid}`, icon: <FaMoneyBillWave /> },
    ];

    if (loading) return <div>Loading dashboard...</div>;

    // Chart data
    const barData = [
        { name: "Users", value: statsData.users },
        { name: "Orders", value: statsData.orders },
        { name: "Products", value: statsData.products },
    ];

    const pieData = [
        { name: "Complaints", value: statsData.complaints },
        { name: "Reviews", value: statsData.reviews },
    ];

    const salaryTrendData = [
        { month: "Jan", salary: 20000 },
        { month: "Feb", salary: 25000 },
        { month: "Mar", salary: 30000 },
        { month: "Apr", salary: 40000 },
        { month: "May", salary: 35000 },
        { month: "Jun", salary: employeeStats.totalSalaryPaid },
    ];

    const COLORS = ["#FF8042", "#0088FE"];

    return (
        <div className="dashboard-container">
            <Sidebar />

            <div className="dashboard-main">
                <h1 className="main-title">Dashboard Overview</h1>

                <div className="stats-grid">
                    {statCards.map((item, idx) => (
                        <div className="stat-card" key={idx}>
                            <div className="stat-icon">{item.icon}</div>
                            <div className="stat-info">
                                <p className="stat-title">{item.title}</p>
                                <p className="stat-value">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="charts-section">
                    <div className="chart-card">
                        <h3>Business Overview</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <h3>Complaints vs Reviews</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <h3>Salary Trend</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={salaryTrendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="salary" stroke="#82ca9d" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
