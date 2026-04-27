const Employee = require("../../Models/Employee");
const Attendance = require("../../Models/Attendance");
const Leave = require("../../Models/Leave");
const Salary = require("../../Models/Salary");
const Order = require("../../Models/order");
const { rowsToCsv } = require("../utils/csv");
const { normalizeDay, endOfDay } = require("../utils/helpers");

async function getAdminDashboard(req, res) {
    try {
        const today = normalizeDay();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        const [
            totalEmployees,
            activeEmployees,
            inactiveEmployees,
            todayAttendance,
            monthlyLeaves,
            monthlySalarySummary,
            monthlyRevenue,
            yearlyRevenue,
            yearlySalary,
            attendanceAnalytics,
        ] = await Promise.all([
            Employee.countDocuments(),
            Employee.countDocuments({ status: "active" }),
            Employee.countDocuments({ status: "inactive" }),
            Attendance.aggregate([
                { $match: { date: { $gte: today, $lte: endOfDay(today) } } },
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
            Leave.aggregate([
                { $match: { createdAt: { $gte: startOfMonth } } },
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
            Salary.aggregate([
                { $match: { createdAt: { $gte: startOfMonth } } },
                {
                    $group: {
                        _id: null,
                        totalGross: { $sum: "$grossSalary" },
                        totalNet: { $sum: "$netSalary" },
                    },
                },
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: startOfYear } } },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        revenue: { $sum: "$totalPrice" },
                    },
                },
                { $sort: { "_id.month": 1 } },
            ]),
            Order.aggregate([
                {
                    $group: {
                        _id: { year: { $year: "$createdAt" } },
                        revenue: { $sum: "$totalPrice" },
                    },
                },
                { $sort: { "_id.year": 1 } },
            ]),
            Salary.aggregate([
                {
                    $group: {
                        _id: { year: "$year" },
                        salaryExpense: { $sum: "$netSalary" },
                    },
                },
                { $sort: { "_id.year": 1 } },
            ]),
            Attendance.aggregate([
                { $match: { date: { $gte: startOfMonth } } },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                        lateMinutes: { $sum: "$lateMinutes" },
                    },
                },
            ]),
        ]);

        return res.json({
            success: true,
            dashboard: {
                employees: {
                    total: totalEmployees,
                    active: activeEmployees,
                    inactive: inactiveEmployees,
                },
                attendanceToday: todayAttendance,
                leaveSummary: monthlyLeaves,
                salaryOverview: monthlySalarySummary[0] || {
                    totalGross: 0,
                    totalNet: 0,
                },
                analytics: {
                    monthlyRevenue,
                    yearlyRevenue,
                    yearlySalary,
                    attendance: attendanceAnalytics,
                },
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function getEmployeeDashboard(req, res) {
    try {
        const employee = await Employee.findById(req.user.id).select("-password");
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found." });
        }

        const today = normalizeDay();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [attendanceSummary, leaves, payrolls] = await Promise.all([
            Attendance.aggregate([
                {
                    $match: {
                        employeeId: employee._id,
                        date: { $gte: startOfMonth, $lte: endOfDay(today) },
                    },
                },
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
            Leave.find({ employeeId: employee._id }).sort({ createdAt: -1 }).limit(5),
            Salary.find({ employeeId: employee._id }).sort({ year: -1, month: -1 }).limit(6),
        ]);

        return res.json({
            success: true,
            dashboard: {
                profile: employee,
                attendanceSummary,
                leaveBalance: employee.leaveBalance,
                recentLeaves: leaves,
                payrolls,
                latestPayroll: payrolls[0] || null,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function getAnalytics(req, res) {
    try {
        const year = Number(req.query.year) || new Date().getFullYear();

        const [revenueByMonth, salaryByMonth, attendanceByMonth] = await Promise.all([
            Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(year, 0, 1),
                            $lt: new Date(year + 1, 0, 1),
                        },
                    },
                },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        revenue: { $sum: "$totalPrice" },
                    },
                },
                { $sort: { "_id.month": 1 } },
            ]),
            Salary.aggregate([
                { $match: { year } },
                {
                    $group: {
                        _id: "$month",
                        salaryExpense: { $sum: "$netSalary" },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            Attendance.aggregate([
                {
                    $match: {
                        date: {
                            $gte: new Date(year, 0, 1),
                            $lt: new Date(year + 1, 0, 1),
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            month: { $month: "$date" },
                            status: "$status",
                        },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { "_id.month": 1 } },
            ]),
        ]);

        return res.json({
            success: true,
            analytics: {
                revenueByMonth,
                salaryByMonth,
                attendanceByMonth,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function exportDataset(req, res) {
    try {
        const dataset = req.params.dataset;
        let rows = [];

        if (dataset === "employees") {
            const employees = await Employee.find().select("-password").sort({ createdAt: -1 });
            rows = employees.map((employee) => ({
                employeeCode: employee.employeeCode,
                name: employee.name,
                email: employee.email,
                role: employee.role,
                department: employee.department,
                designation: employee.designation,
                status: employee.status,
                joinedOn: employee.joinDate?.toISOString()?.slice(0, 10),
            }));
        }

        if (dataset === "attendance") {
            const attendance = await Attendance.find().populate("employeeId", "name employeeCode");
            rows = attendance.map((record) => ({
                employeeCode: record.employeeId?.employeeCode,
                employeeName: record.employeeId?.name,
                date: record.date?.toISOString()?.slice(0, 10),
                status: record.status,
                checkIn: record.checkIn?.toISOString() || "",
                checkOut: record.checkOut?.toISOString() || "",
                workMinutes: record.workMinutes,
                lateMinutes: record.lateMinutes,
            }));
        }

        if (dataset === "payroll") {
            const payrolls = await Salary.find().populate("employeeId", "name employeeCode");
            rows = payrolls.map((payroll) => ({
                payslipNumber: payroll.payslipNumber,
                employeeCode: payroll.employeeId?.employeeCode,
                employeeName: payroll.employeeId?.name,
                month: payroll.month,
                year: payroll.year,
                grossSalary: payroll.grossSalary,
                totalDeductions: payroll.totalDeductions,
                netSalary: payroll.netSalary,
                status: payroll.status,
            }));
        }

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "No data available for the requested export.",
            });
        }

        const csv = rowsToCsv(rows);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${dataset}-report.csv"`);
        return res.send(csv);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    getAdminDashboard,
    getEmployeeDashboard,
    getAnalytics,
    exportDataset,
};
