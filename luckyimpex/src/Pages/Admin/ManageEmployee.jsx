import { useEffect, useMemo, useState } from "react";
import {
    FaBriefcase,
    FaCalendarAlt,
    FaFileInvoiceDollar,
    FaMoneyBillWave,
    FaPlus,
    FaSearch,
    FaUserCheck,
    FaUserClock,
    FaUserEdit,
    FaUsers,
} from "react-icons/fa";
import Modal from "../../Components/Modal";
import { hrmsRequest } from "../../api/api";
import "./HRDashboard.css";

const EMPLOYEE_FORM = {
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "employee",
    department: "",
    designation: "",
    status: "active",
    employmentType: "full_time",
    salary: "",
};

const ATTENDANCE_FORM = {
    employeeId: "",
    date: "",
    status: "present",
    checkIn: "",
    checkOut: "",
    notes: "",
};

const LEAVE_FORM = {
    employeeId: "",
    leaveType: "annual",
    startDate: "",
    endDate: "",
    reason: "",
    handoverNotes: "",
};

const PAYROLL_FORM = {
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: "",
    hra: "",
    allowance: "",
    bonus: "",
    deduction: "",
};

const tabs = [
    { key: "employees", label: "Employee Directory" },
    { key: "attendance", label: "Attendance" },
    { key: "leave", label: "Leave" },
    { key: "payroll", label: "Payroll" },
];

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "-");
const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : "-");

export default function ManageEmployee() {
    const token = localStorage.getItem("authToken");

    const [activeTab, setActiveTab] = useState("employees");
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [filters, setFilters] = useState({
        search: "",
        status: "",
        department: "",
    });

    const [employeeForm, setEmployeeForm] = useState(EMPLOYEE_FORM);
    const [editingEmployeeId, setEditingEmployeeId] = useState("");

    const [attendanceForm, setAttendanceForm] = useState(ATTENDANCE_FORM);
    const [leaveForm, setLeaveForm] = useState(LEAVE_FORM);
    const [payrollForm, setPayrollForm] = useState(PAYROLL_FORM);

    const [modalType, setModalType] = useState("");
    const [detailTitle, setDetailTitle] = useState("");
    const [detailRows, setDetailRows] = useState([]);
    const [leavePolicies, setLeavePolicies] = useState([]);

    const summary = useMemo(() => {
        const active = employees.filter((emp) => emp.status === "active").length;
        const onLeave = employees.filter((emp) => emp.status === "on_leave").length;
        const monthlyPaid = employees.reduce(
            (sum, emp) => sum + Number(emp.metrics?.payroll?.totalPaid || 0),
            0
        );
        const present = employees.reduce(
            (sum, emp) => sum + Number(emp.metrics?.attendance?.present || 0),
            0
        );

        return {
            total: pagination.total || employees.length,
            active,
            onLeave,
            present,
            monthlyPaid,
        };
    }, [employees, pagination.total]);

    async function loadEmployees(page = pagination.page || 1) {
        setLoading(true);
        setError("");

        try {
            const query = new URLSearchParams({
                page: String(page),
                limit: "12",
                ...(filters.search ? { search: filters.search } : {}),
                ...(filters.status ? { status: filters.status } : {}),
                ...(filters.department ? { department: filters.department } : {}),
            });

            const data = await hrmsRequest(`/employees/management/overview?${query.toString()}`, { token });
            setEmployees(data.data || []);
            setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
        } catch (requestError) {
            setError(requestError.message || "Failed to load employees.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        async function bootstrapEmployees() {
            setLoading(true);
            setError("");

            try {
                const data = await hrmsRequest("/employees/management/overview?page=1&limit=12", { token });
                setEmployees(data.data || []);
                setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
            } catch (requestError) {
                setError(requestError.message || "Failed to load employees.");
            } finally {
                setLoading(false);
            }
        }

        bootstrapEmployees();
    }, [token]);

    useEffect(() => {
        async function loadPolicies() {
            try {
                const data = await hrmsRequest("/leave/policies", { token });
                setLeavePolicies(data.policies || []);
            } catch (policyError) {
                console.error("Failed to load leave policies", policyError);
            }
        }

        loadPolicies();
    }, [token]);

    function resetMessages() {
        setMessage("");
        setError("");
    }

    function openEmployeeModal(employee = null) {
        resetMessages();
        setEditingEmployeeId(employee?._id || "");
        setEmployeeForm(
            employee
                ? {
                    name: employee.name || "",
                    email: employee.email || "",
                    password: "",
                    phone: employee.phone || "",
                    role: employee.role || "employee",
                    department: employee.department || "",
                    designation: employee.designation || "",
                    status: employee.status || "active",
                    employmentType: employee.employmentType || "full_time",
                    salary: employee.salary || "",
                }
                : EMPLOYEE_FORM
        );
        setModalType("employee");
    }

    async function submitEmployee(event) {
        event.preventDefault();
        setSubmitting(true);
        resetMessages();

        try {
            const payload = {
                ...employeeForm,
                salary: Number(employeeForm.salary || 0),
            };

            if (editingEmployeeId) {
                await hrmsRequest(`/employees/${editingEmployeeId}`, {
                    token,
                    method: "PUT",
                    body: payload,
                });
                setMessage("Employee updated successfully.");
            } else {
                await hrmsRequest("/employees", {
                    token,
                    method: "POST",
                    body: payload,
                });
                setMessage("Employee created successfully.");
            }

            setModalType("");
            setEmployeeForm(EMPLOYEE_FORM);
            setEditingEmployeeId("");
            loadEmployees(pagination.page || 1);
        } catch (submitError) {
            setError(submitError.message || "Unable to save employee.");
        } finally {
            setSubmitting(false);
        }
    }

    async function deleteEmployee(employeeId) {
        if (!window.confirm("Delete this employee record?")) {
            return;
        }

        resetMessages();
        try {
            await hrmsRequest(`/employees/${employeeId}`, {
                token,
                method: "DELETE",
            });
            setMessage("Employee deleted successfully.");
            loadEmployees(pagination.page || 1);
        } catch (deleteError) {
            setError(deleteError.message || "Unable to delete employee.");
        }
    }

    function openAttendanceModal(employeeId) {
        resetMessages();
        setAttendanceForm({
            ...ATTENDANCE_FORM,
            employeeId,
            date: new Date().toISOString().slice(0, 10),
        });
        setModalType("attendance");
    }

    async function submitAttendance(event) {
        event.preventDefault();
        setSubmitting(true);
        resetMessages();

        try {
            await hrmsRequest("/attendance/manual", {
                token,
                method: "POST",
                body: attendanceForm,
            });
            setMessage("Attendance saved successfully.");
            setModalType("");
            setAttendanceForm(ATTENDANCE_FORM);
            loadEmployees(pagination.page || 1);
        } catch (submitError) {
            setError(submitError.message || "Unable to save attendance.");
        } finally {
            setSubmitting(false);
        }
    }

    async function viewAttendance(employee) {
        resetMessages();
        try {
            const data = await hrmsRequest(`/attendance?employeeId=${employee._id}&limit=15`, { token });
            setDetailTitle(`${employee.name} attendance history`);
            setDetailRows(
                (data.data || []).map((row) => ({
                    id: row._id,
                    primary: `${formatDate(row.date)} · ${row.status}`,
                    secondary: `Check in: ${formatDateTime(row.checkIn)} | Check out: ${formatDateTime(row.checkOut)} | Worked: ${row.workMinutes || 0} min`,
                }))
            );
            setModalType("details");
        } catch (detailError) {
            setError(detailError.message || "Unable to load attendance history.");
        }
    }

    function openLeaveModal(employeeId) {
        resetMessages();
        setLeaveForm({
            ...LEAVE_FORM,
            employeeId,
        });
        setModalType("leave");
    }

    async function submitLeave(event) {
        event.preventDefault();
        setSubmitting(true);
        resetMessages();

        try {
            await hrmsRequest("/leave", {
                token,
                method: "POST",
                body: leaveForm,
            });
            setMessage("Leave request created successfully.");
            setModalType("");
            setLeaveForm(LEAVE_FORM);
            loadEmployees(pagination.page || 1);
        } catch (submitError) {
            setError(submitError.message || "Unable to submit leave request.");
        } finally {
            setSubmitting(false);
        }
    }

    async function viewLeaves(employee) {
        resetMessages();
        try {
            const data = await hrmsRequest(`/leave?employeeId=${employee._id}&limit=20`, { token });
            setDetailTitle(`${employee.name} leave history`);
            setDetailRows(
                (data.data || []).map((row) => ({
                    id: row._id,
                    primary: `${row.leaveType} · ${row.status}`,
                    secondary: `${formatDate(row.startDate)} to ${formatDate(row.endDate)} · ${row.totalDays} day(s)`,
                }))
            );
            setModalType("details");
        } catch (detailError) {
            setError(detailError.message || "Unable to load leave history.");
        }
    }

    function openPayrollModal(employee) {
        resetMessages();
        setPayrollForm({
            ...PAYROLL_FORM,
            employeeId: employee._id,
            basicSalary: employee.salary || "",
        });
        setModalType("payroll");
    }

    async function submitPayroll(event) {
        event.preventDefault();
        setSubmitting(true);
        resetMessages();

        try {
            await hrmsRequest("/payroll", {
                token,
                method: "POST",
                body: {
                    employeeId: payrollForm.employeeId,
                    month: Number(payrollForm.month),
                    year: Number(payrollForm.year),
                    basicSalary: Number(payrollForm.basicSalary || 0),
                    hra: Number(payrollForm.hra || 0),
                    allowances: payrollForm.allowance
                        ? [{ label: "Allowance", amount: Number(payrollForm.allowance) }]
                        : [],
                    bonuses: payrollForm.bonus
                        ? [{ label: "Bonus", amount: Number(payrollForm.bonus) }]
                        : [],
                    deductions: payrollForm.deduction
                        ? [{ label: "Deduction", amount: Number(payrollForm.deduction) }]
                        : [],
                },
            });
            setMessage("Payroll generated successfully.");
            setModalType("");
            setPayrollForm(PAYROLL_FORM);
            loadEmployees(pagination.page || 1);
        } catch (submitError) {
            setError(submitError.message || "Unable to generate payroll.");
        } finally {
            setSubmitting(false);
        }
    }

    async function viewPayroll(employee) {
        resetMessages();
        try {
            const data = await hrmsRequest(`/payroll?employeeId=${employee._id}&limit=20`, { token });
            setDetailTitle(`${employee.name} payroll history`);
            setDetailRows(
                (data.data || []).map((row) => ({
                    id: row._id,
                    primary: `${row.payslipNumber} · ${row.status}`,
                    secondary: `${row.month}/${row.year} · Net ${formatCurrency(row.netSalary)} · Gross ${formatCurrency(row.grossSalary)}`,
                }))
            );
            setModalType("details");
        } catch (detailError) {
            setError(detailError.message || "Unable to load payroll history.");
        }
    }

    const pageEmployees = employees;

    return (
        <div className="hr-page">
            <section className="hr-hero">
                <div>
                    <p className="hr-kicker">Employee management</p>
                    <h1>Production-ready HR workspace</h1>
                    <p>
                        Manage employees, attendance, leave, and payroll from one streamlined admin module backed by the HRMS API.
                    </p>
                </div>
                <button className="hr-primary-btn" onClick={() => openEmployeeModal()}>
                    <FaPlus /> Add employee
                </button>
            </section>

            {message ? <div className="hr-message success">{message}</div> : null}
            {error ? <div className="hr-message error">{error}</div> : null}

            <section className="hr-stats-grid">
                <article className="hr-stat-card tone-blue">
                    <FaUsers />
                    <div>
                        <span>Total employees</span>
                        <strong>{summary.total}</strong>
                    </div>
                </article>
                <article className="hr-stat-card tone-green">
                    <FaUserCheck />
                    <div>
                        <span>Active employees</span>
                        <strong>{summary.active}</strong>
                    </div>
                </article>
                <article className="hr-stat-card tone-amber">
                    <FaUserClock />
                    <div>
                        <span>On leave</span>
                        <strong>{summary.onLeave}</strong>
                    </div>
                </article>
                <article className="hr-stat-card tone-violet">
                    <FaMoneyBillWave />
                    <div>
                        <span>Paid payroll</span>
                        <strong>{formatCurrency(summary.monthlyPaid)}</strong>
                    </div>
                </article>
            </section>

            <section className="hr-toolbar">
                <div className="hr-tab-row">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            className={`hr-tab-btn ${activeTab === tab.key ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="hr-filter-grid">
                    <label className="hr-field">
                        <span><FaSearch /> Search</span>
                        <input
                            value={filters.search}
                            onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                            placeholder="Name, email, department"
                        />
                    </label>
                    <label className="hr-field">
                        <span>Status</span>
                        <select
                            value={filters.status}
                            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
                        >
                            <option value="">All</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="on_leave">On leave</option>
                        </select>
                    </label>
                    <label className="hr-field">
                        <span>Department</span>
                        <input
                            value={filters.department}
                            onChange={(event) => setFilters({ ...filters, department: event.target.value })}
                            placeholder="Sales, HR, Support"
                        />
                    </label>
                    <div className="hr-filter-actions">
                        <button className="hr-secondary-btn" onClick={() => loadEmployees(1)}>
                            Apply filters
                        </button>
                    </div>
                </div>
            </section>

            <section className="hr-panel">
                {loading ? (
                    <div className="hr-loading">Loading employee workspace...</div>
                ) : (
                    <>
                        {activeTab === "employees" ? (
                            <div className="hr-table-wrapper">
                                <table className="hr-table">
                                    <thead>
                                        <tr>
                                            <th>Employee</th>
                                            <th>Role</th>
                                            <th>Department</th>
                                            <th>Status</th>
                                            <th>Salary</th>
                                            <th>Attendance</th>
                                            <th>Leaves</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pageEmployees.map((employee) => (
                                            <tr key={employee._id}>
                                                <td>
                                                    <strong>{employee.name}</strong>
                                                    <span>{employee.email}</span>
                                                </td>
                                                <td>{employee.role}</td>
                                                <td>
                                                    {employee.department || "General"}
                                                    <span>{employee.designation || "Employee"}</span>
                                                </td>
                                                <td>
                                                    <span className={`hr-badge ${employee.status}`}>{employee.status}</span>
                                                </td>
                                                <td>{formatCurrency(employee.salary)}</td>
                                                <td>
                                                    {employee.metrics?.attendanceRate || 0}%<span>{employee.metrics?.totalAttendance || 0} records</span>
                                                </td>
                                                <td>
                                                    {employee.metrics?.leave?.pending || 0} pending<span>{employee.metrics?.leave?.approved || 0} approved</span>
                                                </td>
                                                <td>
                                                    <div className="hr-action-row">
                                                        <button className="mini-btn" onClick={() => openEmployeeModal(employee)}>
                                                            <FaUserEdit />
                                                        </button>
                                                        <button className="mini-btn danger" onClick={() => deleteEmployee(employee._id)}>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : null}

                        {activeTab === "attendance" ? (
                            <div className="hr-card-grid">
                                {pageEmployees.map((employee) => (
                                    <article key={employee._id} className="hr-entity-card">
                                        <div className="hr-entity-head">
                                            <div>
                                                <h3>{employee.name}</h3>
                                                <p>{employee.department || "General"} · {employee.designation || "Employee"}</p>
                                            </div>
                                            <FaCalendarAlt />
                                        </div>
                                        <div className="hr-entity-metrics">
                                            <span>Present: {employee.metrics?.attendance?.present || 0}</span>
                                            <span>Absent: {employee.metrics?.attendance?.absent || 0}</span>
                                            <span>Half day: {employee.metrics?.attendance?.half_day || 0}</span>
                                        </div>
                                        <div className="hr-card-actions">
                                            <button className="hr-secondary-btn" onClick={() => openAttendanceModal(employee._id)}>
                                                Record attendance
                                            </button>
                                            <button className="hr-ghost-btn" onClick={() => viewAttendance(employee)}>
                                                View history
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : null}

                        {activeTab === "leave" ? (
                            <div className="hr-card-grid">
                                {pageEmployees.map((employee) => (
                                    <article key={employee._id} className="hr-entity-card">
                                        <div className="hr-entity-head">
                                            <div>
                                                <h3>{employee.name}</h3>
                                                <p>{employee.department || "General"} · {employee.designation || "Employee"}</p>
                                            </div>
                                            <FaBriefcase />
                                        </div>
                                        <div className="hr-entity-metrics">
                                            <span>Pending: {employee.metrics?.leave?.pending || 0}</span>
                                            <span>Approved: {employee.metrics?.leave?.approved || 0}</span>
                                            <span>Total: {employee.metrics?.leave?.total || 0}</span>
                                        </div>
                                        <div className="hr-card-actions">
                                            <button className="hr-secondary-btn" onClick={() => openLeaveModal(employee._id)}>
                                                Add leave request
                                            </button>
                                            <button className="hr-ghost-btn" onClick={() => viewLeaves(employee)}>
                                                View history
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : null}

                        {activeTab === "payroll" ? (
                            <div className="hr-card-grid">
                                {pageEmployees.map((employee) => (
                                    <article key={employee._id} className="hr-entity-card">
                                        <div className="hr-entity-head">
                                            <div>
                                                <h3>{employee.name}</h3>
                                                <p>{employee.department || "General"} · {employee.designation || "Employee"}</p>
                                            </div>
                                            <FaFileInvoiceDollar />
                                        </div>
                                        <div className="hr-entity-metrics">
                                            <span>Base salary: {formatCurrency(employee.salary)}</span>
                                            <span>Paid total: {formatCurrency(employee.metrics?.payroll?.totalPaid || 0)}</span>
                                            <span>Last paid: {formatDate(employee.metrics?.payroll?.lastPaidAt)}</span>
                                        </div>
                                        <div className="hr-card-actions">
                                            <button className="hr-secondary-btn" onClick={() => openPayrollModal(employee)}>
                                                Generate payroll
                                            </button>
                                            <button className="hr-ghost-btn" onClick={() => viewPayroll(employee)}>
                                                View payroll
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : null}
                    </>
                )}
            </section>

            <div className="hr-pagination">
                <button
                    className="hr-ghost-btn"
                    disabled={pagination.page <= 1}
                    onClick={() => loadEmployees(Math.max(1, pagination.page - 1))}
                >
                    Previous
                </button>
                <span>
                    Page {pagination.page || 1} of {pagination.totalPages || 1}
                </span>
                <button
                    className="hr-ghost-btn"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => loadEmployees(Math.min(pagination.totalPages, pagination.page + 1))}
                >
                    Next
                </button>
            </div>

            <Modal show={modalType === "employee"} onClose={() => setModalType("")}>
                <div className="hr-modal-body">
                    <h2>{editingEmployeeId ? "Update employee" : "Create employee"}</h2>
                    <form className="hr-modal-form" onSubmit={submitEmployee}>
                        <input value={employeeForm.name} onChange={(event) => setEmployeeForm({ ...employeeForm, name: event.target.value })} placeholder="Full name" required />
                        <input value={employeeForm.email} onChange={(event) => setEmployeeForm({ ...employeeForm, email: event.target.value })} type="email" placeholder="Email" required />
                        <input value={employeeForm.password} onChange={(event) => setEmployeeForm({ ...employeeForm, password: event.target.value })} type="password" placeholder={editingEmployeeId ? "New password (optional)" : "Temporary password"} />
                        <input value={employeeForm.phone} onChange={(event) => setEmployeeForm({ ...employeeForm, phone: event.target.value })} placeholder="Phone" />
                        <select value={employeeForm.role} onChange={(event) => setEmployeeForm({ ...employeeForm, role: event.target.value })}>
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                        <select value={employeeForm.status} onChange={(event) => setEmployeeForm({ ...employeeForm, status: event.target.value })}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="on_leave">On leave</option>
                        </select>
                        <input value={employeeForm.department} onChange={(event) => setEmployeeForm({ ...employeeForm, department: event.target.value })} placeholder="Department" />
                        <input value={employeeForm.designation} onChange={(event) => setEmployeeForm({ ...employeeForm, designation: event.target.value })} placeholder="Designation" />
                        <select value={employeeForm.employmentType} onChange={(event) => setEmployeeForm({ ...employeeForm, employmentType: event.target.value })}>
                            <option value="full_time">Full-time</option>
                            <option value="part_time">Part-time</option>
                            <option value="contract">Contract</option>
                            <option value="intern">Intern</option>
                        </select>
                        <input value={employeeForm.salary} onChange={(event) => setEmployeeForm({ ...employeeForm, salary: event.target.value })} type="number" min="0" placeholder="Salary" />
                        <button className="hr-primary-btn" disabled={submitting} type="submit">
                            {submitting ? "Saving..." : editingEmployeeId ? "Update employee" : "Create employee"}
                        </button>
                    </form>
                </div>
            </Modal>

            <Modal show={modalType === "attendance"} onClose={() => setModalType("")}>
                <div className="hr-modal-body">
                    <h2>Record attendance</h2>
                    <form className="hr-modal-form" onSubmit={submitAttendance}>
                        <input type="date" value={attendanceForm.date} onChange={(event) => setAttendanceForm({ ...attendanceForm, date: event.target.value })} required />
                        <select value={attendanceForm.status} onChange={(event) => setAttendanceForm({ ...attendanceForm, status: event.target.value })}>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="half_day">Half day</option>
                            <option value="leave">Leave</option>
                        </select>
                        <input type="datetime-local" value={attendanceForm.checkIn} onChange={(event) => setAttendanceForm({ ...attendanceForm, checkIn: event.target.value })} />
                        <input type="datetime-local" value={attendanceForm.checkOut} onChange={(event) => setAttendanceForm({ ...attendanceForm, checkOut: event.target.value })} />
                        <textarea value={attendanceForm.notes} onChange={(event) => setAttendanceForm({ ...attendanceForm, notes: event.target.value })} placeholder="Notes" rows="3" />
                        <button className="hr-primary-btn" disabled={submitting} type="submit">
                            {submitting ? "Saving..." : "Save attendance"}
                        </button>
                    </form>
                </div>
            </Modal>

            <Modal show={modalType === "leave"} onClose={() => setModalType("")}>
                <div className="hr-modal-body">
                    <h2>Create leave request</h2>
                    <form className="hr-modal-form" onSubmit={submitLeave}>
                        <select value={leaveForm.leaveType} onChange={(event) => setLeaveForm({ ...leaveForm, leaveType: event.target.value })}>
                            {(leavePolicies.length ? leavePolicies : [{ leaveType: "annual" }, { leaveType: "sick" }, { leaveType: "casual" }, { leaveType: "unpaid" }]).map((policy) => (
                                <option key={policy.leaveType} value={policy.leaveType}>
                                    {policy.leaveType}
                                </option>
                            ))}
                        </select>
                        <input type="date" value={leaveForm.startDate} onChange={(event) => setLeaveForm({ ...leaveForm, startDate: event.target.value })} required />
                        <input type="date" value={leaveForm.endDate} onChange={(event) => setLeaveForm({ ...leaveForm, endDate: event.target.value })} required />
                        <input value={leaveForm.reason} onChange={(event) => setLeaveForm({ ...leaveForm, reason: event.target.value })} placeholder="Reason" required />
                        <textarea value={leaveForm.handoverNotes} onChange={(event) => setLeaveForm({ ...leaveForm, handoverNotes: event.target.value })} placeholder="Handover notes" rows="3" />
                        <button className="hr-primary-btn" disabled={submitting} type="submit">
                            {submitting ? "Saving..." : "Submit leave"}
                        </button>
                    </form>
                </div>
            </Modal>

            <Modal show={modalType === "payroll"} onClose={() => setModalType("")}>
                <div className="hr-modal-body">
                    <h2>Generate payroll</h2>
                    <form className="hr-modal-form" onSubmit={submitPayroll}>
                        <div className="hr-inline-grid">
                            <input type="number" min="1" max="12" value={payrollForm.month} onChange={(event) => setPayrollForm({ ...payrollForm, month: event.target.value })} placeholder="Month" />
                            <input type="number" value={payrollForm.year} onChange={(event) => setPayrollForm({ ...payrollForm, year: event.target.value })} placeholder="Year" />
                        </div>
                        <input type="number" min="0" value={payrollForm.basicSalary} onChange={(event) => setPayrollForm({ ...payrollForm, basicSalary: event.target.value })} placeholder="Basic salary" />
                        <input type="number" min="0" value={payrollForm.hra} onChange={(event) => setPayrollForm({ ...payrollForm, hra: event.target.value })} placeholder="HRA" />
                        <input type="number" min="0" value={payrollForm.allowance} onChange={(event) => setPayrollForm({ ...payrollForm, allowance: event.target.value })} placeholder="Allowance" />
                        <input type="number" min="0" value={payrollForm.bonus} onChange={(event) => setPayrollForm({ ...payrollForm, bonus: event.target.value })} placeholder="Bonus" />
                        <input type="number" min="0" value={payrollForm.deduction} onChange={(event) => setPayrollForm({ ...payrollForm, deduction: event.target.value })} placeholder="Deduction" />
                        <button className="hr-primary-btn" disabled={submitting} type="submit">
                            {submitting ? "Saving..." : "Generate payroll"}
                        </button>
                    </form>
                </div>
            </Modal>

            <Modal show={modalType === "details"} onClose={() => setModalType("")}>
                <div className="hr-modal-body">
                    <h2>{detailTitle}</h2>
                    <div className="hr-detail-list">
                        {detailRows.length ? (
                            detailRows.map((row) => (
                                <div key={row.id} className="hr-detail-item">
                                    <strong>{row.primary}</strong>
                                    <p>{row.secondary}</p>
                                </div>
                            ))
                        ) : (
                            <p className="hr-empty-copy">No records found.</p>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
