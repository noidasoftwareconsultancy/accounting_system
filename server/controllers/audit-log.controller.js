const auditLogModel = require('../models/audit-log.model');

const auditLogController = {
  /**
   * Get all audit logs (admin only)
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const filters = {
        user_id: req.query.user_id,
        action: req.query.action,
        entity_type: req.query.entity_type,
        entity_id: req.query.entity_id,
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        search: req.query.search
      };

      const result = await auditLogModel.getAll(filters, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching audit logs'
      });
    }
  },

  /**
   * Get current user's audit logs
   */
  async getMyAuditLogs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const filters = {
        user_id: req.user.id,
        action: req.query.action,
        entity_type: req.query.entity_type,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const result = await auditLogModel.getAll(filters, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get my audit logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching your audit logs'
      });
    }
  },

  /**
   * Get audit log by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const auditLog = await auditLogModel.getById(id);

      if (!auditLog) {
        return res.status(404).json({
          success: false,
          message: 'Audit log not found'
        });
      }

      // Check access permissions
      if (auditLog.user_id !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: auditLog
      });
    } catch (error) {
      console.error('Get audit log error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching audit log'
      });
    }
  },

  /**
   * Get audit logs by entity
   */
  async getByEntity(req, res) {
    try {
      const { entityType, entityId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await auditLogModel.getByEntity(entityType, entityId, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get audit logs by entity error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching entity audit logs'
      });
    }
  },

  /**
   * Get audit logs by user (admin only)
   */
  async getByUser(req, res) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const filters = {
        action: req.query.action,
        entity_type: req.query.entity_type,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const result = await auditLogModel.getByUser(userId, filters, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get audit logs by user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user audit logs'
      });
    }
  },

  /**
   * Get audit log statistics (admin only)
   */
  async getStats(req, res) {
    try {
      const timeframe = req.query.timeframe || '30d'; // 7d, 30d, 90d, 1y
      const stats = await auditLogModel.getStats(timeframe);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get audit log stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching audit log statistics'
      });
    }
  },

  /**
   * Create audit log entry (internal use)
   */
  async createLog(req, res) {
    try {
      const logData = {
        ...req.body,
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('User-Agent')
      };

      const auditLog = await auditLogModel.create(logData);
      
      res.status(201).json({
        success: true,
        data: auditLog,
        message: 'Audit log created successfully'
      });
    } catch (error) {
      console.error('Create audit log error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating audit log'
      });
    }
  },

  /**
   * Cleanup old audit logs (admin only)
   */
  async cleanup(req, res) {
    try {
      const days = parseInt(req.query.days) || 365; // Default: keep 1 year
      const result = await auditLogModel.cleanup(days);

      res.json({
        success: true,
        data: result,
        message: `Cleaned up audit logs older than ${days} days`
      });
    } catch (error) {
      console.error('Cleanup audit logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Error cleaning up audit logs'
      });
    }
  },

  /**
   * Export audit logs (admin only)
   */
  async exportLogs(req, res) {
    try {
      const filters = {
        user_id: req.query.user_id,
        action: req.query.action,
        entity_type: req.query.entity_type,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const format = req.query.format || 'json'; // json, csv
      const result = await auditLogModel.exportLogs(filters, format);

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.json');
      }

      res.send(result);
    } catch (error) {
      console.error('Export audit logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Error exporting audit logs'
      });
    }
  }
};

module.exports = auditLogController;