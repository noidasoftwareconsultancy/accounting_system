const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Employee validation rules
const employeeValidation = [
  body('employee_id').notEmpty().withMessage('Employee ID is required'),
  body('join_date').isISO8601().withMessage('Valid join date is required'),
  body('department').optional().notEmpty().withMessage('Department cannot be empty'),
  body('designation').optional().notEmpty().withMessage('Designation cannot be empty'),
  body('bank_account').optional().notEmpty().withMessage('Bank account cannot be empty'),
  body('bank_name').optional().notEmpty().withMessage('Bank name cannot be empty')
];

// Salary structure validation rules
const salaryValidation = [
  body('employee_id').isInt().withMessage('Valid employee ID is required'),
  body('basic_salary').isFloat({ min: 0 }).withMessage('Basic salary must be a positive number'),
  body('effective_from').isISO8601().withMessage('Valid effective from date is required'),
  body('hra').optional().isFloat({ min: 0 }).withMessage('HRA must be a positive number'),
  body('conveyance').optional().isFloat({ min: 0 }).withMessage('Conveyance must be a positive number'),
  body('medical_allowance').optional().isFloat({ min: 0 }).withMessage('Medical allowance must be a positive number'),
  body('special_allowance').optional().isFloat({ min: 0 }).withMessage('Special allowance must be a positive number'),
  body('provident_fund').optional().isFloat({ min: 0 }).withMessage('Provident fund must be a positive number'),
  body('tax_deduction').optional().isFloat({ min: 0 }).withMessage('Tax deduction must be a positive number'),
  body('other_deductions').optional().isFloat({ min: 0 }).withMessage('Other deductions must be a positive number')
];

// Attendance validation rules
const attendanceValidation = [
  body('employee_id').isInt().withMessage('Valid employee ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('status').isIn(['present', 'absent', 'half-day', 'leave']).withMessage('Invalid attendance status'),
  body('hours_worked').optional().isFloat({ min: 0, max: 24 }).withMessage('Hours worked must be between 0 and 24')
];

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Routes
router.get('/', employeeController.getAll);
router.get('/stats', employeeController.getStats);
router.get('/analytics/departments', employeeController.getDepartmentAnalytics);
router.get('/department/:department', employeeController.getByDepartment);
router.get('/search', employeeController.search);
router.get('/:id', employeeController.getById);
router.post('/', authMiddleware.restrictTo('admin', 'hr'), employeeValidation, employeeController.create);
router.put('/:id', authMiddleware.restrictTo('admin', 'hr'), employeeValidation, employeeController.update);
router.delete('/:id', authMiddleware.restrictTo('admin'), employeeController.delete);

// Salary structure routes
router.post('/salary-structure', authMiddleware.restrictTo('admin', 'hr'), salaryValidation, employeeController.createSalaryStructure);
router.get('/:id/salary-history', employeeController.getSalaryHistory);
router.put('/:id/salary-structure', authMiddleware.restrictTo('admin', 'hr'), salaryValidation, employeeController.updateSalaryStructure);

// Attendance routes
router.post('/attendance', attendanceValidation, employeeController.recordAttendance);
router.post('/attendance/bulk', employeeController.bulkRecordAttendance);
router.get('/:id/attendance', employeeController.getAttendance);
router.get('/:id/attendance-summary', employeeController.getAttendanceSummary);

// These routes are now moved above to avoid conflicts with /:id

module.exports = router;