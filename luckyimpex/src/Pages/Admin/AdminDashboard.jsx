import React, { useEffect, useState, useMemo } from "react";
import "./AdminDashboard.css";
import Modal from "../../Components/Modal";

const ITEMS_PER_PAGE = 8;

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [page, setPage] = useState(1);

    const [deleteId, setDeleteId] = useState(null);
    const [editUser, setEditUser] = useState(null);

    const token = localStorage.getItem("authToken");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch(
                    "https://lucky-1-6ma5.onrender.com/api/users/users",
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await res.json();
                setUsers(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [token]);

    /* ---------------- FILTER LOGIC ---------------- */
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchSearch =
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase());

            const matchRole = roleFilter === "all" || u.role === roleFilter;

            const created = new Date(u.created_at);
            const matchDate =
                (!startDate || created >= new Date(startDate)) &&
                (!endDate || created <= new Date(endDate));

            return matchSearch && matchRole && matchDate;
        });
    }, [users, search, roleFilter, startDate, endDate]);

    /* ---------------- PAGINATION ---------------- */
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    /* ---------------- ANALYTICS ---------------- */
    const totalUsers = users.length;
    const adminCount = users.filter((u) => u.role === "admin").length;
    const recentUsers = users.filter(
        (u) => new Date(u.created_at) > new Date(Date.now() - 7 * 86400000)
    ).length;

    /* ---------------- ACTIONS ---------------- */
    const deleteUser = async () => {
        await fetch(
            `https://lucky-1-6ma5.onrender.com/api/users/users/${deleteId}`,
            {
                method: "DELETE",
                Authorization: `Bearer ${token}`
            }
        );
        setUsers((prev) => prev.filter((u) => u._id !== deleteId));
        setDeleteId(null);
    };

    const updateUser = async () => {
        const res = await fetch(
            `https://lucky-1-6ma5.onrender.com/api/users/users/${editUser._id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(editUser),
            }
        );
        const data = await res.json();
        setUsers((prev) =>
            prev.map((u) => (u._id === data._id ? data : u))
        );
        setEditUser(null);
    };

    /* ---------------- CSV EXPORT ---------------- */
    const exportCSV = () => {
        const header = ["Name", "Email", "Role", "Created At"];
        const rows = filteredUsers.map((u) => [
            u.name,
            u.email,
            u.role,
            new Date(u.created_at).toLocaleDateString(),
        ]);

        let csv = [header, ...rows].map((e) => e.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "users.csv";
        a.click();
    };

    if (loading) return <div className="loading">Loading users...</div>;

    return (
        <div className="admin-container">
            <h2>User Management</h2>

            {/* --------- ANALYTICS --------- */}
            <div className="analytics">
                <div>Total Users <span>{totalUsers}</span></div>
                <div>Admins <span>{adminCount}</span></div>
                <div>New (7 days) <span>{recentUsers}</span></div>
            </div>

            {/* --------- FILTERS --------- */}
            <div className="filters">
                <input placeholder="Search..." onChange={(e) => setSearch(e.target.value)} />
                <select onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                </select>
                <input type="date" onChange={(e) => setStartDate(e.target.value)} />
                <input type="date" onChange={(e) => setEndDate(e.target.value)} />
                <button onClick={exportCSV}>Export CSV</button>
            </div>

            {/* --------- TABLE --------- */}
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th><th>Email</th><th>Role</th><th>Created</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.map((u) => (
                            <tr key={u._id}>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td className={`role ${u.role}`}>{u.role}</td>
                                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button onClick={() => setEditUser(u)}>Edit</button>
                                    <button className="danger" onClick={() => setDeleteId(u._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --------- PAGINATION --------- */}
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} className={page === i + 1 ? "active" : ""} onClick={() => setPage(i + 1)}>
                        {i + 1}
                    </button>
                ))}
            </div>

            {/* --------- MODALS --------- */}
            {deleteId && (
                <Modal show onClose={() => setDeleteId(null)}>
                    <h3>Delete this user?</h3>
                    <button className="danger" onClick={deleteUser}>Confirm</button>
                </Modal>
            )}

            {editUser && (
                <Modal show onClose={() => setEditUser(null)}>
                    <h3>Edit User</h3>
                    <input value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} />
                    <input value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
                    <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}>
                        <option>user</option>
                        <option>admin</option>
                    </select>
                    <button onClick={updateUser}>Save</button>
                </Modal>
            )}
        </div>
    );
};

export default AdminDashboard;
