function normalizeItems(items = []) {
    return items
        .filter((item) => item && item.label && Number(item.amount) >= 0)
        .map((item) => ({
            label: String(item.label).trim(),
            amount: Number(item.amount),
        }));
}

function sumLineItems(items = []) {
    return items.reduce((total, item) => total + Number(item.amount || 0), 0);
}

function calculatePayrollTotals(payload = {}) {
    const allowances = normalizeItems(payload.allowances);
    const bonuses = normalizeItems(payload.bonuses);
    const deductions = normalizeItems(payload.deductions);
    const basicSalary = Number(payload.basicSalary || 0);
    const hra = Number(payload.hra || 0);
    const overtimePay = Number(payload.overtimePay || 0);

    const grossSalary =
        basicSalary +
        hra +
        overtimePay +
        sumLineItems(allowances) +
        sumLineItems(bonuses);

    const totalDeductions = sumLineItems(deductions);
    const netSalary = Math.max(grossSalary - totalDeductions, 0);

    return {
        allowances,
        bonuses,
        deductions,
        basicSalary,
        hra,
        overtimePay,
        grossSalary,
        totalDeductions,
        netSalary,
    };
}

module.exports = {
    calculatePayrollTotals,
};
