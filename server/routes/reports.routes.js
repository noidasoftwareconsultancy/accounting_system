const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Report template validation rules
const reportTemplateValidation = [
  body('name').notEmpty().withMessage('Report name is required'),
  body('report_type').notEmpty().withMessage('Report type is required'),
  body('description').optional({ nullable: true, checkFalsy: true }).isLength({ min: 1 }).withMessage('Description cannot be empty'),
  body('query_template').optional({ nullable: true, checkFalsy: true }).isLength({ min: 1 }).withMessage('Query template cannot be empty'),
  body('parameters').optional().isObject().withMessage('Parameters must be an object')
];

// Report execution validation rules
const reportExecutionValidation = [
  body('parameters').optional().isObject().withMessage('Parameters must be an object'),
  body('save_report').optional().isBoolean().withMessage('Save report must be a boolean')
];

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Report template routes (read access for all authenticated users)
router.get('/templates', reportsController.getAllReportTemplates);
router.get('/templates/:id', reportsController.getReportTemplateById);

// Report template modification routes (restricted to admin/accountant)
router.post('/templates', authMiddleware.restrictTo('admin', 'accountant'), reportTemplateValidation, reportsController.createReportTemplate);
router.put('/templates/:id', authMiddleware.restrictTo('admin', 'accountant'), reportTemplateValidation, reportsController.updateReportTemplate);
router.delete('/templates/:id', authMiddleware.restrictTo('admin', 'accountant'), reportsController.deleteReportTemplate);

// Report execution routes (all authenticated users can execute reports)
router.post('/templates/:id/execute', reportExecutionValidation, reportsController.executeReportTemplate);

// Saved reports routes (read access for all authenticated users)
router.get('/saved', reportsController.getSavedReports);
router.get('/saved/:id', reportsController.getSavedReportById);
router.delete('/saved/:id', reportsController.deleteSavedReport); // Users can delete their own saved reports

// Test route (no auth required for testing)
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Reports API is working',
    timestamp: new Date().toISOString()
  });
});

// Utility routes
router.get('/types', reportsController.getReportTypes);
router.get('/parameters/:type/options', reportsController.getParameterOptions);

module.exports = router;