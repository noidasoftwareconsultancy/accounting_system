const reportTemplateModel = require('../models/report-template.model');
const { validationResult } = require('express-validator');

const reportTemplateController = {
  /**
   * Get all report templates
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        report_type: req.query.report_type,
        search: req.query.search
      };

      const result = await reportTemplateModel.getAll(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get report templates error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching report templates'
      });
    }
  },

  /**
   * Get report template by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const template = await reportTemplateModel.getById(id);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Report template not found'
        });
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Get report template error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching report template'
      });
    }
  },

  /**
   * Create new report template
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

      const templateData = {
        ...req.body,
        created_by: req.user.id
      };

      const template = await reportTemplateModel.create(templateData);

      res.status(201).json({
        success: true,
        message: 'Report template created successfully',
        data: template
      });
    } catch (error) {
      console.error('Create report template error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating report template'
      });
    }
  },

  /**
   * Update report template
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
      const template = await reportTemplateModel.update(id, req.body);

      res.json({
        success: true,
        message: 'Report template updated successfully',
        data: template
      });
    } catch (error) {
      console.error('Update report template error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating report template'
      });
    }
  },

  /**
   * Delete report template
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await reportTemplateModel.delete(id);

      res.json({
        success: true,
        message: 'Report template deleted successfully'
      });
    } catch (error) {
      console.error('Delete report template error:', error);
      if (error.message.includes('Cannot delete template with saved reports')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Error deleting report template'
      });
    }
  },

  /**
   * Get templates by type
   */
  async getByType(req, res) {
    try {
      const { reportType } = req.params;
      const templates = await reportTemplateModel.getByType(reportType);
      
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Get templates by type error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching templates by type'
      });
    }
  },

  /**
   * Execute report template
   */
  async executeTemplate(req, res) {
    try {
      const { id } = req.params;
      const parameters = req.body.parameters || {};

      const result = await reportTemplateModel.executeTemplate(id, parameters);
      
      res.json({
        success: true,
        message: 'Template executed successfully',
        data: result
      });
    } catch (error) {
      console.error('Execute template error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Get predefined templates
   */
  async getPredefinedTemplates(req, res) {
    try {
      const templates = await reportTemplateModel.getPredefinedTemplates();
      
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Get predefined templates error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching predefined templates'
      });
    }
  },

  /**
   * Install predefined template
   */
  async installPredefinedTemplate(req, res) {
    try {
      const { templateIndex } = req.params;
      const predefinedTemplates = await reportTemplateModel.getPredefinedTemplates();
      
      const templateToInstall = predefinedTemplates[parseInt(templateIndex)];
      if (!templateToInstall) {
        return res.status(404).json({
          success: false,
          message: 'Predefined template not found'
        });
      }

      const templateData = {
        ...templateToInstall,
        created_by: req.user.id
      };

      const template = await reportTemplateModel.create(templateData);

      res.status(201).json({
        success: true,
        message: 'Predefined template installed successfully',
        data: template
      });
    } catch (error) {
      console.error('Install predefined template error:', error);
      res.status(500).json({
        success: false,
        message: 'Error installing predefined template'
      });
    }
  },

  /**
   * Get template statistics
   */
  async getStats(req, res) {
    try {
      const stats = await reportTemplateModel.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get template stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching template statistics'
      });
    }
  }
};

module.exports = reportTemplateController;