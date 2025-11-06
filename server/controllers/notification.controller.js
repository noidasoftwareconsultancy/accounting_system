const notificationModel = require('../models/notification.model');
const { validationResult } = require('express-validator');

const notificationController = {
  /**
   * Get all notifications (admin only)
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        user_id: req.query.user_id,
        notification_type: req.query.notification_type,
        is_read: req.query.is_read,
        search: req.query.search
      };

      const result = await notificationModel.getAll(filters, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching notifications'
      });
    }
  },

  /**
   * Get current user's notifications
   */
  async getMyNotifications(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        user_id: req.user.id,
        notification_type: req.query.notification_type,
        is_read: req.query.is_read
      };

      const result = await notificationModel.getAll(filters, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get my notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching your notifications'
      });
    }
  },

  /**
   * Get unread notifications for current user
   */
  async getUnreadNotifications(req, res) {
    try {
      const notifications = await notificationModel.getUnreadByUser(req.user.id);
      
      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      console.error('Get unread notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching unread notifications'
      });
    }
  },

  /**
   * Get notification by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const notification = await notificationModel.getById(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      // Check if user can access this notification
      if (notification.user_id !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      console.error('Get notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching notification'
      });
    }
  },

  /**
   * Create new notification
   */
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const notification = await notificationModel.create(req.body);
      
      res.status(201).json({
        success: true,
        data: notification,
        message: 'Notification created successfully'
      });
    } catch (error) {
      console.error('Create notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating notification'
      });
    }
  },

  /**
   * Create bulk notifications
   */
  async createBulk(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { user_ids, title, message, notification_type, reference_type, reference_id } = req.body;
      
      const notifications = await notificationModel.createBulk({
        user_ids,
        title,
        message,
        notification_type,
        reference_type,
        reference_id
      });
      
      res.status(201).json({
        success: true,
        data: notifications,
        message: `${notifications.length} notifications created successfully`
      });
    } catch (error) {
      console.error('Create bulk notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating bulk notifications'
      });
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const notification = await notificationModel.markAsRead(id, req.user.id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found or access denied'
        });
      }

      res.json({
        success: true,
        data: notification,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Error marking notification as read'
      });
    }
  },

  /**
   * Mark all notifications as read for current user
   */
  async markAllAsRead(req, res) {
    try {
      const count = await notificationModel.markAllAsRead(req.user.id);

      res.json({
        success: true,
        message: `${count} notifications marked as read`
      });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Error marking all notifications as read'
      });
    }
  },

  /**
   * Delete notification
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await notificationModel.delete(id, req.user.id, req.user.role);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found or access denied'
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting notification'
      });
    }
  },

  /**
   * Delete multiple notifications
   */
  async deleteBulk(req, res) {
    try {
      const { notification_ids } = req.body;
      
      if (!Array.isArray(notification_ids) || notification_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Notification IDs array is required'
        });
      }

      const count = await notificationModel.deleteBulk(notification_ids, req.user.id, req.user.role);

      res.json({
        success: true,
        message: `${count} notifications deleted successfully`
      });
    } catch (error) {
      console.error('Delete bulk notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting notifications'
      });
    }
  },

  /**
   * Get notification statistics
   */
  async getStats(req, res) {
    try {
      const stats = await notificationModel.getStats(req.user.id, req.user.role);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get notification stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching notification statistics'
      });
    }
  },

  /**
   * Broadcast notification to all users
   */
  async broadcastToAll(req, res) {
    try {
      const { title, message, notification_type } = req.body;
      
      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Title and message are required'
        });
      }

      const notifications = await notificationModel.broadcastToAll({
        title,
        message,
        notification_type
      });
      
      res.status(201).json({
        success: true,
        data: notifications,
        message: `Notification broadcasted to ${notifications.length} users`
      });
    } catch (error) {
      console.error('Broadcast to all error:', error);
      res.status(500).json({
        success: false,
        message: 'Error broadcasting notification'
      });
    }
  },

  /**
   * Broadcast notification to department
   */
  async broadcastToDepartment(req, res) {
    try {
      const { department } = req.params;
      const { title, message, notification_type } = req.body;
      
      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Title and message are required'
        });
      }

      const notifications = await notificationModel.broadcastToDepartment(department, {
        title,
        message,
        notification_type
      });
      
      res.status(201).json({
        success: true,
        data: notifications,
        message: `Notification broadcasted to ${notifications.length} users in ${department} department`
      });
    } catch (error) {
      console.error('Broadcast to department error:', error);
      res.status(500).json({
        success: false,
        message: 'Error broadcasting notification to department'
      });
    }
  }
};

module.exports = notificationController;