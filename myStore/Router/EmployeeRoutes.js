const express = require("express");
const router = express.Router();
const Employee = require("../Models/Employee");
const Attendance = require("../Models/Attendance");
const Leave = require("../Models/Leave");
const Salary = require("../Models/Salary");
const { authenticateToken, authorizeRoles } = require("../authMiddleware");
const jwt = require("jsonwebtoken");

// ---------------- EMPLOYEE CRUD ----------------

// ✅ Create Employee (Admin Only)
router.post("/create-employee", authenticateToken, authorizeRoles("admin"), async (req, res) => {
    try {
        const { name, email, password, phone, department, designation, salary } = req.body;

        const existing = await Employee.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: "Employee already exists" });
        }

        const newEmployee = new Employee({
            name,
            email,
            password, // hashed automatically
            phone,
            department,
            designation,
            salary
        });

        await newEmployee.save();

        res.status(201).json({ success: true, message: "Employee created successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Employee Login
router.post("/login-employee", async (req, res) => {
    try {
        const { email, password } = req.body;

        const employee = await Employee.findOne({ email });
        if (!employee) return res.status(400).json({ success: false, message: "Invalid email or password" });

        const isMatch = await employee.comparePassword(password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid email or password" });

        const token = jwt.sign(
            { id: employee._id, role: employee.role },
            "your_jwt_secret_key",
            { expiresIn: "1d" }
        );

        res.json({ success: true, token, employee: { id: employee._id, name: employee.name, email: employee.email, role: employee.role } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Get All Employees (Admin Only)
router.get("/employees", authenticateToken, authorizeRoles("admin"), async (req, res) => {
    try {
        const employees = await Employee.find().select("-password");
        res.status(200).json({ success: true, employees });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Update Employee (Admin Only)
router.put("/employee/:id", authenticateToken, authorizeRoles("admin"), async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
        res.json({ success: true, employee });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Delete Employee (Admin Only)
router.delete("/employee/:id", authenticateToken, authorizeRoles("admin"), async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
        res.json({ success: true, message: "Employee deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


// ---------------- ADMIN DASHBOARD ----------------

// ✅ Admin Dashboard Stats
router.get("/admin-dashboard", authenticateToken, authorizeRoles("admin"), async (req, res) => {
    try {
        const totalEmployees = await Employee.countDocuments();
        const activeEmployees = await Employee.countDocuments({ status: "Active" });
        const totalLeaves = await Leave.countDocuments();
        const pendingLeaves = await Leave.countDocuments({ status: "Pending" });
        const totalAttendance = await Attendance.countDocuments();
        const totalSalaryPaid = await Salary.aggregate([
            { $group: { _id: null, total: { $sum: "$netSalary" } } }
        ]);

        res.json({
            success: true,
            stats: {
                totalEmployees,
                activeEmployees,
                totalLeaves,
                pendingLeaves,
                totalAttendance,
                totalSalaryPaid: totalSalaryPaid[0]?.total || 0
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


// ---------------- EMPLOYEE DASHBOARD ----------------

// ✅ Employee Dashboard (self)
router.get("/employee-dashboard/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role === "employee" && req.user.id !== id) {
            return res.status(403).json({ message: "Access denied. You can only view your own stats." });
        }

        const attendanceCount = await Attendance.countDocuments({ employeeId: id, status: "Present" });
        const leaves = await Leave.find({ employeeId: id });
        const salaries = await Salary.find({ employeeId: id });

        res.json({
            success: true,
            stats: {
                totalAttendance: attendanceCount,
                totalLeaves: leaves.length,
                approvedLeaves: leaves.filter(l => l.status === "Approved").length,
                rejectedLeaves: leaves.filter(l => l.status === "Rejected").length,
                totalSalaryReceived: salaries.reduce((sum, s) => sum + s.netSalary, 0),
                lastSalary: salaries[salaries.length - 1] || null
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
