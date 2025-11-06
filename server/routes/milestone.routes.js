const express = require('express');
const router = express.Router();
const milestoneController = require('../controllers/milestone.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Milestone validation rules
const milestoneValidation = [
  body('project_id').isInt().withMessage('Valid project ID is required'),
  body('title').notEmpty().withMessage('Milestone title is required'),
  body('due_date').optional().isISO8601().withMessage('Valid due date is required'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status')
];

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Milestone routes
router.get('/', milestoneController.getAll);
router.get('/stats', milestoneController.getStats);
router.get('/upcoming', milestoneController.getUpcoming);
router.get('/overdue', milestoneController.getOverdue);
router.get('/project/:projectId', milestoneController.getByProject);
router.get('/:id', milestoneController.getById);
router.post('/', milestoneValidation, milestoneController.create);
router.put('/:id', milestoneValidation, milestoneController.update);
router.patch('/:id/status', milestoneController.updateStatus);
router.patch('/:id/complete', milestoneController.markComplete);
router.patch('/:id/generate-invoice', milestoneController.generateInvoice);
router.delete('/:id', authMiddleware.restrictTo('admin', 'manager'), milestoneController.delete);

module.exports = router;