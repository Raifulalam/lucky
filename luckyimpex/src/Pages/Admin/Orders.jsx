import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaTrash, FaTruck, FaPrint, FaFileInvoice, FaBox, FaTimes } from "react-icons/fa";
import "./OrderComponent.css";
import { authRequest } from "../../api/api";
import { useNotification } from "../../Components/NotificationContext";
import PageSeo from "../../Components/PageSeo";

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
    const { addNotification } = useNotification();

    // Printable Document Modal State
    const [printOrder, setPrintOrder] = useState(null);
    const [printTab, setPrintTab] = useState("invoice"); // "invoice" | "packing"

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await authRequest("/orders/orders");
            setOrders(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    const getNextStatus = (status) => {
        const idx = STATUS_FLOW.indexOf(String(status || "").trim());
        return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
    };

    const updateStatus = async (id, status) => {
        try {
            const updated = await authRequest(`/orders/orders/${id}`, {
                method: "PUT",
                body: { status },
            });
            setOrders((prev) => prev.map((order) => (order._id === updated._id ? updated : order)));
            addNotification({
                title: "Order updated",
                message: `Order #${String(updated?._id || id).slice(-6)} moved to ${updated?.status || status}.`,
                type: "success",
                container: "top-right",
                dismiss: { duration: 5000 },
                dedupeKey: `orderStatusUpdated:${updated?._id || id}:${updated?.status || status}`,
            });
        } catch (err) {
            alert(err.message || "Status update failed");
            addNotification({
                title: "Order update failed",
                message: err.message || "Status update failed",
                type: "error",
                container: "top-right",
                dismiss: { duration: 5000 },
            });
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

    const handleTriggerPrint = () => {
        window.print();
    };

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const orderId = String(order?._id || "");
            const name = String(order?.name || "");
            const phone = String(order?.phone || "");
            const textMatch =
                orderId.toLowerCase().includes(search.toLowerCase()) ||
                name.toLowerCase().includes(search.toLowerCase()) ||
                phone.includes(search);

            const statusMatch = statusFilter ? String(order?.status || "") === statusFilter : true;
            const created = new Date(order?.createdAt || Date.now());
            const afterStart = startDate ? created >= new Date(startDate) : true;
            const beforeEnd = endDate ? created <= new Date(endDate) : true;

            return textMatch && statusMatch && afterStart && beforeEnd;
        });
    }, [orders, search, statusFilter, startDate, endDate]);

    const analytics = useMemo(() => {
        const now = new Date();
        return {
            total: orders.length,
            today: orders.filter((order) => new Date(order?.createdAt || Date.now()).toDateString() === now.toDateString()).length,
            last7: orders.filter((order) => now - new Date(order?.createdAt || Date.now()) <= 7 * 86400000).length,
            last30: orders.filter((order) => now - new Date(order?.createdAt || Date.now()) <= 30 * 86400000).length,
        };
    }, [orders]);

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const exportCSV = () => {
        const headers = ["Order ID", "User", "Phone", "Status", "Date"];
        const rows = filteredOrders.map((order) => [
            `"${order?._id || ""}"`,
            `"${order?.name || ""}"`,
            `"${order?.phone || ""}"`,
            `"${order?.status || ""}"`,
            `"${new Date(order?.createdAt || Date.now()).toLocaleString()}"`,
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
            <PageSeo
                title="Order Management | Admin"
                description="Manage Lucky Impex orders."
                canonicalPath="/admin/orders"
                noIndex
            />

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
                                        <td>{order._id || "N/A"}</td>
                                        <td>
                                            <span className={`status ${String(order.status || "placed").toLowerCase()}`}>
                                                {order.status || "Placed"}
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
                                        <td>{order.name || "N/A"}</td>
                                        <td>{order.phone || "N/A"}</td>
                                        <td>{new Date(order.createdAt || Date.now()).toLocaleDateString()}</td>
                                        <td className="actions">
                                            <button onClick={() => navigate(`/admin/orders/${order._id}`)} title="View Details"><FaEye /></button>
                                            <button onClick={() => setPrintOrder(order)} title="Print Invoice / Packing Slip" className="btn-print-action"><FaPrint /></button>
                                            <button onClick={() => handleDelete(order._id)} title="Delete Order"><FaTrash /></button>
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

            {/* ── PRINTABLE INVOICE / PACKING SLIP MODAL ── */}
            {printOrder && (
                <div className="order-print-overlay" onClick={(e) => e.target === e.currentTarget && setPrintOrder(null)}>
                    <div className="order-print-modal">
                        {/* Modal Navigation Header (Screen only) */}
                        <div className="print-modal-bar no-print">
                            <div className="print-tab-selector">
                                <button
                                    className={`tab-btn ${printTab === "invoice" ? "active" : ""}`}
                                    onClick={() => setPrintTab("invoice")}
                                >
                                    <FaFileInvoice /> Tax Invoice
                                </button>
                                <button
                                    className={`tab-btn ${printTab === "packing" ? "active" : ""}`}
                                    onClick={() => setPrintTab("packing")}
                                >
                                    <FaBox /> Packing Slip
                                </button>
                            </div>
                            <div className="print-bar-actions">
                                <button className="btn-print-now" onClick={handleTriggerPrint}>
                                    <FaPrint /> Print Document
                                </button>
                                <button className="btn-close-modal" onClick={() => setPrintOrder(null)}>
                                    <FaTimes />
                                </button>
                            </div>
                        </div>

                        {/* Printable Area (Sent to printer) */}
                        <div className="printable-document-area">
                            {printTab === "invoice" ? (
                                <div className="invoice-doc">
                                    <div className="doc-header">
                                        <div className="company-info">
                                            <h1 className="brand-name">LUCKY IMPEX</h1>
                                            <p className="brand-tagline">Electronics & Home Appliances Wholesale / Retail</p>
                                            <p className="contact-line">Main Road, Birgunj, Nepal | Tel: +977-9800000000</p>
                                            <p className="contact-line">PAN/VAT: 301294812 | Email: info@luckyimpex.com</p>
                                        </div>
                                        <div className="doc-title-block">
                                            <h2>TAX INVOICE</h2>
                                            <div className="meta-row"><strong>Invoice No:</strong> <span>INV-{String(printOrder._id).slice(-8).toUpperCase()}</span></div>
                                            <div className="meta-row"><strong>Date:</strong> <span>{new Date(printOrder.createdAt || Date.now()).toLocaleDateString()}</span></div>
                                            <div className="meta-row"><strong>Payment:</strong> <span className="badge-paid">{printOrder.paymentMethod || "COD"}</span></div>
                                        </div>
                                    </div>

                                    <div className="doc-bill-to">
                                        <div className="bill-col">
                                            <h3>Billed To (Customer):</h3>
                                            <p><strong>{printOrder.name || "Customer"}</strong></p>
                                            <p>Phone: {printOrder.phone || "N/A"}</p>
                                            <p>Address: {printOrder.address || "Showroom Pickup / Counter Sale"}</p>
                                        </div>
                                        <div className="bill-col">
                                            <h3>Order Details:</h3>
                                            <p>Order Reference: #{String(printOrder._id)}</p>
                                            <p>Status: {printOrder.status || "Placed"}</p>
                                        </div>
                                    </div>

                                    <table className="doc-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Item Description</th>
                                                <th className="text-right">Qty</th>
                                                <th className="text-right">Unit Price</th>
                                                <th className="text-right">Total (NPR)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(printOrder.items) && printOrder.items.length > 0 ? (
                                                printOrder.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td>{idx + 1}</td>
                                                        <td>
                                                            <strong>{item.name || item.productName || "Product"}</strong>
                                                            {item.model && <span className="sub-model"> ({item.model})</span>}
                                                        </td>
                                                        <td className="text-right">{item.quantity || item.qty || 1}</td>
                                                        <td className="text-right">Rs {Number(item.price || 0).toLocaleString()}</td>
                                                        <td className="text-right">Rs {(Number(item.price || 0) * (item.quantity || item.qty || 1)).toLocaleString()}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td>1</td>
                                                    <td>Standard Order Package</td>
                                                    <td className="text-right">1</td>
                                                    <td className="text-right">Rs {Number(printOrder.totalAmount || printOrder.total || 0).toLocaleString()}</td>
                                                    <td className="text-right">Rs {Number(printOrder.totalAmount || printOrder.total || 0).toLocaleString()}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="4" className="text-right"><strong>Subtotal:</strong></td>
                                                <td className="text-right">Rs {Number(printOrder.totalAmount || printOrder.total || 0).toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan="4" className="text-right"><strong>V.A.T (13% Included):</strong></td>
                                                <td className="text-right">Rs {Math.round((printOrder.totalAmount || printOrder.total || 0) * 0.115).toLocaleString()}</td>
                                            </tr>
                                            <tr className="grand-total-row">
                                                <td colSpan="4" className="text-right"><strong>Grand Total:</strong></td>
                                                <td className="text-right">Rs {Number(printOrder.totalAmount || printOrder.total || 0).toLocaleString()}</td>
                                            </tr>
                                        </tfoot>
                                    </table>

                                    <div className="doc-footer-sign">
                                        <div className="sign-box">
                                            <p>Customer Signature</p>
                                        </div>
                                        <div className="sign-box text-right">
                                            <p>Authorized Signature (Lucky Impex)</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="packing-doc">
                                    <div className="doc-header">
                                        <div className="company-info">
                                            <h1 className="brand-name">LUCKY IMPEX</h1>
                                            <p className="brand-tagline">Warehouse Dispatch & Packing Slip</p>
                                            <p className="contact-line">Central Distribution Warehouse | Birgunj, Nepal</p>
                                        </div>
                                        <div className="doc-title-block">
                                            <h2>PACKING SLIP</h2>
                                            <div className="meta-row"><strong>Slip No:</strong> <span>PS-{String(printOrder._id).slice(-8).toUpperCase()}</span></div>
                                            <div className="meta-row"><strong>Dispatch Date:</strong> <span>{new Date().toLocaleDateString()}</span></div>
                                        </div>
                                    </div>

                                    <div className="doc-bill-to">
                                        <div className="bill-col">
                                            <h3>Ship To:</h3>
                                            <p><strong>{printOrder.name || "Customer"}</strong></p>
                                            <p>Phone: {printOrder.phone || "N/A"}</p>
                                            <p>Delivery Address: {printOrder.address || "Showroom Counter Pickup"}</p>
                                        </div>
                                        <div className="bill-col">
                                            <h3>Warehouse Verification:</h3>
                                            <p>Order ID: #{String(printOrder._id)}</p>
                                            <p>Carrier / Courier: {printOrder.courier || "Standard Dispatch"}</p>
                                        </div>
                                    </div>

                                    <table className="doc-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Product Description</th>
                                                <th className="text-center">Qty to Pack</th>
                                                <th className="text-center">Verified</th>
                                                <th>Notes / Serials</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(printOrder.items) && printOrder.items.length > 0 ? (
                                                printOrder.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td>{idx + 1}</td>
                                                        <td>
                                                            <strong>{item.name || item.productName || "Product"}</strong>
                                                            {item.model && <span className="sub-model"> ({item.model})</span>}
                                                        </td>
                                                        <td className="text-center"><strong>{item.quantity || item.qty || 1}</strong></td>
                                                        <td className="text-center">[ &nbsp; ]</td>
                                                        <td>{item.serialNumber || "—"}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td>1</td>
                                                    <td>Standard Order Package Items</td>
                                                    <td className="text-center">1</td>
                                                    <td className="text-center">[ &nbsp; ]</td>
                                                    <td>—</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>

                                    <div className="doc-footer-sign">
                                        <div className="sign-box">
                                            <p>Packed & Verified By (Warehouse Staff)</p>
                                        </div>
                                        <div className="sign-box text-right">
                                            <p>Received By Driver / Courier</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default OrderComponent;
