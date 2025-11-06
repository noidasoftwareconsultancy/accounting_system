const express = require('express');
const router = express.Router();
const taxRecordController = require('../controllers/tax-record.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Tax record validation rules
const taxRecordValidation = [
  body('tax_rate_id').isInt().withMessage('Valid tax rate ID is required'),
  body('transaction_type').isIn(['invoice', 'expense', 'payroll']).withMessage('Valid transaction type is required'),
  body('transaction_id').isInt().withMessage('Valid transaction ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('tax_amount').isFloat({ min: 0 }).withMessage('Tax amount must be positive'),
  body('date').isISO8601().withMessage('Valid date is required')
];

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Routes
router.get('/', taxRecordController.getAll);
router.get('/stats', taxRecordController.getStats);
router.get('/summary', taxRecordController.getTaxSummary);
router.get('/liability-report', taxRecordController.getTaxLiabilityReport);
router.get('/transaction/:transactionType/:transactionId', taxRecordController.getByTransaction);
router.get('/:id', taxRecordController.getById);
router.post('/', authMiddleware.restrictTo('admin', 'manager'), taxRecordValidation, taxRecordController.create);
router.put('/:id', authMiddleware.restrictTo('admin', 'manager'), taxRecordValidation, taxRecordController.update);
router.delete('/:id', authMiddleware.restrictTo('admin'), taxRecordController.delete);

module.exports = router;