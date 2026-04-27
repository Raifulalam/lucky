import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaTrash, FaTruck } from "react-icons/fa";
import { Helmet } from "react-helmet";
import "./OrderComponent.css";
import { authRequest } from "../../api/api";

const ITEMS_PER_PAGE = 8;
const STATUS_FLOW = ["Placed", "Shipped", "Delivered"];

const OrderComponent = () => {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await authRequest("/orders/orders");
            setOrders(data);
        } catch (err) {
            setError(err.message || "Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    const getNextStatus = (status) => {
        const idx = STATUS_FLOW.indexOf(status);
        return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
    };

    const updateStatus = async (id, status) => {
        try {
            const updated = await authRequest(`/orders/orders/${id}`, {
                method: "PUT",
                body: { status },
            });
            setOrders((prev) => prev.map((order) => (order._id === updated._id ? updated : order)));
        } catch (err) {
            alert(err.message || "Status update failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this order permanently?")) return;
        try {
            await authRequest(`/orders/orders/${id}`, {
                method: "DELETE",
            });
            setOrders((prev) => prev.filter((order) => order._id !== id));
        } catch (err) {
            alert(err.message || "Delete failed");
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const textMatch =
                order._id.toLowerCase().includes(search.toLowerCase()) ||
                order.name.toLowerCase().includes(search.toLowerCase()) ||
                order.phone.includes(search);

            const statusMatch = statusFilter ? order.status === statusFilter : true;
            const created = new Date(order.createdAt);
            const afterStart = startDate ? created >= new Date(startDate) : true;
            const beforeEnd = endDate ? created <= new Date(endDate) : true;

            return textMatch && statusMatch && afterStart && beforeEnd;
        });
    }, [orders, search, statusFilter, startDate, endDate]);

    const analytics = useMemo(() => {
        const now = new Date();
        return {
            total: orders.length,
            today: orders.filter((order) => new Date(order.createdAt).toDateString() === now.toDateString()).length,
            last7: orders.filter((order) => now - new Date(order.createdAt) <= 7 * 86400000).length,
            last30: orders.filter((order) => now - new Date(order.createdAt) <= 30 * 86400000).length,
        };
    }, [orders]);

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const exportCSV = () => {
        const headers = ["Order ID", "User", "Phone", "Status", "Date"];
        const rows = filteredOrders.map((order) => [
            `"${order._id}"`,
            `"${order.name}"`,
            `"${order.phone}"`,
            `"${order.status}"`,
            `"${new Date(order.createdAt).toLocaleString()}"`,
        ]);

        const csv =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

        const link = document.createElement("a");
        link.href = encodeURI(csv);
        link.download = `orders-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <section className="order-page">
            <Helmet>
                <title>Order Management | Admin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <h1>Order Management</h1>

            <div className="analytics-grid">
                <div className="card"><h3>Total</h3><p>{analytics.total}</p></div>
                <div className="card"><h3>Today</h3><p>{analytics.today}</p></div>
                <div className="card"><h3>Last 7 Days</h3><p>{analytics.last7}</p></div>
                <div className="card"><h3>Last 30 Days</h3><p>{analytics.last30}</p></div>
            </div>

            <div className="filter-bar">
                <input
                    placeholder="Search order / user / phone"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />

                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    <option value="">All Status</option>
                    {STATUS_FLOW.map((status) => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>

                <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />

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
                                {paginatedOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td>{order._id}</td>
                                        <td>
                                            <span className={`status ${order.status.toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                            {getNextStatus(order.status) && (
                                                <button
                                                    className="status-btn"
                                                    title="Update Status"
                                                    onClick={() => updateStatus(order._id, getNextStatus(order.status))}
                                                >
                                                    <FaTruck />
                                                </button>
                                            )}
                                        </td>
                                        <td>{order.name}</td>
                                        <td>{order.phone}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="actions">
                                            <button onClick={() => navigate(`/admin/orders/${order._id}`)}><FaEye /></button>
                                            <button onClick={() => handleDelete(order._id)}><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination">
                        <button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Prev</button>
                        <span>{page} / {totalPages}</span>
                        <button disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
                    </div>
                </>
            )}
        </section>
    );
};

export default OrderComponent;
