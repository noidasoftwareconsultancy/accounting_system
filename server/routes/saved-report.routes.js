const express = require('express');
const router = express.Router();
const savedReportController = require('../controllers/saved-report.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Saved report validation rules
const savedReportValidation = [
  body('name').notEmpty().withMessage('Report name is required'),
  body('template_id').optional().isInt().withMessage('Valid template ID is required'),
  body('parameters').optional().isObject().withMessage('Parameters must be an object'),
  body('result_data').optional().isObject().withMessage('Result data must be an object')
];

// Execute and save validation rules
const executeAndSaveValidation = [
  body('templateId').isInt().withMessage('Valid template ID is required'),
  body('name').notEmpty().withMessage('Report name is required'),
  body('parameters').optional().isObject().withMessage('Parameters must be an object')
];

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Routes
router.get('/', savedReportController.getAll);
router.get('/stats', savedReportController.getStats);
router.get('/my-reports', savedReportController.getMyReports);
router.get('/template/:templateId', savedReportController.getByTemplate);
router.get('/user/:userId', savedReportController.getByUser);
router.get('/:id', savedReportController.getById);
router.get('/:id/export', savedReportController.exportData);
router.post('/', savedReportValidation, savedReportController.create);
router.post('/execute-and-save', executeAndSaveValidation, savedReportController.executeAndSave);
router.post('/:id/regenerate', savedReportController.regenerate);
router.put('/:id', savedReportValidation, savedReportController.update);
router.delete('/:id', savedReportController.delete);

module.exports = router;