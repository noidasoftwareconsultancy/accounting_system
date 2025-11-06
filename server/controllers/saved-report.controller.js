const savedReportModel = require('../models/saved-report.model');
const { validationResult } = require('express-validator');

const savedReportController = {
  /**
   * Get all saved reports
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        template_id: req.query.template_id,
        created_by: req.query.created_by,
        search: req.query.search
      };

      const result = await savedReportModel.getAll(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get saved reports error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching saved reports'
      });
    }
  },

  /**
   * Get saved report by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const report = await savedReportModel.getById(id);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Saved report not found'
        });
      }

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Get saved report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching saved report'
      });
    }
  },

  /**
   * Create new saved report
   */
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const reportData = {
        ...req.body,
        created_by: req.user.id
      };

      const report = await savedReportModel.create(reportData);

      res.status(201).json({
        success: true,
        message: 'Saved report created successfully',
        data: report
      });
    } catch (error) {
      console.error('Create saved report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating saved report'
      });
    }
  },

  /**
   * Update saved report
   */
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const report = await savedReportModel.update(id, req.body);

      res.json({
        success: true,
        message: 'Saved report updated successfully',
        data: report
      });
    } catch (error) {
      console.error('Update saved report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating saved report'
      });
    }
  },

  /**
   * Delete saved report
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await savedReportModel.delete(id);

      res.json({
        success: true,
        message: 'Saved report deleted successfully'
      });
    } catch (error) {
      console.error('Delete saved report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting saved report'
      });
    }
  },

  /**
   * Get reports by template
   */
  async getByTemplate(req, res) {
    try {
      const { templateId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await savedReportModel.getByTemplate(templateId, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get reports by template error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching reports by template'
      });
    }
  },

  /**
   * Get reports by user
   */
  async getByUser(req, res) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await savedReportModel.getByUser(userId, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get reports by user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user reports'
      });
    }
  },

  /**
   * Execute and save report
   */
  async executeAndSave(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { templateId, parameters, name } = req.body;
      
      const report = await savedReportModel.executeAndSave(
        templateId,
        parameters,
        name,
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: 'Report executed and saved successfully',
        data: report
      });
    } catch (error) {
      console.error('Execute and save report error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Regenerate report data
   */
  async regenerate(req, res) {
    try {
      const { id } = req.params;
      
      const report = await savedReportModel.regenerate(id);

      res.json({
        success: true,
        message: 'Report regenerated successfully',
        data: report
      });
    } catch (error) {
      console.error('Regenerate report error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Export report data
   */
  async exportData(req, res) {
    try {
      const { id } = req.params;
      const format = req.query.format || 'json';

      const exportedData = await savedReportModel.exportData(id, format);
      
      // Set appropriate headers based on format
      switch (format.toLowerCase()) {
        case 'csv':
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="report-${id}.csv"`);
          break;
        case 'json':
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', `attachment; filename="report-${id}.json"`);
          break;
        default:
          res.setHeader('Content-Type', 'application/octet-stream');
      }

      res.send(exportedData);
    } catch (error) {
      console.error('Export report error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get my reports (current user)
   */
  async getMyReports(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await savedReportModel.getByUser(req.user.id, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get my reports error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching your reports'
      });
    }
  },

  /**
   * Get saved report statistics
   */
  async getStats(req, res) {
    try {
      const stats = await savedReportModel.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get saved report stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching saved report statistics'
      });
    }
  }
};

module.exports = savedReportController;