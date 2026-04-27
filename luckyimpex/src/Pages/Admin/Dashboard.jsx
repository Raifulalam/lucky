import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaArrowRight,
    FaBoxOpen,
    FaChartLine,
    FaClipboardList,
    FaExclamationTriangle,
    FaMoneyBillWave,
    FaShoppingCart,
    FaUserCheck,
    FaUserClock,
    FaUsers,
} from "react-icons/fa";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import "./Dashboard.css";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#7c3aed"];

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

export default function Dashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    const [storeStats, setStoreStats] = useState({});
    const [employeeStats, setEmployeeStats] = useState({});
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const [storeRes, hrRes, employeeRes] = await Promise.all([
                    fetch("https://lucky-1-6ma5.onrender.com/api/dashboard/stats", { headers }),
                    fetch("https://lucky-1-6ma5.onrender.com/api/employees/admin-dashboard", { headers }),
                    fetch("https://lucky-1-6ma5.onrender.com/api/employees/admin-employeeStats", { headers }),
                ]);

                const storeData = await storeRes.json();
                const hrData = await hrRes.json();
                const employeeData = await employeeRes.json();

                setStoreStats(storeData.data || {});
                setEmployeeStats(hrData.stats || {});
                setEmployees(employeeData.employees || []);
            } catch (error) {
                console.error("Dashboard fetch failed", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [token]);

    const derived = useMemo(() => {
        const activeEmployees = employees.filter((employee) =>
            ["active", "Active"].includes(employee.status)
        ).length;
        const inactiveEmployees = employees.filter((employee) =>
            ["inactive", "Inactive"].includes(employee.status)
        ).length;
        const totalLeaves = employees.reduce((sum, employee) => sum + Number(employee.totalLeaves || 0), 0);
        const totalPresent = employees.reduce((sum, employee) => sum + Number(employee.totalPresent || 0), 0);
        const totalAbsent = employees.reduce((sum, employee) => sum + Number(employee.totalAbsent || 0), 0);
        const attendanceRate =
            totalPresent + totalAbsent > 0 ? (totalPresent / (totalPresent + totalAbsent)) * 100 : 0;

        const departmentMap = employees.reduce((accumulator, employee) => {
            const key = employee.department || "Unassigned";
            accumulator[key] = (accumulator[key] || 0) + 1;
            return accumulator;
        }, {});

        const departmentData = Object.entries(departmentMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);

        const attendanceSplit = [
            { name: "Present", value: totalPresent },
            { name: "Absent", value: totalAbsent },
            { name: "Leaves", value: totalLeaves },
        ];

        const payrollExposure = [...employees]
            .sort((a, b) => Number(b.totalSalaryPaid || 0) - Number(a.totalSalaryPaid || 0))
            .slice(0, 6)
            .map((employee) => ({
                name: employee.name?.split(" ")[0] || "Employee",
                salary: Number(employee.totalSalaryPaid || 0),
            }));

        const spotlightEmployees = [...employees]
            .sort(
                (a, b) =>
                    Number(b.totalPresent || 0) - Number(a.totalPresent || 0) ||
                    Number(b.totalSalaryPaid || 0) - Number(a.totalSalaryPaid || 0)
            )
            .slice(0, 4);

        return {
            activeEmployees,
            inactiveEmployees,
            totalLeaves,
            totalPresent,
            totalAbsent,
            attendanceRate,
            departmentData,
            attendanceSplit,
            payrollExposure,
            spotlightEmployees,
        };
    }, [employees]);

    if (loading) {
        return <div className="loading">Loading employee dashboard...</div>;
    }

    const metricCards = [
        {
            title: "Employees",
            value: employeeStats.totalEmployees || employees.length || 0,
            note: `${derived.activeEmployees} active, ${derived.inactiveEmployees} inactive`,
            icon: <FaUsers />,
            tone: "blue",
        },
        {
            title: "Attendance Health",
            value: formatPercent(derived.attendanceRate),
            note: `${derived.totalPresent} present / ${derived.totalAbsent} absent`,
            icon: <FaUserCheck />,
            tone: "green",
        },
        {
            title: "Salary Paid",
            value: formatCurrency(employeeStats.totalSalaryPaid || 0),
            note: "Total employee salary exposure",
            icon: <FaMoneyBillWave />,
            tone: "amber",
        },
        {
            title: "Leave Requests",
            value: employeeStats.totalLeaves || derived.totalLeaves || 0,
            note: "Tracked across employee records",
            icon: <FaUserClock />,
            tone: "violet",
        },
        {
            title: "Orders",
            value: storeStats.orders || 0,
            note: `${storeStats.users || 0} registered customers`,
            icon: <FaShoppingCart />,
            tone: "slate",
        },
        {
            title: "Inventory Alerts",
            value: storeStats.outOfStockProducts || 0,
            note: `${storeStats.products || 0} listed products`,
            icon: <FaExclamationTriangle />,
            tone: "rose",
        },
    ];

    const quickActions = [
        {
            title: "Manage employees",
            description: "Add new employees, edit roles, and maintain payroll-ready details.",
            to: "/admin/employees",
        },
        {
            title: "Review user accounts",
            description: "Audit customer/admin roles and export account records.",
            to: "/admin/users",
        },
        {
            title: "Track fulfillment",
            description: "Watch order flow, complaints, and review activity.",
            to: "/admin/orders",
        },
    ];

    return (
        <div className="dashboard-main">
            <section className="dashboard-hero">
                <div>
                    <p className="hero-kicker">Admin overview</p>
                    <h1 className="main-title">Employee-first command center</h1>
                    <p className="hero-copy">
                        This dashboard prioritizes workforce visibility while still keeping the store’s operational health in view.
                    </p>
                </div>
                <div className="hero-pulse">
                    <span>Live snapshot</span>
                    <strong>{formatCurrency(employeeStats.totalSalaryPaid || 0)}</strong>
                    <p>Payroll processed across {employeeStats.totalEmployees || employees.length || 0} employees</p>
                </div>
            </section>

            <div className="stats-grid">
                {metricCards.map((card) => (
                    <article className={`stat-card tone-${card.tone}`} key={card.title}>
                        <div className="stat-icon">{card.icon}</div>
                        <div>
                            <p className="stat-title">{card.title}</p>
                            <h3 className="stat-value">{card.value}</h3>
                            <p className="stat-note">{card.note}</p>
                        </div>
                    </article>
                ))}
            </div>

            <section className="dashboard-panels">
                <article className="panel-card panel-large">
                    <div className="panel-head">
                        <div>
                            <p className="panel-kicker">Departments</p>
                            <h3>Team distribution</h3>
                        </div>
                    </div>
                    <ResponsiveContainer height={280}>
                        <BarChart data={derived.departmentData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#dbe4f0" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="#2563eb" />
                        </BarChart>
                    </ResponsiveContainer>
                </article>

                <article className="panel-card">
                    <div className="panel-head">
                        <div>
                            <p className="panel-kicker">Attendance</p>
                            <h3>Presence split</h3>
                        </div>
                    </div>
                    <ResponsiveContainer height={280}>
                        <PieChart>
                            <Pie data={derived.attendanceSplit} dataKey="value" innerRadius={60} outerRadius={95} paddingAngle={3}>
                                {derived.attendanceSplit.map((entry, index) => (
                                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </article>
            </section>

            <section className="dashboard-panels">
                <article className="panel-card panel-large">
                    <div className="panel-head">
                        <div>
                            <p className="panel-kicker">Payroll</p>
                            <h3>Top salary exposure</h3>
                        </div>
                    </div>
                    <ResponsiveContainer height={300}>
                        <LineChart data={derived.payrollExposure}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#dbe4f0" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="salary" stroke="#16a34a" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </article>

                <article className="panel-card">
                    <div className="panel-head">
                        <div>
                            <p className="panel-kicker">Operations</p>
                            <h3>Store signals</h3>
                        </div>
                    </div>
                    <ul className="signal-list">
                        <li>
                            <FaBoxOpen />
                            <span>{storeStats.products || 0} active products</span>
                        </li>
                        <li>
                            <FaClipboardList />
                            <span>{storeStats.complaints || 0} complaints logged</span>
                        </li>
                        <li>
                            <FaChartLine />
                            <span>{storeStats.reviews || 0} review messages collected</span>
                        </li>
                    </ul>
                </article>
            </section>

            <section className="dashboard-panels">
                <article className="panel-card">
                    <div className="panel-head">
                        <div>
                            <p className="panel-kicker">Quick actions</p>
                            <h3>Jump into admin work</h3>
                        </div>
                    </div>

                    <div className="action-list">
                        {quickActions.map((action) => (
                            <button className="action-card" key={action.title} onClick={() => navigate(action.to)}>
                                <div>
                                    <strong>{action.title}</strong>
                                    <p>{action.description}</p>
                                </div>
                                <FaArrowRight />
                            </button>
                        ))}
                    </div>
                </article>

                <article className="panel-card">
                    <div className="panel-head">
                        <div>
                            <p className="panel-kicker">Spotlight</p>
                            <h3>Top employee records</h3>
                        </div>
                    </div>

                    <div className="employee-list">
                        {derived.spotlightEmployees.map((employee) => (
                            <div className="employee-row" key={employee.empId}>
                                <div>
                                    <strong>{employee.name}</strong>
                                    <p>{employee.department || "General"} · {employee.designation || "Employee"}</p>
                                </div>
                                <div className="employee-meta">
                                    <span>{employee.totalPresent || 0} present</span>
                                    <span>{formatCurrency(employee.totalSalaryPaid || 0)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>
            </section>
        </div>
    );
}
