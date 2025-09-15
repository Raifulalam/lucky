const express = require("express");
const router = express.Router();
const Employee = require("../Models/Employee");
const Attendance = require("../Models/Attendance");
const Leave = require("../Models/Leave");
const Salary = require("../Models/Salary");
const authMiddleware = require("../authMiddleware");


// ---------------- EMPLOYEE ----------------

// ✅ Create Employee
router.post("/create-employee", authMiddleware, async (req, res) => {
    try {
        const { name, email, phone, department, designation, salary } = req.body;

        const newEmployee = new Employee({
            name,
            email,
            phone,
            department,
            designation,
            salary,
        });

        await newEmployee.save();
        res.status(201).json({ success: true, employee: newEmployee });
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


// ---------------- ATTENDANCE ----------------

// ✅ Mark Attendance
router.post("/attendance", authMiddleware, async (req, res) => {
    try {
        const { employeeId, status, checkIn, checkOut } = req.body;

        const attendance = new Attendance({ employeeId, status, checkIn, checkOut });
        await attendance.save();
        res.status(201).json({ success: true, attendance });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Get Attendance by Employee
router.get("/attendance/:employeeId", authMiddleware, async (req, res) => {
    try {
        const records = await Attendance.find({ employeeId: req.params.employeeId });
        res.json({ success: true, records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Update Attendance
router.put("/attendance/:id", authMiddleware, async (req, res) => {
    try {
        const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!record) return res.status(404).json({ success: false, message: "Attendance not found" });
        res.json({ success: true, record });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Delete Attendance
router.delete("/attendance/:id", authMiddleware, async (req, res) => {
    try {
        const record = await Attendance.findByIdAndDelete(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: "Attendance not found" });
        res.json({ success: true, message: "Attendance deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


// ---------------- LEAVE ----------------

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


// ---------------- SALARY ----------------

// ✅ Generate Salary
router.post("/salary", authMiddleware, async (req, res) => {
    try {
        const { employeeId, month, year, baseSalary, bonuses, deductions } = req.body;
        const netSalary = baseSalary + (bonuses || 0) - (deductions || 0);

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

module.exports = router;
