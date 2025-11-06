const express = require('express');
const router = express.Router();
const creditNoteController = require('../controllers/credit-note.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Credit note validation rules
const creditNoteValidation = [
  body('invoice_id').isInt().withMessage('Valid invoice ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('issue_date').isISO8601().withMessage('Valid issue date is required'),
  body('reason').optional().notEmpty().withMessage('Reason cannot be empty'),
  body('status').optional().isIn(['draft', 'issued', 'applied', 'cancelled']).withMessage('Invalid status')
];

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Credit note routes
router.get('/', creditNoteController.getAll);
router.get('/stats', creditNoteController.getStats);
router.get('/invoice/:invoiceId', creditNoteController.getByInvoice);
router.get('/:id', creditNoteController.getById);
router.post('/', creditNoteValidation, creditNoteController.create);
router.put('/:id', creditNoteValidation, creditNoteController.update);
router.patch('/:id/status', creditNoteController.updateStatus);
router.patch('/:id/apply', creditNoteController.applyCreditNote);
router.delete('/:id', authMiddleware.restrictTo('admin', 'manager'), creditNoteController.delete);

// Additional operations
router.get('/:id/pdf', creditNoteController.getCreditNotePDF);
router.post('/generate-number', creditNoteController.generateCreditNoteNumber);

module.exports = router;