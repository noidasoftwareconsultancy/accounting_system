const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Vendor validation rules
const vendorValidation = [
  body('name').notEmpty().withMessage('Vendor name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isLength({ min: 1 }).withMessage('Phone number cannot be empty'),
  body('payment_terms').optional().isInt({ min: 0 }).withMessage('Payment terms must be positive')
];

// Apply authentication middleware to all vendor routes
router.use(authMiddleware.protect);

// Vendor routes
router.get('/', vendorController.getAll);
router.get('/stats', vendorController.getStats);
router.get('/trends', vendorController.getVendorsWithTrends);
router.get('/search', vendorController.search);
router.get('/:id', vendorController.getById);
router.get('/:id/expenses', vendorController.getExpenseSummary);
router.get('/:id/analysis', vendorController.getPaymentAnalysis);
router.post('/', vendorValidation, vendorController.create);
router.put('/:id', vendorValidation, vendorController.update);
router.delete('/:id', authMiddleware.restrictTo('admin', 'manager'), vendorController.delete);

module.exports = router;