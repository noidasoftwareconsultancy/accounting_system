const express = require('express');
const router = express.Router();
const reportTemplateController = require('../controllers/report-template.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Report template validation rules
const reportTemplateValidation = [
  body('name').notEmpty().withMessage('Template name is required'),
  body('report_type').notEmpty().withMessage('Report type is required'),
  body('query_template').optional().notEmpty().withMessage('Query template cannot be empty'),
  body('parameters').optional().isObject().withMessage('Parameters must be an object')
];

// Execute template validation rules
const executeTemplateValidation = [
  body('parameters').optional().isObject().withMessage('Parameters must be an object')
];

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Routes
router.get('/', reportTemplateController.getAll);
router.get('/stats', reportTemplateController.getStats);
router.get('/predefined', reportTemplateController.getPredefinedTemplates);
router.get('/type/:reportType', reportTemplateController.getByType);
router.get('/:id', reportTemplateController.getById);
router.post('/', authMiddleware.restrictTo('admin', 'manager'), reportTemplateValidation, reportTemplateController.create);
router.post('/predefined/:templateIndex/install', authMiddleware.restrictTo('admin', 'manager'), reportTemplateController.installPredefinedTemplate);
router.post('/:id/execute', executeTemplateValidation, reportTemplateController.executeTemplate);
router.put('/:id', authMiddleware.restrictTo('admin', 'manager'), reportTemplateValidation, reportTemplateController.update);
router.delete('/:id', authMiddleware.restrictTo('admin'), reportTemplateController.delete);

module.exports = router;