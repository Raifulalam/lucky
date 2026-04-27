const Employee = require("../../Models/Employee");
const { buildIdCardPdf } = require("../utils/documents");

async function downloadIdCard(req, res) {
    try {
        const employeeId = req.params.employeeId || req.user.id;
        const employee = await Employee.findById(employeeId);

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found." });
        }

        const isOwner = String(employee._id) === String(req.user.id);
        if (req.user.role === "employee" && !isOwner) {
            return res.status(403).json({ success: false, message: "Access denied." });
        }

        const buffer = await buildIdCardPdf(employee);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${employee.employeeCode}-id-card.pdf"`);
        return res.send(buffer);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    downloadIdCard,
};
