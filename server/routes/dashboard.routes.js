const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Dashboard routes
router.get('/', dashboardController.getDashboardData);
router.get('/financial-overview', dashboardController.getFinancialOverview);

// Notification routes
router.get('/notifications', dashboardController.getNotifications);
router.patch('/notifications/:notificationId/read', dashboardController.markNotificationAsRead);
router.delete('/notifications/:notificationId', dashboardController.deleteNotification);

module.exports = router;