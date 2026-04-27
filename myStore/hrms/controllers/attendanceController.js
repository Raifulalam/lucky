const Attendance = require("../../Models/Attendance");
const Employee = require("../../Models/Employee");
const {
    normalizeDay,
    endOfDay,
    parsePagination,
    buildPagedResponse,
    parseTimeToMinutes,
} = require("../utils/helpers");

function computeTimeMetrics(employee, checkIn, checkOut) {
    const shiftStartMinutes = parseTimeToMinutes(employee?.shift?.startTime || "09:30");
    const shiftEndMinutes = parseTimeToMinutes(employee?.shift?.endTime || "18:30");
    const checkInMinutes = checkIn.getHours() * 60 + checkIn.getMinutes();
    const lateMinutes = Math.max(checkInMinutes - shiftStartMinutes, 0);
    const workMinutes = Math.max(Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60)), 0);
    const scheduledMinutes = Math.max(shiftEndMinutes - shiftStartMinutes, 0);
    const overtimeMinutes = Math.max(workMinutes - scheduledMinutes, 0);

    return {
        lateMinutes,
        workMinutes,
        overtimeMinutes,
    };
}

async function checkIn(req, res) {
    try {
        const employee = await Employee.findById(req.user.id);
        const date = normalizeDay();
        const now = new Date();
        let record = await Attendance.findOne({ employeeId: req.user.id, date });

        if (record?.checkIn) {
            return res.status(400).json({ success: false, message: "Attendance is already checked in for today." });
        }

        const metrics = computeTimeMetrics(employee, now, now);
        record = await Attendance.findOneAndUpdate(
            { employeeId: req.user.id, date },
            {
                employeeId: req.user.id,
                date,
                checkIn: now,
                status: "present",
                source: "self_service",
                lateMinutes: metrics.lateMinutes,
                markedBy: req.user.id,
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).populate("employeeId", "name employeeCode department");

        return res.json({
            success: true,
            message: "Check-in recorded successfully.",
            attendance: record,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function checkOut(req, res) {
    try {
        const date = normalizeDay();
        const now = new Date();
        const record = await Attendance.findOne({ employeeId: req.user.id, date });

        if (!record || !record.checkIn) {
            return res.status(400).json({ success: false, message: "Check-in is required before check-out." });
        }

        if (record.checkOut) {
            return res.status(400).json({ success: false, message: "Attendance is already checked out for today." });
        }

        const employee = await Employee.findById(req.user.id);
        const metrics = computeTimeMetrics(employee, record.checkIn, now);

        record.checkOut = now;
        record.workMinutes = metrics.workMinutes;
        record.overtimeMinutes = metrics.overtimeMinutes;
        await record.save();

        return res.json({
            success: true,
            message: "Check-out recorded successfully.",
            attendance: record,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function markManualAttendance(req, res) {
    try {
        const { employeeId, date, checkIn, checkOut, status = "present", notes } = req.body;
        const employee = await Employee.findById(employeeId);

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found." });
        }

        const normalizedDate = normalizeDay(date || new Date());
        const checkInDate = checkIn ? new Date(checkIn) : normalizedDate;
        const checkOutDate = checkOut ? new Date(checkOut) : checkInDate;
        const metrics = computeTimeMetrics(employee, checkInDate, checkOutDate);

        const attendance = await Attendance.findOneAndUpdate(
            { employeeId, date: normalizedDate },
            {
                employeeId,
                date: normalizedDate,
                checkIn: checkIn ? checkInDate : undefined,
                checkOut: checkOut ? checkOutDate : undefined,
                status,
                notes,
                source: "manual",
                lateMinutes: metrics.lateMinutes,
                workMinutes: checkOut ? metrics.workMinutes : 0,
                overtimeMinutes: checkOut ? metrics.overtimeMinutes : 0,
                markedBy: req.user.id,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).populate("employeeId", "name employeeCode");

        return res.json({
            success: true,
            message: "Attendance saved successfully.",
            attendance,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function autoMarkAbsentees(req, res) {
    try {
        const targetDate = normalizeDay(req.body.date || new Date());
        const activeEmployees = await Employee.find({ status: "active" }).select("_id");
        const existingRecords = await Attendance.find({ date: targetDate }).select("employeeId");
        const existingIds = new Set(existingRecords.map((record) => String(record.employeeId)));
        const missingEmployees = activeEmployees.filter((employee) => !existingIds.has(String(employee._id)));

        if (missingEmployees.length) {
            await Attendance.insertMany(
                missingEmployees.map((employee) => ({
                    employeeId: employee._id,
                    date: targetDate,
                    status: "absent",
                    source: "auto",
                    markedBy: req.user.id,
                }))
            );
        }

        return res.json({
            success: true,
            message: `Auto-marked ${missingEmployees.length} employees as absent.`,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function listAttendance(req, res) {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const filters = {};

        if (req.user.role === "employee") {
            filters.employeeId = req.user.id;
        } else if (req.query.employeeId) {
            filters.employeeId = req.query.employeeId;
        }

        if (req.query.status) {
            filters.status = req.query.status;
        }

        if (req.query.from || req.query.to) {
            filters.date = {};
            if (req.query.from) {
                filters.date.$gte = normalizeDay(req.query.from);
            }
            if (req.query.to) {
                filters.date.$lte = endOfDay(req.query.to);
            }
        }

        const [total, records] = await Promise.all([
            Attendance.countDocuments(filters),
            Attendance.find(filters)
                .populate("employeeId", "name employeeCode department designation")
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit),
        ]);

        return res.json({
            success: true,
            ...buildPagedResponse({ data: records, total, page, limit }),
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function getAttendanceSummary(req, res) {
    try {
        const targetEmployeeId = req.user.role === "employee" ? req.user.id : req.query.employeeId;
        const from = req.query.from ? normalizeDay(req.query.from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const to = req.query.to ? endOfDay(req.query.to) : endOfDay(new Date());

        const match = { date: { $gte: from, $lte: to } };
        if (targetEmployeeId) {
            match.employeeId = targetEmployeeId;
        }

        const summary = await Attendance.aggregate([
            { $match: match },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalLateMinutes: { $sum: "$lateMinutes" },
                    totalWorkMinutes: { $sum: "$workMinutes" },
                },
            },
        ]);

        return res.json({ success: true, summary });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    checkIn,
    checkOut,
    markManualAttendance,
    autoMarkAbsentees,
    listAttendance,
    getAttendanceSummary,
};
