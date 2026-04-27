const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const { formatCurrency } = require("./helpers");

function writePdfToBuffer(configureDocument) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 40, size: "A4" });
        const chunks = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        configureDocument(doc)
            .then(() => doc.end())
            .catch(reject);
    });
}

async function addQrCode(doc, payload, x, y, size = 90) {
    const qrDataUrl = await QRCode.toDataURL(payload, { margin: 1, width: size });
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
    doc.image(Buffer.from(base64Data, "base64"), x, y, { fit: [size, size] });
}

function tryAddAvatar(doc, avatarPath, x, y) {
    if (!avatarPath) {
        return;
    }

    const relativePath = avatarPath.replace(/^\/+/, "").replaceAll("/", path.sep);
    const absolutePath = path.join(__dirname, "..", "..", relativePath);
    if (fs.existsSync(absolutePath)) {
        doc.image(absolutePath, x, y, { fit: [90, 90], align: "center", valign: "center" });
    }
}

function drawLabelValue(doc, label, value, x, y) {
    doc.fontSize(10).fillColor("#5b6470").text(label, x, y);
    doc.fontSize(12).fillColor("#122033").text(value || "-", x, y + 14);
}

async function buildIdCardPdf(employee) {
    return writePdfToBuffer(async (doc) => {
        doc.roundedRect(40, 40, 515, 250, 16).fillAndStroke("#f3f7fb", "#d8e1ee");
        doc.fillColor("#0f172a").fontSize(24).text("Lucky Impex HRMS", 60, 62);
        doc.fontSize(11).fillColor("#516074").text("Employee Identity Card", 60, 94);

        doc.roundedRect(60, 122, 100, 110, 12).fillAndStroke("#dbeafe", "#b6c5d8");
        tryAddAvatar(doc, employee.avatar, 65, 127);

        doc.fillColor("#0f172a").fontSize(20).text(employee.name, 182, 130);
        doc.fontSize(11).fillColor("#516074").text(employee.designation || "Employee", 182, 156);
        doc.text(`${employee.department || "General"} Department`, 182, 174);

        drawLabelValue(doc, "Employee ID", employee.employeeCode, 182, 206);
        drawLabelValue(doc, "Email", employee.email, 330, 206);
        drawLabelValue(doc, "Phone", employee.phone, 182, 246);
        drawLabelValue(doc, "Status", employee.status, 330, 246);

        await addQrCode(
            doc,
            JSON.stringify({
                employeeCode: employee.employeeCode,
                name: employee.name,
                email: employee.email,
                department: employee.department,
            }),
            445,
            122,
            82
        );

        doc
            .fontSize(8)
            .fillColor("#64748b")
            .text("Scan to verify employee identity in HRMS.", 430, 214, {
                width: 110,
                align: "center",
            });
    });
}

async function buildPayslipPdf(payroll, employee) {
    return writePdfToBuffer(async (doc) => {
        doc.fontSize(24).fillColor("#0f172a").text("Payroll Payslip");
        doc.fontSize(11).fillColor("#64748b").text(`Payslip No: ${payroll.payslipNumber}`);
        doc.moveDown();

        doc.roundedRect(40, 100, 515, 120, 12).fillAndStroke("#f8fafc", "#d8e1ee");
        drawLabelValue(doc, "Employee", employee.name, 60, 118);
        drawLabelValue(doc, "Employee ID", employee.employeeCode, 250, 118);
        drawLabelValue(doc, "Department", employee.department, 60, 160);
        drawLabelValue(doc, "Designation", employee.designation, 250, 160);

        await addQrCode(
            doc,
            JSON.stringify({
                payslipNumber: payroll.payslipNumber,
                employeeCode: employee.employeeCode,
                month: payroll.month,
                year: payroll.year,
                netSalary: payroll.netSalary,
            }),
            470,
            116,
            60
        );

        const startY = 250;
        doc.fontSize(15).fillColor("#0f172a").text("Earnings", 60, startY);
        doc.text("Amount", 260, startY);
        doc.text("Deductions", 340, startY);
        doc.text("Amount", 500, startY);

        let y = startY + 28;
        const earnings = [
            { label: "Basic Salary", amount: payroll.basicSalary },
            { label: "HRA", amount: payroll.hra },
            { label: "Overtime", amount: payroll.overtimePay },
            ...payroll.allowances,
            ...payroll.bonuses,
        ];
        const deductions = payroll.deductions;
        const maxRows = Math.max(earnings.length, deductions.length);

        for (let index = 0; index < maxRows; index += 1) {
            const earning = earnings[index];
            const deduction = deductions[index];

            if (earning) {
                doc.fontSize(11).fillColor("#334155").text(earning.label, 60, y);
                doc.text(formatCurrency(earning.amount), 230, y, { width: 70, align: "right" });
            }

            if (deduction) {
                doc.text(deduction.label, 340, y);
                doc.text(formatCurrency(deduction.amount), 485, y, { width: 60, align: "right" });
            }

            y += 22;
        }

        y += 16;
        doc.moveTo(60, y).lineTo(540, y).strokeColor("#d8e1ee").stroke();
        y += 16;
        doc.fontSize(12).fillColor("#0f172a").text("Gross Salary", 60, y);
        doc.text(formatCurrency(payroll.grossSalary), 230, y, { width: 70, align: "right" });
        doc.text("Total Deductions", 340, y);
        doc.text(formatCurrency(payroll.totalDeductions), 485, y, { width: 60, align: "right" });

        y += 30;
        doc.roundedRect(60, y, 480, 48, 10).fillAndStroke("#e0f2fe", "#bae6fd");
        doc.fontSize(14).fillColor("#0f172a").text("Net Salary", 80, y + 16);
        doc.text(formatCurrency(payroll.netSalary), 400, y + 16, { width: 120, align: "right" });
    });
}

module.exports = {
    buildIdCardPdf,
    buildPayslipPdf,
};
