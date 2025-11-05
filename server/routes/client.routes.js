const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Client validation rules
const clientValidation = [
  body('name').notEmpty().withMessage('Client name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('payment_terms').optional().isInt({ min: 0 }).withMessage('Payment terms must be a positive number')
];

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Routes
router.get('/', clientController.getAll);
router.get('/stats', clientController.getStats);
router.get('/:id', clientController.getById);
router.post('/', clientValidation, clientController.create);
router.put('/:id', clientValidation, clientController.update);
router.delete('/:id', authMiddleware.restrictTo('admin', 'manager'), clientController.delete);

module.exports = router;