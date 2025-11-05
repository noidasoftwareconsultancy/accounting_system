const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Project validation rules
const projectValidation = [
  body('name').notEmpty().withMessage('Project name is required'),
  body('client_id').isInt().withMessage('Valid client ID is required'),
  body('start_date').optional().isDate().withMessage('Valid start date is required'),
  body('end_date').optional().isDate().withMessage('Valid end date is required'),
  body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('status').optional().isIn(['active', 'completed', 'on_hold', 'cancelled']).withMessage('Invalid status')
];

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Routes
router.get('/', projectController.getAll);
router.get('/stats', projectController.getStats);
router.get('/:id', projectController.getById);
router.get('/:id/financial-summary', projectController.getFinancialSummary);
router.post('/', projectValidation, projectController.create);
router.put('/:id', projectValidation, projectController.update);
router.delete('/:id', authMiddleware.restrictTo('admin', 'manager'), projectController.delete);

module.exports = router;