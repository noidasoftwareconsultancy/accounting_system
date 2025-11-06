const express = require('express');
const router = express.Router();
const dashboardWidgetController = require('../controllers/dashboard-widget.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Dashboard validation rules
const dashboardValidation = [
  body('name').notEmpty().withMessage('Dashboard name is required'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('layout').optional().isObject().withMessage('Layout must be an object'),
  body('is_default').optional().isBoolean().withMessage('Default status must be boolean')
];

// Widget validation rules
const widgetValidation = [
  body('dashboard_id').isInt().withMessage('Valid dashboard ID is required'),
  body('widget_type').notEmpty().withMessage('Widget type is required'),
  body('title').notEmpty().withMessage('Widget title is required'),
  body('data_source').optional().notEmpty().withMessage('Data source cannot be empty'),
  body('parameters').optional().isObject().withMessage('Parameters must be an object'),
  body('position').optional().isObject().withMessage('Position must be an object')
];

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Dashboard routes
router.get('/dashboards', dashboardWidgetController.getAllDashboards);
router.get('/dashboards/my', dashboardWidgetController.getMyDashboards);
router.get('/dashboards/default', dashboardWidgetController.getDefaultDashboard);
router.get('/dashboards/:id', dashboardWidgetController.getDashboardById);
router.post('/dashboards', dashboardValidation, dashboardWidgetController.createDashboard);
router.put('/dashboards/:id', dashboardValidation, dashboardWidgetController.updateDashboard);
router.patch('/dashboards/:id/set-default', dashboardWidgetController.setDefaultDashboard);
router.delete('/dashboards/:id', dashboardWidgetController.deleteDashboard);

// Widget routes
router.get('/widgets', dashboardWidgetController.getAllWidgets);
router.get('/widgets/dashboard/:dashboardId', dashboardWidgetController.getWidgetsByDashboard);
router.get('/widgets/:id', dashboardWidgetController.getWidgetById);
router.get('/widgets/:id/data', dashboardWidgetController.getWidgetData);
router.post('/widgets', widgetValidation, dashboardWidgetController.createWidget);
router.put('/widgets/:id', widgetValidation, dashboardWidgetController.updateWidget);
router.patch('/widgets/:id/position', dashboardWidgetController.updateWidgetPosition);
router.delete('/widgets/:id', dashboardWidgetController.deleteWidget);

// Widget types and data sources
router.get('/widget-types', dashboardWidgetController.getAvailableWidgetTypes);
router.get('/data-sources', dashboardWidgetController.getAvailableDataSources);

// Bulk operations
router.post('/widgets/bulk-update-positions', dashboardWidgetController.bulkUpdateWidgetPositions);
router.post('/dashboards/:id/duplicate', dashboardWidgetController.duplicateDashboard);

module.exports = router;