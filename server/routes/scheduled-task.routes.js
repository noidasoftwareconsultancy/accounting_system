const express = require('express');
const router = express.Router();
const scheduledTaskController = require('../controllers/scheduled-task.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Scheduled task validation rules
const scheduledTaskValidation = [
  body('name').notEmpty().withMessage('Task name is required'),
  body('task_type').notEmpty().withMessage('Task type is required'),
  body('frequency').isIn(['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Valid frequency is required'),
  body('cron_expression').optional().notEmpty().withMessage('Cron expression cannot be empty'),
  body('parameters').optional().isObject().withMessage('Parameters must be an object'),
  body('is_active').optional().isBoolean().withMessage('Active status must be boolean')
];

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Routes
router.get('/', scheduledTaskController.getAll);
router.get('/stats', scheduledTaskController.getStats);
router.get('/due', authMiddleware.restrictTo('admin', 'manager'), scheduledTaskController.getTasksDue);
router.get('/task-types', scheduledTaskController.getTaskTypes);
router.get('/:id', scheduledTaskController.getById);
router.get('/:id/execution-history', scheduledTaskController.getExecutionHistory);
router.post('/', authMiddleware.restrictTo('admin', 'manager'), scheduledTaskValidation, scheduledTaskController.create);
router.post('/:id/execute', authMiddleware.restrictTo('admin', 'manager'), scheduledTaskController.executeTask);
router.patch('/:id/toggle-active', authMiddleware.restrictTo('admin', 'manager'), scheduledTaskController.toggleActive);
router.put('/:id', authMiddleware.restrictTo('admin', 'manager'), scheduledTaskValidation, scheduledTaskController.update);
router.delete('/:id', authMiddleware.restrictTo('admin'), scheduledTaskController.delete);

module.exports = router;