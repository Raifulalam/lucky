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

    const fetchComplaints = async () => {
        try {
            const res = await fetch("https://lucky-1-6ma5.onrender.com/api/complaints/complaints", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Fetch failed");
            const data = await res.json();
            setComplaints(data || []);
            setError(null);
        } catch {
            setError("Failed to load complaints");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, [fetchComplaints]);

    const updateStatus = async (id, status) => {
        try {
            await fetch(`https://lucky-1-6ma5.onrender.com/api/complaints/complaints/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            setComplaints((prev) => prev.map((complaint) => (complaint._id === id ? { ...complaint, status } : complaint)));
        } catch {
            alert("Failed to update status");
        }
    };

    const handleDelComp = async (id) => {
        if (!window.confirm("Are you sure you want to delete this complaint?")) return;

        try {
            const res = await fetch(`https://lucky-1-6ma5.onrender.com/api/complaints/complaints/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Delete failed");
            setComplaints((prev) => prev.filter((complaint) => complaint._id !== id));
        } catch (deleteError) {
            alert("Failed to delete complaint");
            console.error(deleteError);
        }
    };

    const filteredData = useMemo(() => {
        return complaints.filter((complaint) => {
            const matchesSearch =
                complaint.name.toLowerCase().includes(search.toLowerCase()) ||
                complaint.phone.includes(search) ||
                complaint.product.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;
            const date = new Date(complaint.complaintdate);
            const matchesFrom = fromDate ? date >= new Date(fromDate) : true;
            const matchesTo = toDate ? date <= new Date(toDate) : true;

            return matchesSearch && matchesStatus && matchesFrom && matchesTo;
        });
    }, [complaints, search, statusFilter, fromDate, toDate]);

    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
    const paginatedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const analytics = useMemo(() => ({
        total: complaints.length,
        pending: complaints.filter((complaint) => complaint.status === "Pending").length,
        progress: complaints.filter((complaint) => complaint.status === "In Progress").length,
        resolved: complaints.filter((complaint) => complaint.status === "Resolved").length,
    }), [complaints]);

    const exportCSV = () => {
        const rows = [
            ["ID", "Name", "Phone", "Product", "Model", "Status", "Date"],
            ...filteredData.map((complaint) => [
                complaint._id,
                complaint.name,
                complaint.phone,
                complaint.product,
                complaint.model,
                complaint.status,
                new Date(complaint.complaintdate).toLocaleDateString(),
            ]),
        ];
        const csv = rows.map((row) => row.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "complaints.csv";
        link.click();
    };

    if (loading) return <p className="loading">Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="complaints-container">
            <h2>Complaints Dashboard</h2>

            <div className="stats">
                <div>Total: {analytics.total}</div>
                <div className="pending">Pending: {analytics.pending}</div>
                <div className="progress">In Progress: {analytics.progress}</div>
                <div className="resolved">Resolved: {analytics.resolved}</div>
            </div>

            <div className="filters">
                <input placeholder="Search..." value={search} onChange={(event) => setSearch(event.target.value)} />
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                </select>
                <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
                <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
                <button onClick={exportCSV}>Export CSV</button>
            </div>

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
                        {paginatedData.map((complaint) => (
                            <tr key={complaint._id}>
                                <td>{complaint._id.slice(-6)}</td>
                                <td>{complaint.name}</td>
                                <td>{complaint.phone}</td>
                                <td>{complaint.product}</td>
                                <td>
                                    <select
                                        className={`status status-${complaint.status.replace(" ", "-")}`}
                                        value={complaint.status}
                                        onChange={(event) => updateStatus(complaint._id, event.target.value)}
                                    >
                                        <option>Pending</option>
                                        <option>In Progress</option>
                                        <option>Resolved</option>
                                    </select>
                                </td>
                                <td>{new Date(complaint.complaintdate).toLocaleDateString()}</td>
                                <td>
                                    <img src={complaint.image} alt="" onClick={() => setImagePreview(complaint.image)} />
                                </td>
                                <td>
                                    <button className="delete-btn" onClick={() => handleDelComp(complaint._id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
                <span>{page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>

            {imagePreview && (
                <div className="image-modal" onClick={() => setImagePreview(null)}>
                    <img src={imagePreview} alt="" />
                </div>
            )}
        </div>
    );
};

export default ComplaintsComponent;
