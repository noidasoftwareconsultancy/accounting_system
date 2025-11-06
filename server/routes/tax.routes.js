const express = require('express');
const router = express.Router();
const taxController = require('../controllers/tax.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Tax rate validation rules
const taxRateValidation = [
  body('name').notEmpty().withMessage('Tax name is required'),
  body('rate').isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be between 0 and 100'),
  body('type').notEmpty().withMessage('Tax type is required'),
  body('is_active').optional().isBoolean().withMessage('Active status must be a boolean')
];

// Tax record validation rules
const taxRecordValidation = [
  body('tax_rate_id').isInt({ min: 1 }).withMessage('Valid tax rate ID is required'),
  body('transaction_type').isIn(['invoice', 'expense', 'payroll']).withMessage('Invalid transaction type'),
  body('transaction_id').isInt({ min: 1 }).withMessage('Valid transaction ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('tax_amount').isFloat({ min: 0 }).withMessage('Tax amount must be a positive number'),
  body('date').isISO8601().withMessage('Valid date is required')
];

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Tax rates routes (read access for all authenticated users)
router.get('/rates', taxController.getAllTaxRates);
router.get('/rates/:id', taxController.getTaxRateById);

// Tax rate modification routes (restricted to admin/accountant)
router.post('/rates', authMiddleware.restrictTo('admin', 'accountant'), taxRateValidation, taxController.createTaxRate);
router.put('/rates/:id', authMiddleware.restrictTo('admin', 'accountant'), taxRateValidation, taxController.updateTaxRate);
router.delete('/rates/:id', authMiddleware.restrictTo('admin', 'accountant'), taxController.deleteTaxRate);

// Tax records routes (read access for all authenticated users)
router.get('/records', taxController.getTaxRecords);
router.post('/records', authMiddleware.restrictTo('admin', 'accountant'), taxRecordValidation, taxController.createTaxRecord);

// Tax reports routes (all authenticated users can view reports)
router.get('/reports/summary', taxController.getTaxSummaryReport);
router.get('/reports/collection', taxController.getTaxCollectionReport);
router.get('/reports/liability', taxController.getTaxLiabilityReport);
router.get('/reports/compliance', taxController.getTaxComplianceReport);

// Utility routes
router.get('/types', taxController.getTaxTypes);

module.exports = router;