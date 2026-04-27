const Employee = require("../../Models/Employee");
const Leave = require("../../Models/Leave");
const LeavePolicy = require("../../Models/LeavePolicy");
const { createNotification } = require("../utils/notifications");
const { parsePagination, buildPagedResponse, calculateDateDifferenceInDays } = require("../utils/helpers");

function getBalanceKey(leaveType) {
    const balanceMap = {
        annual: "annual",
        sick: "sick",
        casual: "casual",
        unpaid: "unpaid",
    };

    return balanceMap[leaveType] || "unpaid";
}

async function listLeavePolicies(req, res) {
    try {
        const policies = await LeavePolicy.find().sort({ leaveType: 1 });
        return res.json({ success: true, policies });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function upsertLeavePolicy(req, res) {
    try {
        const policy = await LeavePolicy.findOneAndUpdate(
            { leaveType: req.body.leaveType },
            req.body,
            { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
        );

        return res.json({
            success: true,
            message: "Leave policy saved successfully.",
            policy,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function applyLeave(req, res) {
    try {
        const employeeId = req.user.role === "employee" ? req.user.id : req.body.employeeId;
        const totalDays = calculateDateDifferenceInDays(req.body.startDate, req.body.endDate);

        const leave = await Leave.create({
            employeeId,
            policyId: req.body.policyId,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            leaveType: req.body.leaveType,
            totalDays,
            reason: req.body.reason,
            handoverNotes: req.body.handoverNotes,
        });

        return res.status(201).json({
            success: true,
            message: "Leave request submitted successfully.",
            leave,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function listLeaves(req, res) {
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

        const [total, leaves] = await Promise.all([
            Leave.countDocuments(filters),
            Leave.find(filters)
                .populate("employeeId", "name employeeCode department designation")
                .populate("reviewedBy", "name employeeCode")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
        ]);

        return res.json({
            success: true,
            ...buildPagedResponse({ data: leaves, total, page, limit }),
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function reviewLeave(req, res) {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave request not found." });
        }

        leave.status = req.body.status;
        leave.reviewedBy = req.user.id;
        leave.reviewedAt = new Date();
        leave.reviewedComment = req.body.reviewedComment;
        await leave.save();

        if (leave.status === "approved") {
            const employee = await Employee.findById(leave.employeeId);
            const balanceKey = getBalanceKey(leave.leaveType);
            const currentBalance = Number(employee.leaveBalance?.[balanceKey] || 0);

            if (balanceKey !== "unpaid") {
                employee.leaveBalance[balanceKey] = Math.max(currentBalance - leave.totalDays, 0);
            }

            employee.status = "on_leave";
            await employee.save();
        }

        if (leave.status !== "approved") {
            await Employee.findByIdAndUpdate(leave.employeeId, { status: "active" });
        }

        await createNotification({
            employeeId: leave.employeeId,
            title: `Leave ${leave.status}`,
            message: `Your ${leave.leaveType} leave request from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} was ${leave.status}.`,
            type: "leave",
            link: "/employee/leave",
            metadata: { leaveId: leave._id },
        });

        return res.json({
            success: true,
            message: "Leave request reviewed successfully.",
            leave,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    listLeavePolicies,
    upsertLeavePolicy,
    applyLeave,
    listLeaves,
    reviewLeave,
};
