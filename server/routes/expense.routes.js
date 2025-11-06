const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Expense validation rules
const expenseValidation = [
  body('description').notEmpty().withMessage('Description is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('expense_date').isISO8601().withMessage('Valid expense date is required'),
  body('category_id').custom((value) => {
    if (value === null || value === undefined || value === '') return true;
    if (!Number.isInteger(Number(value))) throw new Error('Valid category ID is required');
    return true;
  }),
  body('vendor_id').custom((value) => {
    if (value === null || value === undefined || value === '') return true;
    if (!Number.isInteger(Number(value))) throw new Error('Valid vendor ID is required');
    return true;
  }),
  body('project_id').custom((value) => {
    if (value === null || value === undefined || value === '') return true;
    if (!Number.isInteger(Number(value))) throw new Error('Valid project ID is required');
    return true;
  }),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('status').optional().isIn(['pending', 'approved', 'rejected', 'paid']).withMessage('Invalid status')
];

// Category validation rules
const categoryValidation = [
  body('name').notEmpty().withMessage('Category name is required'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('is_tax_deductible').optional().isBoolean().withMessage('Tax deductible must be boolean')
];

// Vendor validation rules
const vendorValidation = [
  body('name').notEmpty().withMessage('Vendor name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('payment_terms').optional().isInt({ min: 0 }).withMessage('Payment terms must be positive')
];

// Apply authentication middleware to all expense routes
router.use(authMiddleware.protect);

// Expense routes
router.get('/', expenseController.getAll);
router.get('/stats', expenseController.getStats);
router.get('/analytics', expenseController.getAnalytics);
router.get('/recurring', expenseController.getRecurringExpenses);
router.get('/summary/by-category', expenseController.getSummaryByCategory);
router.get('/summary/by-month', expenseController.getSummaryByMonth);
router.get('/category/:categoryId', expenseController.getByCategory);
router.get('/vendor/:vendorId', expenseController.getByVendor);
router.get('/project/:projectId', expenseController.getByProject);
router.get('/:id', expenseController.getById);
router.post('/', expenseValidation, expenseController.create);
router.post('/recurring', expenseController.createRecurringExpense);
router.post('/:id/receipt', expenseController.uploadReceipt);
router.put('/:id', expenseValidation, expenseController.update);
router.patch('/:id/approve', authMiddleware.restrictTo('admin', 'manager'), expenseController.approve);
router.patch('/:id/reject', authMiddleware.restrictTo('admin', 'manager'), expenseController.reject);
router.patch('/:id/mark-paid', authMiddleware.restrictTo('admin', 'manager'), expenseController.markAsPaid);
router.delete('/:id', authMiddleware.restrictTo('admin', 'manager'), expenseController.delete);

// Category routes
router.get('/categories', expenseController.getCategories);
router.post('/categories', authMiddleware.restrictTo('admin', 'manager'), categoryValidation, expenseController.createCategory);
router.put('/categories/:id', authMiddleware.restrictTo('admin', 'manager'), categoryValidation, expenseController.updateCategory);
router.delete('/categories/:id', authMiddleware.restrictTo('admin'), expenseController.deleteCategory);

// Vendor routes
router.get('/vendors', expenseController.getVendors);
router.post('/vendors', authMiddleware.restrictTo('admin', 'manager'), vendorValidation, expenseController.createVendor);
router.put('/vendors/:id', authMiddleware.restrictTo('admin', 'manager'), vendorValidation, expenseController.updateVendor);
router.delete('/vendors/:id', authMiddleware.restrictTo('admin'), expenseController.deleteVendor);

// Legacy routes for backward compatibility
router.get('/expenses', expenseController.getAllExpenses);
router.get('/expenses/:id', expenseController.getExpenseById);
router.post('/expenses', expenseController.createExpense);
router.put('/expenses/:id', expenseController.updateExpense);
router.delete('/expenses/:id', expenseController.deleteExpense);

module.exports = router;