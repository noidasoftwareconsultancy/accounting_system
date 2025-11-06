const express = require('express');
const router = express.Router();
const accountTypeController = require('../controllers/account-type.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Account type validation rules
const accountTypeValidation = [
  body('name').notEmpty().withMessage('Account type name is required'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty')
];

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Routes
router.get('/', accountTypeController.getAll);
router.get('/stats', accountTypeController.getStats);
router.get('/:id', accountTypeController.getById);
router.post('/', authMiddleware.restrictTo('admin', 'manager'), accountTypeValidation, accountTypeController.create);
router.put('/:id', authMiddleware.restrictTo('admin', 'manager'), accountTypeValidation, accountTypeController.update);
router.delete('/:id', authMiddleware.restrictTo('admin'), accountTypeController.delete);

module.exports = router;