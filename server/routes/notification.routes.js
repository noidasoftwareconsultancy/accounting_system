const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Notification validation rules
const notificationValidation = [
  body('user_id').isInt().withMessage('Valid user ID is required'),
  body('title').notEmpty().withMessage('Notification title is required'),
  body('message').notEmpty().withMessage('Notification message is required'),
  body('notification_type').optional().notEmpty().withMessage('Notification type cannot be empty'),
  body('reference_type').optional().notEmpty().withMessage('Reference type cannot be empty'),
  body('reference_id').optional().isInt().withMessage('Valid reference ID is required')
];

// Bulk notification validation rules
const bulkNotificationValidation = [
  body('user_ids').isArray({ min: 1 }).withMessage('At least one user ID is required'),
  body('user_ids.*').isInt().withMessage('Valid user IDs are required'),
  body('title').notEmpty().withMessage('Notification title is required'),
  body('message').notEmpty().withMessage('Notification message is required'),
  body('notification_type').optional().notEmpty().withMessage('Notification type cannot be empty')
];

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Notification routes
router.get('/', notificationController.getAll);
router.get('/my', notificationController.getMyNotifications);
router.get('/unread', notificationController.getUnreadNotifications);
router.get('/stats', notificationController.getStats);
router.get('/:id', notificationController.getById);
router.post('/', authMiddleware.restrictTo('admin', 'manager'), notificationValidation, notificationController.create);
router.post('/bulk', authMiddleware.restrictTo('admin', 'manager'), bulkNotificationValidation, notificationController.createBulk);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/mark-all-read', notificationController.markAllAsRead);
router.delete('/:id', notificationController.delete);
router.delete('/bulk', notificationController.deleteBulk);

// System notification routes (admin only)
router.post('/system/broadcast', authMiddleware.restrictTo('admin'), notificationController.broadcastToAll);
router.post('/system/department/:department', authMiddleware.restrictTo('admin'), notificationController.broadcastToDepartment);

module.exports = router;