const express = require('express');
const router = express.Router();
const automationController = require('../controllers/automation.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Automation rule validation rules
const automationRuleValidation = [
  body('name').notEmpty().withMessage('Rule name is required'),
  body('trigger_event').notEmpty().withMessage('Trigger event is required'),
  body('trigger_conditions').optional().isObject().withMessage('Trigger conditions must be an object'),
  body('actions').isArray({ min: 1 }).withMessage('At least one action is required'),
  body('actions').custom((actions) => {
    if (!Array.isArray(actions)) return false;
    return actions.every(action => 
      action && typeof action === 'object' && action.type && action.parameters
    );
  }).withMessage('Each action must have type and parameters'),
  body('is_active').optional().isBoolean().withMessage('Active status must be boolean')
];

// Scheduled task validation rules
const scheduledTaskValidation = [
  body('name').notEmpty().withMessage('Task name is required'),
  body('task_type').notEmpty().withMessage('Task type is required'),
  body('frequency').isIn(['once', 'daily', 'weekly', 'monthly', 'custom']).withMessage('Invalid frequency'),
  body('cron_expression').optional().notEmpty().withMessage('Cron expression cannot be empty'),
  body('parameters').optional().isObject().withMessage('Parameters must be an object'),
  body('next_run').optional().isISO8601().withMessage('Valid next run date is required')
];

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Automation rules routes
router.get('/rules', automationController.getAllRules);
router.get('/rules/stats', automationController.getRulesStats);
router.get('/rules/active', automationController.getActiveRules);
router.get('/rules/:id', automationController.getRuleById);
router.post('/rules', authMiddleware.restrictTo('admin', 'manager'), automationRuleValidation, automationController.createRule);
router.put('/rules/:id', authMiddleware.restrictTo('admin', 'manager'), automationRuleValidation, automationController.updateRule);
router.patch('/rules/:id/toggle', authMiddleware.restrictTo('admin', 'manager'), automationController.toggleRule);
router.delete('/rules/:id', authMiddleware.restrictTo('admin'), automationController.deleteRule);

// Scheduled tasks routes
router.get('/tasks', automationController.getAllTasks);
router.get('/tasks/stats', automationController.getTasksStats);
router.get('/tasks/upcoming', automationController.getUpcomingTasks);
router.get('/tasks/:id', automationController.getTaskById);
router.post('/tasks', authMiddleware.restrictTo('admin', 'manager'), scheduledTaskValidation, automationController.createTask);
router.put('/tasks/:id', authMiddleware.restrictTo('admin', 'manager'), scheduledTaskValidation, automationController.updateTask);
router.patch('/tasks/:id/toggle', authMiddleware.restrictTo('admin', 'manager'), automationController.toggleTask);
router.post('/tasks/:id/run', authMiddleware.restrictTo('admin', 'manager'), automationController.runTask);
router.delete('/tasks/:id', authMiddleware.restrictTo('admin'), automationController.deleteTask);

// Utility routes
router.get('/events/available', automationController.getAvailableEvents);
router.get('/actions/available', automationController.getAvailableActions);
router.post('/rules/test', authMiddleware.restrictTo('admin', 'manager'), automationController.testRule);

module.exports = router;