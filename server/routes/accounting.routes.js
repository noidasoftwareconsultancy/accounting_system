const express = require('express');
const router = express.Router();
const accountingController = require('../controllers/accounting.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Account validation rules
const accountValidation = [
  body('account_number').notEmpty().withMessage('Account number is required'),
  body('name').notEmpty().withMessage('Account name is required'),
  body('type_id').isInt().withMessage('Valid account type ID is required'),
  body('parent_account_id').optional().isInt().withMessage('Valid parent account ID is required')
];

// Journal entry validation rules
const journalEntryValidation = [
  body('entry_number').notEmpty().withMessage('Entry number is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('ledger_entries').isArray({ min: 2 }).withMessage('At least two ledger entries are required'),
  body('ledger_entries.*.account_id').isInt().withMessage('Valid account ID is required'),
  body('ledger_entries.*.debit').optional().isFloat({ min: 0 }).withMessage('Debit must be positive'),
  body('ledger_entries.*.credit').optional().isFloat({ min: 0 }).withMessage('Credit must be positive')
];

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Account routes
router.get('/accounts', accountingController.getAllAccounts);
router.get('/accounts/types', accountingController.getAccountTypes);
router.get('/accounts/:id', accountingController.getAccountById);
router.post('/accounts', authMiddleware.restrictTo('admin', 'accountant'), accountValidation, accountingController.createAccount);
router.put('/accounts/:id', authMiddleware.restrictTo('admin', 'accountant'), accountValidation, accountingController.updateAccount);

// Journal entry routes
router.get('/journal-entries', accountingController.getAllJournalEntries);
router.get('/journal-entries/:id', accountingController.getJournalEntryById);
router.post('/journal-entries', authMiddleware.restrictTo('admin', 'accountant'), journalEntryValidation, accountingController.createJournalEntry);
router.patch('/journal-entries/:id/post', authMiddleware.restrictTo('admin', 'accountant'), accountingController.postJournalEntry);

// Reports
router.get('/trial-balance', accountingController.getTrialBalance);

module.exports = router;