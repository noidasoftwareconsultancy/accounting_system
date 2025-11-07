const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payroll.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Payroll run validation rules
const payrollRunValidation = [
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2020 }).withMessage('Year must be 2020 or later'),
  body('start_date').isISO8601().withMessage('Valid start date is required'),
  body('end_date').isISO8601().withMessage('Valid end date is required')
];

// Process payroll validation rules
const processPayrollValidation = [
  body('employeePayslips').isArray({ min: 1 }).withMessage('At least one employee payslip is required'),
  body('employeePayslips.*.employee_id').isInt().withMessage('Valid employee ID is required'),
  body('employeePayslips.*.basic_salary').isFloat({ min: 0 }).withMessage('Basic salary must be positive'),
  body('employeePayslips.*.gross_salary').isFloat({ min: 0 }).withMessage('Gross salary must be positive'),
  body('employeePayslips.*.total_deductions').isFloat({ min: 0 }).withMessage('Total deductions must be positive'),
  body('employeePayslips.*.net_salary').isFloat({ min: 0 }).withMessage('Net salary must be positive')
];

// Payment status validation rules
const paymentStatusValidation = [
  body('status').isIn(['pending', 'paid', 'failed']).withMessage('Invalid payment status'),
  body('payment_date').optional().isISO8601().withMessage('Valid payment date is required')
];

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Payroll run routes
router.get('/runs', payrollController.getAllRuns);
router.get('/runs/stats', payrollController.getStats);
router.get('/runs/:id', payrollController.getRunById);
router.post('/runs', authMiddleware.restrictTo('admin', 'hr'), payrollRunValidation, payrollController.createRun);
router.put('/runs/:id', authMiddleware.restrictTo('admin', 'hr'), payrollRunValidation, payrollController.updateRun);
router.delete('/runs/:id', authMiddleware.restrictTo('admin', 'hr'), payrollController.deleteRun);
router.post('/runs/:runId/process', authMiddleware.restrictTo('admin', 'hr'), processPayrollValidation, payrollController.processPayroll);

// Payslip routes
router.get('/payslips/:id', payrollController.getPayslipById);
router.get('/employees/:employeeId/payslips', payrollController.getEmployeePayslips);
router.patch('/payslips/:payslipId/payment-status', authMiddleware.restrictTo('admin', 'hr'), paymentStatusValidation, payrollController.updatePaymentStatus);
router.patch('/payslips/bulk-payment-status', authMiddleware.restrictTo('admin', 'hr'), payrollController.bulkUpdatePaymentStatus);

// Analytics and generation routes
router.get('/analytics', payrollController.getAnalytics);
router.get('/runs/:runId/generate', authMiddleware.restrictTo('admin', 'hr'), payrollController.generatePayrollData);

module.exports = router;