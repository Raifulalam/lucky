import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    FaSearch,
    FaUser,
    FaUserShield,
    FaUserPlus,
    FaEdit,
    FaTrash,
    FaDownload,
    FaFilter,
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaUsers,
    FaCalendarAlt,
} from "react-icons/fa";

import "./AdminDashboard.css";
import Modal from "../../Components/Modal";
import { BASE_URL } from "../../api/api";

const ITEMS_PER_PAGE = 8;

const getCreatedDate = (user) =>
    new Date(
        user.createdAt ||
        user.created_at ||
        user.timestamp ||
        Date.now()
    );

const getInitials = (name = "") => {
    return (
        name
            .trim()
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word.charAt(0).toUpperCase())
            .join("") || "U"
    );
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [page, setPage] = useState(1);

    const [deleteId, setDeleteId] = useState(null);
    const [editUser, setEditUser] = useState(null);

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const token = localStorage.getItem("authToken");

    /* =========================================================
       FETCH USERS
    ========================================================= */

const fetchUsers = useCallback(async () => {
    try {
        setLoading(true);
        setError("");

        const res = await fetch(`${BASE_URL}/users/users`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error("Failed to fetch users");
        }

        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
        console.error("Fetch users error:", err);
        setError(err.message || "Unable to load users.");
    } finally {
        setLoading(false);
    }
}, [BASE_URL, token]); // Add external dependencies here


    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    /* =========================================================
       FILTER USERS
    ========================================================= */

    const filteredUsers = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return users.filter((user) => {
            const name = user.name || "";
            const email = user.email || "";
            const role = user.role || "";

            const matchesSearch =
                !searchValue ||
                name.toLowerCase().includes(searchValue) ||
                email.toLowerCase().includes(searchValue);

            const matchesRole =
                roleFilter === "all" || role === roleFilter;

            const created = getCreatedDate(user);

            const matchesStartDate =
                !startDate ||
                created >= new Date(`${startDate}T00:00:00`);

            const matchesEndDate =
                !endDate ||
                created <= new Date(`${endDate}T23:59:59`);

            return (
                matchesSearch &&
                matchesRole &&
                matchesStartDate &&
                matchesEndDate
            );
        });
    }, [users, search, roleFilter, startDate, endDate]);

    /* =========================================================
       PAGINATION
    ========================================================= */

    const totalPages = Math.max(
        1,
        Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
    );

    const paginatedUsers = filteredUsers.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    useEffect(() => {
        setPage(1);
    }, [search, roleFilter, startDate, endDate]);

    /* =========================================================
       STATISTICS
    ========================================================= */

    const totalUsers = users.length;

    const adminCount = users.filter(
        (user) => user.role === "admin"
    ).length;

    const customerCount = users.filter(
        (user) => user.role !== "admin"
    ).length;

    const recentUsers = users.filter(
        (user) =>
            getCreatedDate(user) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    /* =========================================================
       CLEAR FILTERS
    ========================================================= */

    const clearFilters = () => {
        setSearch("");
        setRoleFilter("all");
        setStartDate("");
        setEndDate("");
        setPage(1);
    };

    const hasFilters =
        search ||
        roleFilter !== "all" ||
        startDate ||
        endDate;

    /* =========================================================
       DELETE USER
    ========================================================= */

    const deleteUser = async () => {
        if (!deleteId) return;

        try {
            setDeleting(true);

            const res = await fetch(
                `${BASE_URL}/users/users/${deleteId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error("Failed to delete user");
            }

            setUsers((prev) =>
                prev.filter((user) => user._id !== deleteId)
            );

            setDeleteId(null);
        } catch (err) {
            console.error("Delete user error:", err);
            alert(err.message || "Unable to delete user.");
        } finally {
            setDeleting(false);
        }
    };

    /* =========================================================
       UPDATE USER
    ========================================================= */

    const updateUser = async () => {
        if (!editUser?._id) return;

        try {
            setSaving(true);

            const res = await fetch(
                `${BASE_URL}/users/users/${editUser._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: editUser.name,
                        email: editUser.email,
                        role: editUser.role,
                    }),
                }
            );

            if (!res.ok) {
                throw new Error("Failed to update user");
            }

            const data = await res.json();

            setUsers((prev) =>
                prev.map((user) =>
                    user._id === data._id ? data : user
                )
            );

            setEditUser(null);
        } catch (err) {
            console.error("Update user error:", err);
            alert(err.message || "Unable to update user.");
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================
       EXPORT CSV
    ========================================================= */

    const exportCSV = () => {
        if (!filteredUsers.length) return;

        const header = [
            "Name",
            "Email",
            "Role",
            "Created At",
        ];

        const escapeCSV = (value) => {
            const stringValue = String(value ?? "");

            return `"${stringValue.replace(/"/g, '""')}"`;
        };

        const rows = filteredUsers.map((user) => [
            escapeCSV(user.name),
            escapeCSV(user.email),
            escapeCSV(user.role),
            escapeCSV(formatDate(getCreatedDate(user))),
        ]);

        const csv = [
            header.map(escapeCSV).join(","),
            ...rows.map((row) => row.join(",")),
        ].join("\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = "lucky-impex-users.csv";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
    };

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="admin-users-page">
                <div className="users-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading users...</p>
                </div>
            </div>
        );
    }

    /* =========================================================
       ERROR
    ========================================================= */

    if (error) {
        return (
            <div className="admin-users-page">
                <div className="users-error">
                    <h3>Unable to load users</h3>
                    <p>{error}</p>

                    <button onClick={fetchUsers}>
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    /* =========================================================
       UI
    ========================================================= */

    return (
        <div className="admin-users-page">

            {/* =====================================================
                PAGE HEADER
            ===================================================== */}

            <div className="users-page-header">

                <div>
                    <div className="page-breadcrumb">
                        Admin / Users
                    </div>

                    <h1>User Management</h1>

                    <p>
                        Manage customer accounts, administrators,
                        and account access.
                    </p>
                </div>

                <div className="header-actions">

                    <button
                        className="secondary-btn"
                        onClick={exportCSV}
                        disabled={!filteredUsers.length}
                    >
                        <FaDownload />
                        Export CSV
                    </button>

                    <button
                        className="primary-btn"
                        onClick={fetchUsers}
                    >
                        <FaUsers />
                        Refresh
                    </button>

                </div>

            </div>

            {/* =====================================================
                STAT CARDS
            ===================================================== */}

            <div className="user-stat-grid">

                <div className="user-stat-card">

                    <div className="stat-card-icon blue">
                        <FaUsers />
                    </div>

                    <div>
                        <span>Total users</span>
                        <strong>{totalUsers}</strong>
                    </div>

                </div>

                <div className="user-stat-card">

                    <div className="stat-card-icon purple">
                        <FaUserShield />
                    </div>

                    <div>
                        <span>Administrators</span>
                        <strong>{adminCount}</strong>
                    </div>

                </div>

                <div className="user-stat-card">

                    <div className="stat-card-icon green">
                        <FaUser />
                    </div>

                    <div>
                        <span>Customers</span>
                        <strong>{customerCount}</strong>
                    </div>

                </div>

                <div className="user-stat-card">

                    <div className="stat-card-icon orange">
                        <FaUserPlus />
                    </div>

                    <div>
                        <span>New this week</span>
                        <strong>{recentUsers}</strong>
                    </div>

                </div>

            </div>

            {/* =====================================================
                USERS CARD
            ===================================================== */}

            <section className="users-card">

                {/* Toolbar */}

                <div className="users-toolbar">

                    <div className="toolbar-title">

                        <h2>All users</h2>

                        <span>
                            {filteredUsers.length}{" "}
                            {filteredUsers.length === 1
                                ? "user"
                                : "users"}
                        </span>

                    </div>

                    <div className="toolbar-actions">

                        {/* Search */}

                        <div className="user-search">

                            <FaSearch />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search name or email..."
                            />

                            {search && (
                                <button
                                    className="search-clear"
                                    onClick={() =>
                                        setSearch("")
                                    }
                                >
                                    <FaTimes />
                                </button>
                            )}

                        </div>

                        {/* Role */}

                        <div className="filter-control">

                            <FaFilter />

                            <select
                                value={roleFilter}
                                onChange={(e) =>
                                    setRoleFilter(e.target.value)
                                }
                            >
                                <option value="all">
                                    All roles
                                </option>

                                <option value="admin">
                                    Admin
                                </option>

                                <option value="user">
                                    Customer
                                </option>
                            </select>

                        </div>

                    </div>

                </div>

                {/* Date filters */}

                <div className="advanced-filters">

                    <div className="date-filter">

                        <FaCalendarAlt />

                        <label>
                            From
                        </label>

                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) =>
                                setStartDate(e.target.value)
                            }
                        />

                    </div>

                    <div className="date-filter">

                        <FaCalendarAlt />

                        <label>
                            To
                        </label>

                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) =>
                                setEndDate(e.target.value)
                            }
                        />

                    </div>

                    {hasFilters && (
                        <button
                            className="clear-filter-btn"
                            onClick={clearFilters}
                        >
                            <FaTimes />
                            Clear filters
                        </button>
                    )}

                </div>

                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="users-table-wrapper">

                    <table className="users-table">

                        <thead>

                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th className="actions-column">
                                    Actions
                                </th>
                            </tr>

                        </thead>

                        <tbody>

                            {paginatedUsers.length > 0 ? (

                                paginatedUsers.map((user) => (

                                    <tr key={user._id}>

                                        {/* USER */}

                                        <td>

                                            <div className="user-profile">

                                                <div className="user-avatar">
                                                    {getInitials(
                                                        user.name
                                                    )}
                                                </div>

                                                <div className="user-name">

                                                    <strong>
                                                        {user.name ||
                                                            "Unnamed User"}
                                                    </strong>

                                                    <span>
                                                        ID:{" "}
                                                        {user._id
                                                            ?.slice(-8) ||
                                                            "N/A"}
                                                    </span>

                                                </div>

                                            </div>

                                        </td>

                                        {/* EMAIL */}

                                        <td>

                                            <span className="user-email">
                                                {user.email || "—"}
                                            </span>

                                        </td>

                                        {/* ROLE */}

                                        <td>

                                            <span
                                                className={`role-badge ${
                                                    user.role ===
                                                    "admin"
                                                        ? "role-admin"
                                                        : "role-user"
                                                }`}
                                            >

                                                {user.role ===
                                                "admin" ? (
                                                    <>
                                                        <FaUserShield />
                                                        Admin
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaUser />
                                                        Customer
                                                    </>
                                                )}

                                            </span>

                                        </td>

                                        {/* DATE */}

                                        <td>

                                            <span className="joined-date">
                                                {formatDate(
                                                    getCreatedDate(
                                                        user
                                                    )
                                                )}
                                            </span>

                                        </td>

                                        {/* ACTIONS */}

                                        <td>

                                            <div className="user-actions">

                                                <button
                                                    className="icon-btn edit"
                                                    title="Edit user"
                                                    onClick={() =>
                                                        setEditUser({
                                                            ...user,
                                                        })
                                                    }
                                                >
                                                    <FaEdit />
                                                </button>

                                                <button
                                                    className="icon-btn delete"
                                                    title="Delete user"
                                                    onClick={() =>
                                                        setDeleteId(
                                                            user._id
                                                        )
                                                    }
                                                >
                                                    <FaTrash />
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td
                                        colSpan="5"
                                        className="empty-table"
                                    >

                                        <div className="empty-state">

                                            <div className="empty-icon">
                                                <FaUsers />
                                            </div>

                                            <h3>
                                                No users found
                                            </h3>

                                            <p>
                                                Try changing your
                                                search or filters.
                                            </p>

                                            {hasFilters && (
                                                <button
                                                    onClick={
                                                        clearFilters
                                                    }
                                                >
                                                    Clear filters
                                                </button>
                                            )}

                                        </div>

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

                {/* =================================================
                    PAGINATION
                ================================================= */}

                {filteredUsers.length > 0 && (

                    <div className="users-pagination">

                        <div className="pagination-info">

                            Showing{" "}

                            <strong>
                                {(page - 1) *
                                    ITEMS_PER_PAGE +
                                    1}
                            </strong>

                            {" "}–{" "}

                            <strong>
                                {Math.min(
                                    page *
                                        ITEMS_PER_PAGE,
                                    filteredUsers.length
                                )}
                            </strong>

                            {" "}of{" "}

                            <strong>
                                {filteredUsers.length}
                            </strong>

                        </div>

                        <div className="pagination-controls">

                            <button
                                disabled={page === 1}
                                onClick={() =>
                                    setPage(
                                        (prev) =>
                                            Math.max(
                                                1,
                                                prev - 1
                                            )
                                    )
                                }
                            >
                                <FaChevronLeft />
                            </button>

                            {Array.from(
                                {
                                    length: totalPages,
                                },
                                (_, index) => index + 1
                            )
                                .slice(
                                    Math.max(0, page - 3),
                                    Math.min(
                                        totalPages,
                                        page + 2
                                    )
                                )
                                .map((pageNumber) => (

                                    <button
                                        key={pageNumber}
                                        className={
                                            page ===
                                            pageNumber
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setPage(
                                                pageNumber
                                            )
                                        }
                                    >
                                        {pageNumber}
                                    </button>

                                ))}

                            <button
                                disabled={
                                    page === totalPages
                                }
                                onClick={() =>
                                    setPage(
                                        (prev) =>
                                            Math.min(
                                                totalPages,
                                                prev + 1
                                            )
                                    )
                                }
                            >
                                <FaChevronRight />
                            </button>

                        </div>

                    </div>

                )}

            </section>

            {/* =====================================================
                DELETE MODAL
            ===================================================== */}

            {deleteId && (

               <Modal
    show={!!deleteId}
    onClose={() => setDeleteId(null)}
    title="Delete user"
    size="small"
>
    <div className="delete-confirmation">
        <div className="delete-icon">
            ⚠
        </div>

        <h3>Delete this user?</h3>

        <p>
            This action cannot be undone. The user's account and
            associated information will be permanently removed.
            {deleting}
        </p>

        <div className="modal-actions">
            <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleteId(null)}
                
            >
                Cancel
            </button>

            <button
                type="button"
                className="btn-danger"
                onClick={deleteUser}

            >
                Delete user
            </button>
        </div>
    </div>
</Modal>

            )}

            {/* =====================================================
                EDIT USER MODAL
            ===================================================== */}

            {editUser && (

               <Modal
    show={!!editUser}
    onClose={() => setEditUser(null)}
    title="Edit user"
    size="medium"
>
    <div className="user-form">
        <div className="form-group">
            <label>Name</label>

            <input
                type="text"
                value={editUser?.name || ""}
                onChange={(e) =>
                    setEditUser({
                        ...editUser,
                        name: e.target.value,
                    })
                }
            />
                    </div>

        <div className="form-group">
            <label>Email</label>

            <input
                type="email"
                value={editUser?.email || ""}
                onChange={(e) =>
                    setEditUser({
                        ...editUser,
                        email: e.target.value,
                    })
                }
            />
        </div>

        <div className="form-group">
            <label>Role</label>

            <select
                value={editUser?.role || "user"}
                onChange={(e) =>
                    setEditUser({
                        ...editUser,
                        role: e.target.value,
                    })
                }
            >
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>
        </div>

        <div className="modal-actions">
            <button
                type="button"
                className="btn-secondary"
                onClick={() => setEditUser(null)}
                    >
                Cancel
            </button>

            <button
                type="button"
                className="btn-primary"
                onClick={updateUser}
            >
                Save changes?{saving}
            </button>
        </div>
    </div>
</Modal>

            )}

        </div>
    );
};

export default AdminDashboard;