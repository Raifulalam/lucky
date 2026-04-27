import React, { useEffect, useMemo, useState } from "react";
import "./AdminDashboard.css";
import Modal from "../../Components/Modal";

const ITEMS_PER_PAGE = 8;

const getCreatedDate = (user) => new Date(user.createdAt || user.created_at || user.timestamp || Date.now());

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
                const res = await fetch("https://lucky-1-6ma5.onrender.com/api/users/users", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setUsers(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [token]);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchSearch =
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase());

            const matchRole = roleFilter === "all" || user.role === roleFilter;

            const created = getCreatedDate(user);
            const matchDate =
                (!startDate || created >= new Date(startDate)) &&
                (!endDate || created <= new Date(endDate));

            return matchSearch && matchRole && matchDate;
        });
    }, [users, search, roleFilter, startDate, endDate]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const totalUsers = users.length;
    const adminCount = users.filter((user) => user.role === "admin").length;
    const recentUsers = users.filter((user) => getCreatedDate(user) > new Date(Date.now() - 7 * 86400000)).length;

    const deleteUser = async () => {
        await fetch(`https://lucky-1-6ma5.onrender.com/api/users/users/${deleteId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        setUsers((prev) => prev.filter((user) => user._id !== deleteId));
        setDeleteId(null);
    };

    const updateUser = async () => {
        const res = await fetch(`https://lucky-1-6ma5.onrender.com/api/users/users/${editUser._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(editUser),
        });
        const data = await res.json();
        setUsers((prev) => prev.map((user) => (user._id === data._id ? data : user)));
        setEditUser(null);
    };

    const exportCSV = () => {
        const header = ["Name", "Email", "Role", "Created At"];
        const rows = filteredUsers.map((user) => [
            user.name,
            user.email,
            user.role,
            getCreatedDate(user).toLocaleDateString(),
        ]);

        const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "users.csv";
        link.click();
    };

    if (loading) return <div className="loading">Loading users...</div>;

    return (
        <div className="admin-container">
            <h2>User Management</h2>

            <div className="analytics">
                <div>Total Users <span>{totalUsers}</span></div>
                <div>Admins <span>{adminCount}</span></div>
                <div>New (7 days) <span>{recentUsers}</span></div>
            </div>

            <div className="filters">
                <input placeholder="Search..." onChange={(event) => setSearch(event.target.value)} />
                <select onChange={(event) => setRoleFilter(event.target.value)}>
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                </select>
                <input type="date" onChange={(event) => setStartDate(event.target.value)} />
                <input type="date" onChange={(event) => setEndDate(event.target.value)} />
                <button onClick={exportCSV}>Export CSV</button>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.map((user) => (
                            <tr key={user._id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td className={`role ${user.role}`}>{user.role}</td>
                                <td>{getCreatedDate(user).toLocaleDateString()}</td>
                                <td>
                                    <button onClick={() => setEditUser(user)}>Edit</button>
                                    <button className="danger" onClick={() => setDeleteId(user._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button key={index} className={page === index + 1 ? "active" : ""} onClick={() => setPage(index + 1)}>
                        {index + 1}
                    </button>
                ))}
            </div>

            {deleteId && (
                <Modal show onClose={() => setDeleteId(null)}>
                    <h3>Delete this user?</h3>
                    <button className="danger" onClick={deleteUser}>Confirm</button>
                </Modal>
            )}

            {editUser && (
                <Modal show onClose={() => setEditUser(null)}>
                    <h3>Edit User</h3>
                    <input value={editUser.name} onChange={(event) => setEditUser({ ...editUser, name: event.target.value })} />
                    <input value={editUser.email} onChange={(event) => setEditUser({ ...editUser, email: event.target.value })} />
                    <select value={editUser.role} onChange={(event) => setEditUser({ ...editUser, role: event.target.value })}>
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
