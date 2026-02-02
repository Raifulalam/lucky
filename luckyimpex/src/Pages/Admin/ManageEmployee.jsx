import { useState, useEffect, useCallback, useMemo } from "react";
import Modal from "../../Components/Modal";
import "./HRDashboard.css";
import ActionButton from "./ActionButtons";

export default function HRDashboard() {
    const [activeTab, setActiveTab] = useState("employees");
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [attendance, setAttendance] = useState([]);
    const [showAttendance, setShowAttendance] = useState(false);
    const [todayAttendance, setTodayAttendance] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const [formData, setFormData] = useState({
        _id: null,
        name: "",
        email: "",
        password: "",
        phone: "",
        department: "",
        designation: "",
        salary: "",
    });

    const token = localStorage.getItem("authToken");
    const headers = useMemo(
        () => ({
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        }),
        [token]
    );

    // ------------------ Fetch Employees ------------------
    const fetchEmployees = useCallback(async () => {
        try {
            const res = await fetch(
                "https://lucky-1-6ma5.onrender.com/api/employees/admin-employeeStats",
                { headers }
            );
            const data = await res.json();
            if (data.success) setEmployees(data.employees);
        } catch (err) {
            console.error("Error fetching employees", err);
        }
    }, [headers]); // ✅ FIX HERE

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);


    // ------------------ Form Handlers ------------------
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const resetForm = () => setFormData({ _id: null, name: "", email: "", password: "", phone: "", department: "", designation: "", salary: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = isEdit
                ? `https://lucky-1-6ma5.onrender.com/api/employees/employee/${formData.empId}`
                : "/employees/create-employee";
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(url, { method, headers, body: JSON.stringify(formData) });
            const data = await res.json();
            if (data.success) {
                fetchEmployees();
                setIsModalOpen(false);
                resetForm();
            } else alert(data.message);
        } catch (err) {
            console.error("Error saving employee", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this employee?")) return;
        try {
            const res = await fetch(`https://lucky-back.onrender.com/api/employee/${id}`, { method: "DELETE", headers });
            const data = await res.json();
            if (data.success) fetchEmployees();
        } catch (err) {
            console.error("Error deleting employee", err);
        }
    };

    const handleEdit = (emp) => { setIsEdit(true); setFormData(emp); setIsModalOpen(true); };
    const handleAdd = () => { setIsEdit(false); resetForm(); setIsModalOpen(true); };

    // ------------------ Attendance ------------------
    const fetchAttendance = async (employeeId) => {
        try {
            const res = await fetch(`https://lucky-back.onrender.com/api/attendance/${employeeId}`, { headers });
            const data = await res.json();
            if (data.success) { setAttendance(data.records); setShowAttendance(true); }
            else alert("No attendance found");
        } catch (err) { console.error("Error fetching attendance", err); }
    };

    const markAttendance = async (employeeId, status) => {
        if (todayAttendance[employeeId]) { alert("Attendance already marked!"); return; }
        try {
            const res = await fetch("https://lucky-back.onrender.com/api/attendance", { method: "POST", headers, body: JSON.stringify({ employeeId, status }) });
            const data = await res.json();
            if (data.success) setTodayAttendance(prev => ({ ...prev, [employeeId]: status }));
            else alert(data.message || "Failed to mark attendance");
        } catch (err) { console.error(err); }
    };

    // ------------------ Leave ------------------
    const applyLeave = async (employeeId, startDate = "2025-09-20", endDate = "2025-09-25") => {
        try {
            const res = await fetch("https://lucky-back.onrender.com/api/leave", {
                method: "POST", headers, body: JSON.stringify({ employeeId, startDate, endDate, type: "Sick", reason: "Fever" })
            });
            const data = await res.json();
            alert(data.message || "Leave applied");
        } catch (err) { console.error(err); }
    };

    const fetchLeaves = async (employeeId) => {
        try {
            const res = await fetch(`https://lucky-back.onrender.com/api/leave/${employeeId}`, { headers });
            const data = await res.json();
            console.log(data);
        } catch (err) { console.error(err); }
    };

    // ------------------ Salary ------------------
    const generateSalary = async (employeeId) => {
        try {
            const res = await fetch("https://lucky-back.onrender.com/api/salary", {
                method: "POST", headers, body: JSON.stringify({ employeeId, month: "September", year: 2025, baseSalary: 50000, bonuses: 5000, deductions: 2000 })
            });
            const data = await res.json();
            alert(data.message || "Salary generated");
        } catch (err) { console.error(err); }
    };

    const fetchSalary = async (employeeId) => {
        try {
            const res = await fetch(`https://lucky-back.onrender.com/api/salary/${employeeId}`, { headers });
            const data = await res.json();
            console.log(data);
        } catch (err) { console.error(err); }
    };

    // ------------------ Render ------------------
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">HR Management Dashboard</h1>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6">
                {["employees", "attendance", "leave", "salary"].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded ${activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === "employees" && (
                <div>
                    <button onClick={handleAdd} className="mb-4 bg-blue-600 text-white px-4 py-2 rounded">➕ Add Employee</button>
                    {employees.length > 0 ? (
                        <table className="min-w-full border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2">#</th>
                                    <th className="px-4 py-2">EMP ID</th>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2">Dept</th>
                                    <th className="px-4 py-2">Designation</th>
                                    <th className="px-4 py-2">Salary</th>
                                    <th className="px-4 py-2">Attendance %</th>

                                    <th className="px-4 py-2">Effective Days</th>
                                    <th className="px-4 py-2">Joined Date</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp, i) => (
                                    <tr key={emp.empId} className="border-t">
                                        <td className="px-4 py-2">{i + 1}</td>
                                        <td className="px-4 py-2">{emp.empId}</td>
                                        <td className="px-4 py-2">{emp.name}</td>
                                        <td className="px-4 py-2">{emp.email}</td>
                                        <td className="px-4 py-2">{emp.department}</td>
                                        <td className="px-4 py-2">{emp.designation}</td>
                                        <td className="px-4 py-2">₹{emp.salary}</td>
                                        <td className="px-4 py-2">
                                            ({emp.totalPresent}/{emp.totalAbsent}){emp.totalAttendance > 0 ? ((emp.totalPresent / emp.totalAttendance) * 100).toFixed(2) : 0}%
                                        </td>
                                        <td className="px-4 py-2">{emp.effectiveDays}</td>
                                        <td className="px-4 py-2">{new Date(emp.joinedDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-2 space-x-2">
                                            <button
                                                onClick={() => handleEdit(emp)}
                                                className="bg-yellow-500 text-white px-2 py-1 rounded"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(emp.empId)}
                                                className="bg-red-600 text-white px-2 py-1 rounded"
                                            >
                                                🗑
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    ) : <p>No employees found.</p>}
                </div>
            )}

            {activeTab === "attendance" && (
                <div className="card-container">
                    {employees.map((emp) => {
                        // Calculate percentage


                        return (
                            <div key={emp._id} className="card">
                                <h3>{emp.name}</h3>
                                <div className="card-actions">
                                    <p>TotalDays:{emp.totalDays}</p>
                                    <p>Present:{emp.totalPresent}</p>
                                    <p>Absent:{emp.totalAbsent}</p>
                                    <p>Attendance:{emp.totalAttendance}</p>
                                </div>
                                <div className="card-actions">
                                    <ActionButton
                                        label="✅ Present"
                                        color="green"
                                        disabled={todayAttendance[emp.empId]}
                                        onClick={() => markAttendance(emp.empId, "Present")}
                                    />
                                    <ActionButton
                                        label="❌ Absent"
                                        color="red"
                                        disabled={todayAttendance[emp.empId]}
                                        onClick={() => markAttendance(emp.empId, "Absent")}
                                    />
                                    <ActionButton
                                        label="📅 View"
                                        color="gray"
                                        onClick={() => fetchAttendance(emp.empId)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}



            {activeTab === "leave" && (
                <div className="card-container">
                    {employees.map((emp) => (
                        <div key={emp._id} className="card">
                            <h3>{emp.name}</h3>

                            <div className="card-actions">
                                <ActionButton label="📝 Apply" color="blue" onClick={() => applyLeave(emp._id)} />
                                <ActionButton label="📂 View" color="gray" onClick={() => fetchLeaves(emp._id)} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "salary" && (
                <div className="card-container">
                    {employees.map((emp) => (
                        <div key={emp._id} className="card">
                            <h3>{emp.name}</h3>
                            <div className="card-actions">
                                <ActionButton label="💰 Generate" color="green" onClick={() => generateSalary(emp._id)} />
                                <ActionButton label="📜 View" color="gray" onClick={() => fetchSalary(emp._id)} />
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {/* Attendance Modal */}
            {showAttendance && (
                <div className="attendance-modal">
                    <h3>Attendance Records</h3>
                    {attendance.length > 0 ? (
                        <ol>{attendance.map((att, i) => <li key={i}>{att.date} - {att.status}</li>)}</ol>
                    ) : <p>No records available</p>}
                    <button onClick={() => setShowAttendance(false)}>Close</button>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit Employee" : "Add Employee"}</h2>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                        {!isEdit && <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />}
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" />
                        <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="Department" />
                        <input type="text" name="designation" value={formData.designation} onChange={handleChange} placeholder="Designation" />
                        <input type="number" name="salary" value={formData.salary} onChange={handleChange} placeholder="Salary" />
                        <button type="submit" disabled={loading}>{loading ? "Saving..." : isEdit ? "Update Employee" : "Create Employee"}</button>
                    </form>
                </Modal>
            )}
        </div>
    );
}
