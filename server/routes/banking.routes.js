const express = require('express');
const router = express.Router();
const bankingController = require('../controllers/banking.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Bank account validation rules
const bankAccountValidation = [
  body('account_name').notEmpty().withMessage('Account name is required'),
  body('account_number').notEmpty().withMessage('Account number is required'),
  body('bank_name').notEmpty().withMessage('Bank name is required'),
  body('account_type').optional().notEmpty().withMessage('Account type cannot be empty'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('opening_balance').optional().isFloat().withMessage('Opening balance must be a number')
];

// Bank transaction validation rules
const transactionValidation = [
  body('bank_account_id').isInt().withMessage('Valid bank account ID is required'),
  body('transaction_type').isIn(['deposit', 'withdrawal', 'transfer']).withMessage('Invalid transaction type'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('transaction_date').isISO8601().withMessage('Valid transaction date is required'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty')
];

// Payment gateway validation rules
const paymentGatewayValidation = [
  body('name').notEmpty().withMessage('Gateway name is required'),
  body('api_key').optional().notEmpty().withMessage('API key cannot be empty'),
  body('secret_key').optional().notEmpty().withMessage('Secret key cannot be empty')
];

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Bank account routes
router.get('/accounts', bankingController.getAllBankAccounts);
router.get('/accounts/stats', bankingController.getStats);
router.get('/accounts/:id', bankingController.getBankAccountById);
router.post('/accounts', authMiddleware.restrictTo('admin', 'accountant'), bankAccountValidation, bankingController.createBankAccount);
router.put('/accounts/:id', authMiddleware.restrictTo('admin', 'accountant'), bankAccountValidation, bankingController.updateBankAccount);

// Transaction routes
router.get('/transactions', bankingController.getTransactions);
router.post('/transactions', authMiddleware.restrictTo('admin', 'accountant'), transactionValidation, bankingController.createTransaction);
router.patch('/transactions/:transactionId/reconcile', authMiddleware.restrictTo('admin', 'accountant'), bankingController.reconcileTransaction);

// Payment gateway routes
router.get('/gateways', bankingController.getPaymentGateways);
router.post('/gateways', authMiddleware.restrictTo('admin'), paymentGatewayValidation, bankingController.createPaymentGateway);

module.exports = router;