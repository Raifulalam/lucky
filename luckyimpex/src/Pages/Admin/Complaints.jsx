import React, { useEffect, useMemo, useState } from "react";
import "./Complaints.css";

const PAGE_SIZE = 10;

const ComplaintsComponent = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const token = localStorage.getItem("authToken");

    // Fetch complaints
    const fetchComplaints = async () => {
        try {
            const res = await fetch(
                "https://lucky-1-6ma5.onrender.com/api/complaints/complaints",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) throw new Error("Fetch failed");
            const data = await res.json();
            setComplaints(data || []);
            setError(null);
        } catch (err) {
            setError("Failed to load complaints");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    });

    // Update status
    const updateStatus = async (id, status) => {
        try {
            await fetch(
                `https://lucky-1-6ma5.onrender.com/api/complaints/complaints/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status }),
                }
            );

            setComplaints((prev) =>
                prev.map((c) => (c._id === id ? { ...c, status } : c))
            );
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const handleDelComp = async (id) => {
        if (!window.confirm("Are you sure you want to delete this complaint?")) return;

        try {
            const res = await fetch(
                `https://lucky-1-6ma5.onrender.com/api/complaints/complaints/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) throw new Error("Delete failed");

            // Remove from UI instantly
            setComplaints((prev) => prev.filter((c) => c._id !== id));
        } catch (error) {
            alert("Failed to delete complaint");
            console.error(error);
        }
    };

    // Filters
    const filteredData = useMemo(() => {
        return complaints.filter((c) => {
            const matchesSearch =
                c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.phone.includes(search) ||
                c.product.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "all" || c.status === statusFilter;

            const date = new Date(c.complaintdate);
            const matchesFrom = fromDate ? date >= new Date(fromDate) : true;
            const matchesTo = toDate ? date <= new Date(toDate) : true;

            return matchesSearch && matchesStatus && matchesFrom && matchesTo;
        });
    }, [complaints, search, statusFilter, fromDate, toDate]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
    const paginatedData = filteredData.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    // Analytics
    const analytics = useMemo(() => {
        return {
            total: complaints.length,
            pending: complaints.filter((c) => c.status === "Pending").length,
            progress: complaints.filter((c) => c.status === "In Progress").length,
            resolved: complaints.filter((c) => c.status === "Resolved").length,
        };
    }, [complaints]);

    // CSV Export
    const exportCSV = () => {
        const rows = [
            ["ID", "Name", "Phone", "Product", "Model", "Status", "Date"],
            ...filteredData.map((c) => [
                c._id,
                c.name,
                c.phone,
                c.product,
                c.model,
                c.status,
                new Date(c.complaintdate).toLocaleDateString(),
            ]),
        ];
        const csv = rows.map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "complaints.csv";
        a.click();
    };

    if (loading) return <p className="loading">Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="complaints-container">
            <h2>Complaints Dashboard</h2>

            {/* Analytics */}
            <div className="stats">
                <div>Total: {analytics.total}</div>
                <div className="pending">Pending: {analytics.pending}</div>
                <div className="progress">In Progress: {analytics.progress}</div>
                <div className="resolved">Resolved: {analytics.resolved}</div>
            </div>

            {/* Filters */}
            <div className="filters">
                <input
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                </select>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                <button onClick={exportCSV}>Export CSV</button>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Product</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Image</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((c) => (
                            <tr key={c._id}>
                                <td>{c._id.slice(-6)}</td>
                                <td>{c.name}</td>
                                <td>{c.phone}</td>
                                <td>{c.product}</td>
                                <td>
                                    <select
                                        className={`status status-${c.status.replace(" ", "-")}`} value={c.status}
                                        onChange={(e) => updateStatus(c._id, e.target.value)}
                                    >
                                        <option>Pending</option>
                                        <option>In Progress</option>
                                        <option>Resolved</option>
                                    </select>
                                </td>
                                <td>{new Date(c.complaintdate).toLocaleDateString()}</td>
                                <td>
                                    <img
                                        src={c.image}
                                        alt=""
                                        onClick={() => setImagePreview(c.image)}
                                    />
                                </td>
                                <td>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelComp(c._id)}
                                    >
                                        Delete
                                    </button>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                    Prev
                </button>
                <span>
                    {page} / {totalPages}
                </span>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </button>
            </div>
            {/* IMAGE MODAL */}
            {imagePreview && (
                <div className="image-modal" onClick={() => setImagePreview(null)}>
                    <img src={imagePreview} alt="" />
                </div>
            )}
        </div>
    );
};

export default ComplaintsComponent;
