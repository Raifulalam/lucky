const ROLES = ["admin", "manager", "employee"];
const LEAVE_TYPES = ["annual", "sick", "casual", "unpaid"];
const EMPLOYEE_STATUSES = ["active", "inactive", "on_leave"];
const ATTENDANCE_STATUSES = ["present", "absent", "leave", "half_day", "weekend", "holiday"];
const PAYROLL_STATUSES = ["draft", "processed", "paid"];

module.exports = {
    ROLES,
    LEAVE_TYPES,
    EMPLOYEE_STATUSES,
    ATTENDANCE_STATUSES,
    PAYROLL_STATUSES,
};
