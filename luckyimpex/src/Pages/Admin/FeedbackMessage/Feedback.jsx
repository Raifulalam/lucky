import React, { useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import "./Feedback.css";
import { useNotification } from "../../../Components/NotificationContext";

const ITEMS_PER_PAGE = 8;

const FeedbackList = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const token = localStorage.getItem("authToken");
    const { addNotification } = useNotification();

    /* ---------------- FETCH ---------------- */

    useEffect(() => {
        fetchFeedbacks();
        // eslint-disable-next-line
    }, []);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const res = await fetch(
                "https://lucky-1-6ma5.onrender.com/api/contact/contact",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!res.ok) throw new Error();

            const data = await res.json();
            setFeedbacks(data);
            setError("");
        } catch {
            setError("Unable to load messages.");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- DELETE ---------------- */

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this message permanently?")) return;

        try {
            const res = await fetch(
                `https://lucky-1-6ma5.onrender.com/api/contact/contact/${id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!res.ok) throw new Error();

            setFeedbacks((prev) => prev.filter((f) => f._id !== id));

            addNotification({
                title: "Deleted",
                message: "Message removed",
                type: "success",
                container: "top-right",
                dismiss: { duration: 3000 },
            });
        } catch {
            addNotification({
                title: "Error",
                message: "Delete failed",
                type: "error",
                container: "top-right",
                dismiss: { duration: 3000 },
            });
        }
    };

    /* ---------------- FILTERING ---------------- */

    const filteredFeedbacks = useMemo(() => {
        return feedbacks.filter((f) => {
            const text =
                f.name.toLowerCase().includes(search.toLowerCase()) ||
                f.email.toLowerCase().includes(search.toLowerCase()) ||
                f.message.toLowerCase().includes(search.toLowerCase());

            const created = new Date(f.timestamp);
            const afterStart = startDate ? created >= new Date(startDate) : true;
            const beforeEnd = endDate ? created <= new Date(endDate) : true;

            return text && afterStart && beforeEnd;
        });
    }, [feedbacks, search, startDate, endDate]);

    /* ---------------- ANALYTICS ---------------- */

    const analytics = useMemo(() => {
        const now = new Date();

        return {
            total: feedbacks.length,
            today: feedbacks.filter(
                (f) =>
                    new Date(f.timestamp).toDateString() === now.toDateString()
            ).length,
            last7: feedbacks.filter(
                (f) => now - new Date(f.timestamp) <= 7 * 86400000
            ).length,
            last30: feedbacks.filter(
                (f) => now - new Date(f.timestamp) <= 30 * 86400000
            ).length,
        };
    }, [feedbacks]);

    /* ---------------- PAGINATION ---------------- */

    const totalPages = Math.ceil(filteredFeedbacks.length / ITEMS_PER_PAGE);

    const paginatedData = filteredFeedbacks.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    /* ---------------- CSV EXPORT ---------------- */

    const exportCSV = () => {
        const headers = ["Name", "Email", "Message", "Date"];

        const rows = filteredFeedbacks.map((f) => [
            `"${f.name}"`,
            `"${f.email}"`,
            `"${f.message.replace(/"/g, '""')}"`,
            `"${new Date(f.timestamp).toLocaleString()}"`
        ]);

        const csv =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

        const link = document.createElement("a");
        link.href = encodeURI(csv);
        link.download = `contact-messages-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    /* ---------------- UI ---------------- */

    return (
        <section className="feedback-page">
            <Helmet>
                <title>Admin Contact Messages | Lucky Impex</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <h1>Contact Messages</h1>

            {/* ANALYTICS */}
            <div className="analytics-grid">
                <div className="card"><h3>Total</h3><p>{analytics.total}</p></div>
                <div className="card"><h3>Today</h3><p>{analytics.today}</p></div>
                <div className="card"><h3>Last 7 Days</h3><p>{analytics.last7}</p></div>
                <div className="card"><h3>Last 30 Days</h3><p>{analytics.last30}</p></div>
            </div>

            {/* FILTERS */}
            <div className="filter-bar">
                <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                <button className="export-btn" onClick={exportCSV}>Export CSV</button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}

            {!loading && paginatedData.length > 0 && (
                <>
                    <div className="feedback-table-container">
                        <table className="feedback-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Message</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map(f => (
                                    <tr key={f._id}>
                                        <td>{f.name}</td>
                                        <td><a href={`mailto:${f.email}`}>{f.email}</a></td>
                                        <td className="message-cell">{f.message}</td>
                                        <td>{new Date(f.timestamp).toLocaleDateString()}</td>
                                        <td>
                                            <button className="delete-btn" onClick={() => handleDelete(f._id)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    <div className="pagination">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
                        <span>{currentPage} / {totalPages}</span>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                    </div>
                </>
            )}
        </section>
    );
};

export default FeedbackList;
