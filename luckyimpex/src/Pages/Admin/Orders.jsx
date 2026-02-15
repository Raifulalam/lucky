import React, { useEffect, useState, useContext, useMemo } from "react";
import { UserContext } from "../../Components/UserContext";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaEye, FaTruck } from "react-icons/fa";
import { Helmet } from "react-helmet";
import "./OrderComponent.css";

const ITEMS_PER_PAGE = 8;
const STATUS_FLOW = ["Placed", "Shipped", "Delivered"];

const OrderComponent = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);

    /* ---------------- FETCH ---------------- */

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch("https://lucky-back.onrender.com/api/orders");
            if (!res.ok) throw new Error();
            const data = await res.json();
            setOrders(data);
        } catch {
            setError("Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- STATUS ---------------- */

    const getNextStatus = (status) => {
        const idx = STATUS_FLOW.indexOf(status);
        return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
    };

    const updateStatus = async (id, status) => {
        try {
            const res = await fetch(
                `https://lucky-back.onrender.com/api/orders/${id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status }),
                }
            );
            if (!res.ok) throw new Error();
            const updated = await res.json();
            setOrders((prev) =>
                prev.map((o) => (o._id === updated._id ? updated : o))
            );
        } catch {
            alert("Status update failed");
        }
    };

    /* ---------------- DELETE ---------------- */

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this order permanently?")) return;
        try {
            const res = await fetch(
                `https://lucky-back.onrender.com/api/orders/${id}`,
                { method: "DELETE" }
            );
            if (!res.ok) throw new Error();
            setOrders((prev) => prev.filter((o) => o._id !== id));
        } catch {
            alert("Delete failed");
        }
    };

    /* ---------------- FILTERING ---------------- */

    const filteredOrders = useMemo(() => {
        return orders.filter((o) => {
            const textMatch =
                o._id.toLowerCase().includes(search.toLowerCase()) ||
                o.name.toLowerCase().includes(search.toLowerCase()) ||
                o.phone.includes(search);

            const statusMatch = statusFilter ? o.status === statusFilter : true;

            const created = new Date(o.createdAt);
            const afterStart = startDate ? created >= new Date(startDate) : true;
            const beforeEnd = endDate ? created <= new Date(endDate) : true;

            return textMatch && statusMatch && afterStart && beforeEnd;
        });
    }, [orders, search, statusFilter, startDate, endDate]);

    /* ---------------- ANALYTICS ---------------- */

    const analytics = useMemo(() => {
        const now = new Date();
        return {
            total: orders.length,
            today: orders.filter(
                (o) =>
                    new Date(o.createdAt).toDateString() === now.toDateString()
            ).length,
            last7: orders.filter(
                (o) => now - new Date(o.createdAt) <= 7 * 86400000
            ).length,
            last30: orders.filter(
                (o) => now - new Date(o.createdAt) <= 30 * 86400000
            ).length,
        };
    }, [orders]);

    /* ---------------- PAGINATION ---------------- */

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    /* ---------------- CSV EXPORT ---------------- */

    const exportCSV = () => {
        const headers = ["Order ID", "User", "Phone", "Status", "Date"];
        const rows = filteredOrders.map((o) => [
            `"${o._id}"`,
            `"${o.name}"`,
            `"${o.phone}"`,
            `"${o.status}"`,
            `"${new Date(o.createdAt).toLocaleString()}"`
        ]);

        const csv =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

        const link = document.createElement("a");
        link.href = encodeURI(csv);
        link.download = `orders-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    /* ---------------- GUARD ---------------- */

    if (!user || user.role !== "admin")
        return <div className="unauthorized">❌ Admin access only</div>;

    return (
        <section className="order-page">
            <Helmet>
                <title>Order Management | Admin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <h1>📦 Order Management</h1>

            {/* ANALYTICS */}
            <div className="analytics-grid">
                <div className="card"><h3>Total</h3><p>{analytics.total}</p></div>
                <div className="card"><h3>Today</h3><p>{analytics.today}</p></div>
                <div className="card"><h3>Last 7 Days</h3><p>{analytics.last7}</p></div>
                <div className="card"><h3>Last 30 Days</h3><p>{analytics.last30}</p></div>
            </div>

            {/* FILTERS */}
            <div className="filter-bar">
                <input placeholder="Search order / user / phone"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Status</option>
                    {STATUS_FLOW.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

                <button className="export-btn" onClick={exportCSV}>Export CSV</button>
            </div>

            {loading && <p>Loading orders...</p>}
            {error && <p className="error-message">{error}</p>}

            {!loading && paginatedOrders.length > 0 && (
                <>
                    <div className="table-container">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Status</th>
                                    <th>User</th>
                                    <th>Phone</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedOrders.map(o => (
                                    <tr key={o._id}>
                                        <td>{o._id}</td>
                                        <td>
                                            <span className={`status ${o.status.toLowerCase()}`}>
                                                {o.status}
                                            </span>
                                            {getNextStatus(o.status) && (
                                                <button
                                                    className="status-btn"
                                                    title="Update Status"
                                                    onClick={() => updateStatus(o._id, getNextStatus(o.status))}
                                                >
                                                    <FaTruck />
                                                </button>
                                            )}
                                        </td>
                                        <td>{o.name}</td>
                                        <td>{o.phone}</td>
                                        <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                                        <td className="actions">
                                            <button onClick={() => navigate(`/review/${o._id}`)}><FaEye /></button>
                                            <button onClick={() => handleDelete(o._id)}><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    <div className="pagination">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                        <span>{page} / {totalPages}</span>
                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                </>
            )}
        </section>
    );
};

export default OrderComponent;
