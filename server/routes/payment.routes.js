const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Payment validation rules
const paymentValidation = [
  body('invoice_id').isInt().withMessage('Valid invoice ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Payment amount must be greater than 0'),
  body('payment_date').isISO8601().withMessage('Valid payment date is required'),
  body('payment_method').optional().notEmpty().withMessage('Payment method cannot be empty'),
  body('reference_number').optional().notEmpty().withMessage('Reference number cannot be empty'),
  body('notes').optional().notEmpty().withMessage('Notes cannot be empty')
];

// Apply authentication middleware to all routes
router.use(authMiddleware.protect);

// Payment routes
router.get('/', paymentController.getAll);
router.get('/stats', paymentController.getStats);
router.get('/:id', paymentController.getById);
router.post('/', paymentValidation, paymentController.create);
router.put('/:id', paymentValidation, paymentController.update);
router.delete('/:id', authMiddleware.restrictTo('admin', 'manager'), paymentController.delete);

// Get payments by invoice
router.get('/invoice/:invoiceId', paymentController.getByInvoice);

module.exports = router;