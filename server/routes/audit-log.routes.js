const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/audit-log.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Audit log routes (read-only for most users, admin can manage)
router.get('/', authMiddleware.restrictTo('admin', 'manager'), auditLogController.getAll);
router.get('/my', auditLogController.getMyAuditLogs);
router.get('/stats', authMiddleware.restrictTo('admin', 'manager'), auditLogController.getStats);
router.get('/entity/:entityType/:entityId', auditLogController.getByEntity);
router.get('/user/:userId', authMiddleware.restrictTo('admin', 'manager'), auditLogController.getByUser);
router.get('/:id', auditLogController.getById);

// Admin only routes
router.delete('/cleanup', authMiddleware.restrictTo('admin'), auditLogController.cleanup);
router.get('/export', authMiddleware.restrictTo('admin'), auditLogController.exportLogs);

// System routes (for internal use)
router.post('/log', auditLogController.createLog); // This should be called internally, not exposed publicly

module.exports = router;