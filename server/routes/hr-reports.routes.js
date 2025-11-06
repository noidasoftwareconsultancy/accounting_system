const express = require('express');
const router = express.Router();
const hrReportsController = require('../controllers/hr-reports.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication to all routes
router.use(authMiddleware.protect);

// HR Reports Routes (all authenticated users can view reports)
router.get('/employee-summary', hrReportsController.getEmployeeSummary);
router.get('/payroll-summary', hrReportsController.getPayrollSummary);
router.get('/attendance', hrReportsController.getAttendanceReport);
router.get('/department-performance', hrReportsController.getDepartmentPerformance);
router.get('/employee-lifecycle', hrReportsController.getEmployeeLifecycleReport);
router.get('/dashboard', hrReportsController.getHRDashboard);

module.exports = router;