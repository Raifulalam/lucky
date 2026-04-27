const Employee = require("../../Models/Employee");
const Salary = require("../../Models/Salary");
const { calculatePayrollTotals } = require("../utils/payroll");
const { parsePagination, buildPagedResponse } = require("../utils/helpers");
const { createNotification } = require("../utils/notifications");
const { buildPayslipPdf } = require("../utils/documents");

async function createOrUpdatePayroll(req, res) {
    try {
        const employee = await Employee.findById(req.body.employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found." });
        }

        const totals = calculatePayrollTotals({
            basicSalary: req.body.basicSalary ?? employee.salaryStructure?.basic ?? employee.salary,
            hra: req.body.hra ?? employee.salaryStructure?.hra ?? 0,
            allowances: req.body.allowances || [
                {
                    label: "Allowances",
                    amount: employee.salaryStructure?.allowances || 0,
                },
            ],
            bonuses: req.body.bonuses || [],
            deductions: req.body.deductions || [],
            overtimePay: req.body.overtimePay || 0,
        });

        const payroll = await Salary.findOneAndUpdate(
            {
                employeeId: employee._id,
                month: req.body.month,
                year: req.body.year,
            },
            {
                employeeId: employee._id,
                month: req.body.month,
                year: req.body.year,
                ...totals,
                status: req.body.status || "processed",
                paidVia: req.body.paidVia,
                transactionReference: req.body.transactionReference,
                notes: req.body.notes,
                generatedBy: req.user.id,
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
                runValidators: true,
            }
        ).populate("employeeId", "name employeeCode department designation");

        await createNotification({
            employeeId: employee._id,
            title: "Payroll generated",
            message: `Your payroll for ${payroll.month}/${payroll.year} is ready to review.`,
            type: "payroll",
            link: "/employee/salary",
            metadata: { payrollId: payroll._id },
        });

        return res.json({
            success: true,
            message: "Payroll saved successfully.",
            payroll,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function listPayrolls(req, res) {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const filters = {};

        if (req.user.role === "employee") {
            filters.employeeId = req.user.id;
        } else if (req.query.employeeId) {
            filters.employeeId = req.query.employeeId;
        }

        if (req.query.month) {
            filters.month = Number(req.query.month);
        }

        if (req.query.year) {
            filters.year = Number(req.query.year);
        }

        if (req.query.status) {
            filters.status = req.query.status;
        }

        const [total, payrolls] = await Promise.all([
            Salary.countDocuments(filters),
            Salary.find(filters)
                .populate("employeeId", "name employeeCode department designation")
                .sort({ year: -1, month: -1 })
                .skip(skip)
                .limit(limit),
        ]);

        return res.json({
            success: true,
            ...buildPagedResponse({ data: payrolls, total, page, limit }),
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function markPayrollPaid(req, res) {
    try {
        const payroll = await Salary.findByIdAndUpdate(
            req.params.id,
            {
                status: "paid",
                paidDate: new Date(),
                paidVia: req.body.paidVia,
                transactionReference: req.body.transactionReference,
            },
            { new: true }
        );

        if (!payroll) {
            return res.status(404).json({ success: false, message: "Payroll record not found." });
        }

        await createNotification({
            employeeId: payroll.employeeId,
            title: "Salary credited",
            message: `Your salary for ${payroll.month}/${payroll.year} has been marked as paid.`,
            type: "payroll",
            link: "/employee/salary",
            metadata: { payrollId: payroll._id },
        });

        return res.json({
            success: true,
            message: "Payroll marked as paid.",
            payroll,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function downloadPayslip(req, res) {
    try {
        const payroll = await Salary.findById(req.params.id).populate("employeeId");

        if (!payroll) {
            return res.status(404).json({ success: false, message: "Payroll record not found." });
        }

        const isOwner = String(payroll.employeeId._id) === String(req.user.id);
        if (req.user.role === "employee" && !isOwner) {
            return res.status(403).json({ success: false, message: "Access denied." });
        }

        const buffer = await buildPayslipPdf(payroll, payroll.employeeId);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${payroll.payslipNumber}.pdf"`);
        return res.send(buffer);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    createOrUpdatePayroll,
    listPayrolls,
    markPayrollPaid,
    downloadPayslip,
};
