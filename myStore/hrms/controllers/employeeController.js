const Employee = require("../../Models/Employee");
const Attendance = require("../../Models/Attendance");
const Leave = require("../../Models/Leave");
const Salary = require("../../Models/Salary");
const { parsePagination, buildPagedResponse, normalizeDay } = require("../utils/helpers");

function buildEmployeeFilters(query = {}) {
    const filters = {};

    if (query.status) {
        filters.status = query.status;
    }

    if (query.role) {
        filters.role = query.role;
    }

    if (query.department) {
        filters.department = query.department;
    }

    if (query.search) {
        const regex = new RegExp(query.search, "i");
        filters.$or = [
            { name: regex },
            { email: regex },
            { employeeCode: regex },
            { department: regex },
            { designation: regex },
        ];
    }

    return filters;
}

function sanitizePayload(body = {}) {
    const allowedFields = [
        "name",
        "email",
        "password",
        "phone",
        "alternatePhone",
        "role",
        "department",
        "designation",
        "salary",
        "salaryStructure",
        "joinDate",
        "dateOfBirth",
        "gender",
        "status",
        "employmentType",
        "workLocation",
        "manager",
        "shift",
        "address",
        "emergencyContact",
        "leaveBalance",
        "notes",
    ];

    return allowedFields.reduce((accumulator, field) => {
        if (body[field] !== undefined) {
            if (field === "password" && !body[field]) {
                return accumulator;
            }
            accumulator[field] = field === "email" ? String(body[field]).toLowerCase().trim() : body[field];
        }
        return accumulator;
    }, {});
}

async function listEmployees(req, res) {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const filters = buildEmployeeFilters(req.query);
        const [total, employees] = await Promise.all([
            Employee.countDocuments(filters),
            Employee.find(filters)
                .select("-password")
                .populate("manager", "name employeeCode")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
        ]);

        return res.json({
            success: true,
            ...buildPagedResponse({ data: employees, total, page, limit }),
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function createEmployee(req, res) {
    try {
        const payload = sanitizePayload(req.body);
        if (!payload.password) {
            payload.password = "TempPass@123";
        }
        payload.salary = Number(payload.salary || 0);

        const existingEmployee = await Employee.findOne({ email: payload.email });
        if (existingEmployee) {
            return res.status(400).json({ success: false, message: "Employee email already exists." });
        }

        const employee = await Employee.create(payload);
        return res.status(201).json({
            success: true,
            message: "Employee created successfully.",
            employee: employee.toSafeObject(),
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function getEmployee(req, res) {
    try {
        const employee = await Employee.findById(req.params.id)
            .select("-password")
            .populate("manager", "name employeeCode email");

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found." });
        }

        if (req.user.role === "employee" && String(req.user.id) !== String(employee._id)) {
            return res.status(403).json({ success: false, message: "Access denied." });
        }

        return res.json({ success: true, employee });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function updateEmployee(req, res) {
    try {
        const payload = sanitizePayload(req.body);
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found." });
        }

        if (payload.email) {
            const existingEmployee = await Employee.findOne({
                email: payload.email,
                _id: { $ne: employee._id },
            });

            if (existingEmployee) {
                return res.status(400).json({ success: false, message: "Employee email already exists." });
            }
        }

        if (payload.salary !== undefined) {
            payload.salary = Number(payload.salary || 0);
        }

        Object.assign(employee, payload);
        await employee.save();

        return res.json({
            success: true,
            message: "Employee updated successfully.",
            employee: employee.toSafeObject(),
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function deleteEmployee(req, res) {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found." });
        }

        return res.json({ success: true, message: "Employee deleted successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function getEmployeeOverview(req, res) {
    try {
        const employeeId = req.params.id;
        const today = normalizeDay();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [employee, attendance, leaves, payrolls] = await Promise.all([
            Employee.findById(employeeId).select("-password"),
            Attendance.find({
                employeeId,
                date: { $gte: startOfMonth, $lte: today },
            }),
            Leave.find({ employeeId }).sort({ createdAt: -1 }),
            Salary.find({ employeeId }).sort({ year: -1, month: -1 }).limit(6),
        ]);

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found." });
        }

        const attendanceSummary = attendance.reduce(
            (summary, record) => {
                summary[record.status] = (summary[record.status] || 0) + 1;
                return summary;
            },
            { present: 0, absent: 0, half_day: 0, leave: 0 }
        );

        const leaveSummary = leaves.reduce(
            (summary, leave) => {
                summary.total += 1;
                summary[leave.status] = (summary[leave.status] || 0) + 1;
                return summary;
            },
            { total: 0, approved: 0, pending: 0, rejected: 0 }
        );

        const payrollSummary = {
            lastPayslip: payrolls[0] || null,
            totalReceived: payrolls
                .filter((item) => item.status === "paid")
                .reduce((sum, item) => sum + item.netSalary, 0),
        };

        return res.json({
            success: true,
            overview: {
                employee,
                attendanceSummary,
                leaveSummary,
                payrollSummary,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function getEmployeeManagementOverview(req, res) {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const filters = buildEmployeeFilters(req.query);

        const [total, employees] = await Promise.all([
            Employee.countDocuments(filters),
            Employee.find(filters)
                .select("-password")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
        ]);

        const employeeIds = employees.map((employee) => employee._id);

        const [attendanceSummary, leaveSummary, paidPayrollSummary] = await Promise.all([
            Attendance.aggregate([
                { $match: { employeeId: { $in: employeeIds } } },
                {
                    $group: {
                        _id: {
                            employeeId: "$employeeId",
                            status: "$status",
                        },
                        count: { $sum: 1 },
                    },
                },
            ]),
            Leave.aggregate([
                { $match: { employeeId: { $in: employeeIds } } },
                {
                    $group: {
                        _id: {
                            employeeId: "$employeeId",
                            status: "$status",
                        },
                        count: { $sum: 1 },
                    },
                },
            ]),
            Salary.aggregate([
                { $match: { employeeId: { $in: employeeIds }, status: "paid" } },
                {
                    $group: {
                        _id: "$employeeId",
                        totalPaid: { $sum: "$netSalary" },
                        lastPaidAt: { $max: "$paidDate" },
                    },
                },
            ]),
        ]);

        const attendanceMap = attendanceSummary.reduce((accumulator, item) => {
            const employeeId = String(item._id.employeeId);
            if (!accumulator[employeeId]) {
                accumulator[employeeId] = {
                    present: 0,
                    absent: 0,
                    half_day: 0,
                    leave: 0,
                };
            }

            accumulator[employeeId][item._id.status] = item.count;
            return accumulator;
        }, {});

        const leaveMap = leaveSummary.reduce((accumulator, item) => {
            const employeeId = String(item._id.employeeId);
            if (!accumulator[employeeId]) {
                accumulator[employeeId] = {
                    total: 0,
                    pending: 0,
                    approved: 0,
                    rejected: 0,
                    cancelled: 0,
                };
            }

            accumulator[employeeId][item._id.status] = item.count;
            accumulator[employeeId].total += item.count;
            return accumulator;
        }, {});

        const payrollMap = paidPayrollSummary.reduce((accumulator, item) => {
            accumulator[String(item._id)] = item;
            return accumulator;
        }, {});

        const rows = employees.map((employee) => {
            const employeeId = String(employee._id);
            const attendance = attendanceMap[employeeId] || {
                present: 0,
                absent: 0,
                half_day: 0,
                leave: 0,
            };
            const leave = leaveMap[employeeId] || {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
                cancelled: 0,
            };
            const payroll = payrollMap[employeeId] || {
                totalPaid: 0,
                lastPaidAt: null,
            };
            const totalAttendance =
                attendance.present + attendance.absent + attendance.half_day + attendance.leave;
            const attendanceRate =
                totalAttendance > 0
                    ? Number(((attendance.present / totalAttendance) * 100).toFixed(1))
                    : 0;

            return {
                ...employee.toObject(),
                metrics: {
                    attendance,
                    totalAttendance,
                    attendanceRate,
                    leave,
                    payroll,
                },
            };
        });

        return res.json({
            success: true,
            ...buildPagedResponse({ data: rows, total, page, limit }),
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    listEmployees,
    createEmployee,
    getEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeOverview,
    getEmployeeManagementOverview,
};
