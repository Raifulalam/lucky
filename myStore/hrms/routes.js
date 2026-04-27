const express = require("express");
const auth = require("../middlewares/auth");
const authorize = require("./middlewares/authorize");
const upload = require("./middlewares/upload");
const authController = require("./controllers/authController");
const employeeController = require("./controllers/employeeController");
const attendanceController = require("./controllers/attendanceController");
const leaveController = require("./controllers/leaveController");
const payrollController = require("./controllers/payrollController");
const reportController = require("./controllers/reportController");
const notificationController = require("./controllers/notificationController");
const documentController = require("./controllers/documentController");

const router = express.Router();

router.post("/auth/setup-admin", authController.setupAdmin);
router.post("/auth/login", authController.login);
router.get("/auth/me", auth, authController.getMe);
router.put("/auth/me", auth, authController.updateMyProfile);
router.put("/auth/change-password", auth, authController.changePassword);
router.post("/auth/avatar", auth, upload.single("avatar"), authController.uploadAvatar);

router.get("/employees", auth, authorize("admin", "manager"), employeeController.listEmployees);
router.get("/employees/management/overview", auth, authorize("admin", "manager"), employeeController.getEmployeeManagementOverview);
router.post("/employees", auth, authorize("admin"), employeeController.createEmployee);
router.get("/employees/:id", auth, employeeController.getEmployee);
router.put("/employees/:id", auth, authorize("admin", "manager"), employeeController.updateEmployee);
router.delete("/employees/:id", auth, authorize("admin"), employeeController.deleteEmployee);
router.get("/employees/:id/overview", auth, employeeController.getEmployeeOverview);

router.post("/attendance/check-in", auth, attendanceController.checkIn);
router.post("/attendance/check-out", auth, attendanceController.checkOut);
router.post("/attendance/manual", auth, authorize("admin", "manager"), attendanceController.markManualAttendance);
router.post("/attendance/auto-mark-absent", auth, authorize("admin"), attendanceController.autoMarkAbsentees);
router.get("/attendance", auth, attendanceController.listAttendance);
router.get("/attendance/summary", auth, attendanceController.getAttendanceSummary);

router.get("/leave/policies", auth, leaveController.listLeavePolicies);
router.post("/leave/policies", auth, authorize("admin"), leaveController.upsertLeavePolicy);
router.post("/leave", auth, leaveController.applyLeave);
router.get("/leave", auth, leaveController.listLeaves);
router.put("/leave/:id/review", auth, authorize("admin", "manager"), leaveController.reviewLeave);

router.post("/payroll", auth, authorize("admin"), payrollController.createOrUpdatePayroll);
router.get("/payroll", auth, payrollController.listPayrolls);
router.put("/payroll/:id/pay", auth, authorize("admin"), payrollController.markPayrollPaid);
router.get("/payroll/:id/payslip", auth, payrollController.downloadPayslip);

router.get("/reports/dashboard", auth, authorize("admin", "manager"), reportController.getAdminDashboard);
router.get("/reports/employee-dashboard", auth, reportController.getEmployeeDashboard);
router.get("/reports/analytics", auth, authorize("admin", "manager"), reportController.getAnalytics);
router.get("/reports/export/:dataset", auth, authorize("admin", "manager"), reportController.exportDataset);

router.get("/notifications", auth, notificationController.listNotifications);
router.put("/notifications/:id/read", auth, notificationController.markNotificationRead);

router.get("/documents/id-card/:employeeId", auth, documentController.downloadIdCard);
router.get("/documents/my-id-card", auth, documentController.downloadIdCard);

module.exports = router;
