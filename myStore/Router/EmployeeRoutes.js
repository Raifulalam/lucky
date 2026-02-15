const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const Employee = require("../Models/Employee");
const Attendance = require("../Models/Attendance");
const Leave = require("../Models/Leave");
const Salary = require("../Models/Salary");
const authMiddleware = require("../middlewares/auth");

// ---------------------------- EMPLOYEE ROUTES ----------------------------

// ✅ Create Employee
router.post("/create-employee", authMiddleware, async (req, res) => {
    try {
        const { name, email, password, phone, department, designation, salary } = req.body;

        const existing = await Employee.findOne({ email });
        if (existing) return res.status(400).json({ success: false, message: "Employee already exists" });

        const newEmployee = new Employee({ name, email, password, phone, department, designation, salary });
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

        const token = jwt.sign({ id: employee._id, role: "employee" }, "bcdjbsfnkndskdemlfwfkebfkw11", { expiresIn: "1d" });

        res.json({
            success: true,
            token,
            employee: { id: employee._id, name: employee.name, email: employee.email }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Get All Employees
router.get("/employees", authMiddleware, async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json({ success: true, employees });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Update Employee
router.put("/employee/:id", authMiddleware, async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
        res.json({ success: true, employee });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Delete Employee
router.delete("/employee/:id", authMiddleware, async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
        res.json({ success: true, message: "Employee deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ---------------------------- ATTENDANCE ROUTES ----------------------------

// ✅ Mark Attendance
router.post("/attendance", authMiddleware, async (req, res) => {
    try {
        const { employeeId, status, checkIn, checkOut } = req.body;

        // Employees can mark only their own attendance
        if (req.user.role === "employee" && req.user.id !== employeeId) {
            return res.status(403).json({ message: "You can only mark your own attendance." });
        }

        // Check if attendance already marked today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existing = await Attendance.findOne({
            employeeId,
            date: { $gte: today, $lt: tomorrow }
        });

        if (existing) return res.status(400).json({ success: false, message: "Attendance already marked for today!" });

        const attendance = new Attendance({ employeeId, status, checkIn, checkOut, date: new Date() });
        await attendance.save();

        res.status(201).json({ success: true, message: "Attendance marked", record: attendance });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Get Attendance by Employee
router.get("/attendance/:employeeId", authMiddleware, async (req, res) => {
    try {
        const { employeeId } = req.params;

        if (req.user.role === "employee" && req.user.id !== employeeId) {
            return res.status(403).json({ message: "Access denied. You can only view your own attendance." });
        }

        const records = await Attendance.find({ employeeId });
        res.json({ success: true, records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Update Attendance (Admin only)
router.put("/attendance/:id", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ message: "Only admin can update attendance." });

        const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!record) return res.status(404).json({ success: false, message: "Attendance not found" });

        res.json({ success: true, record });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Delete Attendance (Admin only)
router.delete("/attendance/:id", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ message: "Only admin can delete attendance." });

        const record = await Attendance.findByIdAndDelete(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: "Attendance not found" });

        res.json({ success: true, message: "Attendance deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ---------------------------- LEAVE ROUTES ----------------------------

// ✅ Apply Leave
router.post("/leave", authMiddleware, async (req, res) => {
    try {
        const { employeeId, startDate, endDate, type, reason } = req.body;
        const leave = new Leave({ employeeId, startDate, endDate, type, reason });
        await leave.save();
        res.status(201).json({ success: true, leave });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Get Leave Requests
router.get("/leave/:employeeId", authMiddleware, async (req, res) => {
    try {
        const leaves = await Leave.find({ employeeId: req.params.employeeId });
        res.json({ success: true, leaves });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Update Leave (Approve/Reject)
router.put("/leave/:id", authMiddleware, async (req, res) => {
    try {
        const leave = await Leave.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });
        res.json({ success: true, leave });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Delete Leave
router.delete("/leave/:id", authMiddleware, async (req, res) => {
    try {
        const leave = await Leave.findByIdAndDelete(req.params.id);
        if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });
        res.json({ success: true, message: "Leave deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ---------------------------- SALARY ROUTES ----------------------------

// ✅ Generate Salary
router.post("/salary", authMiddleware, async (req, res) => {
    try {
        const { employeeId, month, year, baseSalary, bonuses = 0, deductions = 0 } = req.body;
        const netSalary = baseSalary + bonuses - deductions;

        const salary = new Salary({ employeeId, month, year, baseSalary, bonuses, deductions, netSalary });
        await salary.save();

        res.status(201).json({ success: true, salary });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Get Salary Records
router.get("/salary/:employeeId", authMiddleware, async (req, res) => {
    try {
        const salaries = await Salary.find({ employeeId: req.params.employeeId });
        res.json({ success: true, salaries });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Update Salary (e.g., mark as Paid)
router.put("/salary/:id", authMiddleware, async (req, res) => {
    try {
        const salary = await Salary.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!salary) return res.status(404).json({ success: false, message: "Salary record not found" });
        res.json({ success: true, salary });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Delete Salary Record
router.delete("/salary/:id", authMiddleware, async (req, res) => {
    try {
        const salary = await Salary.findByIdAndDelete(req.params.id);
        if (!salary) return res.status(404).json({ success: false, message: "Salary record not found" });
        res.json({ success: true, message: "Salary record deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ---------------------------- DASHBOARD ROUTES ----------------------------

// ✅ Admin Dashboard Stats
router.get("/admin-dashboard", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ message: "Admins only." });

        const totalEmployees = await Employee.countDocuments();
        const totalAttendance = await Attendance.countDocuments();
        const totalLeaves = await Leave.countDocuments();
        const totalSalaryPaid = await Salary.aggregate([{ $group: { _id: null, total: { $sum: "$netSalary" } } }]);

        res.json({
            success: true,
            stats: {
                totalEmployees,
                totalAttendance,
                totalLeaves,
                totalSalaryPaid: totalSalaryPaid[0]?.total || 0
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.get("/admin-employeeStats", authMiddleware, async (req, res) => {
    try {
        // Only admin can see this
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
        const employees = await Employee.find();

        // Prepare detailed stats for each employee
        const employeeStats = await Promise.all(
            employees.map(async (emp) => {
                // Calculate total days since joining
                const joinDate = new Date(emp.joinDate);
                const today = new Date();
                const totalDays = Math.ceil(
                    (today - joinDate) / (1000 * 60 * 60 * 24)
                );

                // Fetch attendance records for this employee
                const attendanceRecords = await Attendance.find({ employeeId: emp._id });

                const totalPresent = attendanceRecords.filter(
                    (a) => a.status === "Present"
                ).length;

                const totalAbsent = attendanceRecords.filter(
                    (a) => a.status === "Absent"
                ).length;

                const totalAttendance = totalPresent + totalAbsent;

                // Fetch leaves for this employee
                const leaves = await Leave.find({ employeeId: emp._id });
                const totalLeaves = leaves.length;

                // Fetch total salary paid
                const salaryPaid = await Salary.aggregate([
                    { $match: { employeeId: emp._id } },
                    { $group: { _id: null, total: { $sum: "$netSalary" } } },
                ]);


                // Effective working days after excluding leaves
                const effectiveDays = totalDays - totalLeaves;

                return {
                    empId: emp._id,
                    name: emp.name,
                    email: emp.email,
                    phone: emp.phone,
                    salary: emp.salary,
                    status: emp.status,
                    department: emp.department,
                    designation: emp.designation,
                    joinedDate: emp.joinDate,
                    totalDays,
                    totalPresent,
                    totalAbsent,
                    totalAttendance,
                    totalLeaves,
                    totalSalaryPaid: salaryPaid[0]?.total || 0,
                    effectiveDays,
                };
            })
        );

        // Send response
        res.json({
            success: true,
            employees: employeeStats,
        });
    } catch (err) {
        console.error("Error in admin-dashboard:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});
// ✅ Employee Dashboard Stats
router.get("/employee-dashboard", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user.role === "employee" && req.user.id !== id) return res.status(403).json({ message: "Access denied." });

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



