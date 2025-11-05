const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Invoice validation rules
const invoiceValidation = [
  body('client_id').isInt().withMessage('Valid client ID is required'),
  body('issue_date').isISO8601().withMessage('Valid issue date is required'),
  body('due_date').isISO8601().withMessage('Valid due date is required'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled']).withMessage('Invalid status'),
  body('items').optional().isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.description').notEmpty().withMessage('Item description is required'),
  body('items.*.quantity').isFloat({ min: 0.01 }).withMessage('Item quantity must be greater than 0'),
  body('items.*.unit_price').isFloat({ min: 0 }).withMessage('Item unit price must be positive')
];

// Payment validation rules
const paymentValidation = [
  body('invoice_id').isInt().withMessage('Valid invoice ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Payment amount must be greater than 0'),
  body('payment_date').isISO8601().withMessage('Valid payment date is required'),
  body('payment_method').optional().notEmpty().withMessage('Payment method cannot be empty')
];

// Apply authentication middleware to all routes
router.use(authMiddleware.protect);

// Invoice routes
router.get('/', invoiceController.getAll);
router.get('/stats', invoiceController.getStats);
router.get('/:id', invoiceController.getById);
router.post('/', invoiceValidation, invoiceController.create);
router.put('/:id', invoiceValidation, invoiceController.update);
router.delete('/:id', authMiddleware.restrictTo('admin', 'manager'), invoiceController.delete);

// Payment routes
router.post('/payments', paymentValidation, invoiceController.recordPayment);
router.post('/:id/payments', paymentValidation, invoiceController.recordPayment);

// Legacy routes for backward compatibility
router.get('/invoices', invoiceController.getAllInvoices);
router.get('/invoices/:id', invoiceController.getInvoiceById);
router.post('/invoices', invoiceController.createInvoice);
router.put('/invoices/:id', invoiceController.updateInvoice);
router.delete('/invoices/:id', invoiceController.deleteInvoice);

module.exports = router;