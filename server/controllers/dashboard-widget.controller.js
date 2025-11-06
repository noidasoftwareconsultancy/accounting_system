const dashboardWidgetModel = require('../models/dashboard-widget.model');
const { validationResult } = require('express-validator');

const dashboardWidgetController = {
  // ============================================================================
  // DASHBOARD MANAGEMENT
  // ============================================================================

  /**
   * Get all dashboards
   */
  async getAllDashboards(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        search: req.query.search,
        created_by: req.query.created_by
      };

      const result = await dashboardWidgetModel.getAllDashboards(filters, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get dashboards error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboards'
      });
    }
  },

  /**
   * Get current user's dashboards
   */
  async getMyDashboards(req, res) {
    try {
      const dashboards = await dashboardWidgetModel.getDashboardsByUser(req.user.id);
      
      res.json({
        success: true,
        data: dashboards
      });
    } catch (error) {
      console.error('Get my dashboards error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching your dashboards'
      });
    }
  },

  /**
   * Get default dashboard
   */
  async getDefaultDashboard(req, res) {
    try {
      const dashboard = await dashboardWidgetModel.getDefaultDashboard(req.user.id);
      
      if (!dashboard) {
        return res.status(404).json({
          success: false,
          message: 'No default dashboard found'
        });
      }

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      console.error('Get default dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching default dashboard'
      });
    }
  },

  /**
   * Get dashboard by ID
   */
  async getDashboardById(req, res) {
    try {
      const { id } = req.params;
      const dashboard = await dashboardWidgetModel.getDashboardById(id);

      if (!dashboard) {
        return res.status(404).json({
          success: false,
          message: 'Dashboard not found'
        });
      }

      // Check access permissions
      if (dashboard.created_by !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard'
      });
    }
  },

  /**
   * Create new dashboard
   */
  async createDashboard(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const dashboardData = {
        ...req.body,
        created_by: req.user.id
      };

      const dashboard = await dashboardWidgetModel.createDashboard(dashboardData);
      
      res.status(201).json({
        success: true,
        data: dashboard,
        message: 'Dashboard created successfully'
      });
    } catch (error) {
      console.error('Create dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating dashboard'
      });
    }
  },

  /**
   * Update dashboard
   */
  async updateDashboard(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const dashboard = await dashboardWidgetModel.updateDashboard(id, req.body, req.user.id, req.user.role);

      if (!dashboard) {
        return res.status(404).json({
          success: false,
          message: 'Dashboard not found or access denied'
        });
      }

      res.json({
        success: true,
        data: dashboard,
        message: 'Dashboard updated successfully'
      });
    } catch (error) {
      console.error('Update dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating dashboard'
      });
    }
  },

  /**
   * Set dashboard as default
   */
  async setDefaultDashboard(req, res) {
    try {
      const { id } = req.params;
      const dashboard = await dashboardWidgetModel.setDefaultDashboard(id, req.user.id, req.user.role);

      if (!dashboard) {
        return res.status(404).json({
          success: false,
          message: 'Dashboard not found or access denied'
        });
      }

      res.json({
        success: true,
        data: dashboard,
        message: 'Dashboard set as default successfully'
      });
    } catch (error) {
      console.error('Set default dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Error setting default dashboard'
      });
    }
  },

  /**
   * Delete dashboard
   */
  async deleteDashboard(req, res) {
    try {
      const { id } = req.params;
      const deleted = await dashboardWidgetModel.deleteDashboard(id, req.user.id, req.user.role);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Dashboard not found or access denied'
        });
      }

      res.json({
        success: true,
        message: 'Dashboard deleted successfully'
      });
    } catch (error) {
      console.error('Delete dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting dashboard'
      });
    }
  },

  /**
   * Duplicate dashboard
   */
  async duplicateDashboard(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Dashboard name is required'
        });
      }

      const dashboard = await dashboardWidgetModel.duplicateDashboard(id, name, req.user.id);

      if (!dashboard) {
        return res.status(404).json({
          success: false,
          message: 'Dashboard not found or access denied'
        });
      }

      res.status(201).json({
        success: true,
        data: dashboard,
        message: 'Dashboard duplicated successfully'
      });
    } catch (error) {
      console.error('Duplicate dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Error duplicating dashboard'
      });
    }
  },

  // ============================================================================
  // WIDGET MANAGEMENT
  // ============================================================================

  /**
   * Get all widgets
   */
  async getAllWidgets(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        dashboard_id: req.query.dashboard_id,
        widget_type: req.query.widget_type,
        search: req.query.search
      };

      const result = await dashboardWidgetModel.getAllWidgets(filters, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get widgets error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching widgets'
      });
    }
  },

  /**
   * Get widgets by dashboard
   */
  async getWidgetsByDashboard(req, res) {
    try {
      const { dashboardId } = req.params;
      const widgets = await dashboardWidgetModel.getWidgetsByDashboard(dashboardId);

      res.json({
        success: true,
        data: widgets
      });
    } catch (error) {
      console.error('Get widgets by dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard widgets'
      });
    }
  },

  /**
   * Get widget by ID
   */
  async getWidgetById(req, res) {
    try {
      const { id } = req.params;
      const widget = await dashboardWidgetModel.getWidgetById(id);

      if (!widget) {
        return res.status(404).json({
          success: false,
          message: 'Widget not found'
        });
      }

      res.json({
        success: true,
        data: widget
      });
    } catch (error) {
      console.error('Get widget error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching widget'
      });
    }
  },

  /**
   * Get widget data
   */
  async getWidgetData(req, res) {
    try {
      const { id } = req.params;
      const data = await dashboardWidgetModel.getWidgetData(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Widget not found or no data available'
        });
      }

      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      console.error('Get widget data error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching widget data'
      });
    }
  },

  /**
   * Create new widget
   */
  async createWidget(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const widgetData = {
        ...req.body,
        created_by: req.user.id
      };

      const widget = await dashboardWidgetModel.createWidget(widgetData);
      
      res.status(201).json({
        success: true,
        data: widget,
        message: 'Widget created successfully'
      });
    } catch (error) {
      console.error('Create widget error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating widget'
      });
    }
  },

  /**
   * Update widget
   */
  async updateWidget(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const widget = await dashboardWidgetModel.updateWidget(id, req.body, req.user.id, req.user.role);

      if (!widget) {
        return res.status(404).json({
          success: false,
          message: 'Widget not found or access denied'
        });
      }

      res.json({
        success: true,
        data: widget,
        message: 'Widget updated successfully'
      });
    } catch (error) {
      console.error('Update widget error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating widget'
      });
    }
  },

  /**
   * Update widget position
   */
  async updateWidgetPosition(req, res) {
    try {
      const { id } = req.params;
      const { position } = req.body;

      if (!position || typeof position !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Valid position object is required'
        });
      }

      const widget = await dashboardWidgetModel.updateWidgetPosition(id, position, req.user.id, req.user.role);

      if (!widget) {
        return res.status(404).json({
          success: false,
          message: 'Widget not found or access denied'
        });
      }

      res.json({
        success: true,
        data: widget,
        message: 'Widget position updated successfully'
      });
    } catch (error) {
      console.error('Update widget position error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating widget position'
      });
    }
  },

  /**
   * Delete widget
   */
  async deleteWidget(req, res) {
    try {
      const { id } = req.params;
      const deleted = await dashboardWidgetModel.deleteWidget(id, req.user.id, req.user.role);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Widget not found or access denied'
        });
      }

      res.json({
        success: true,
        message: 'Widget deleted successfully'
      });
    } catch (error) {
      console.error('Delete widget error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting widget'
      });
    }
  },

  /**
   * Bulk update widget positions
   */
  async bulkUpdateWidgetPositions(req, res) {
    try {
      const { widgets } = req.body;

      if (!Array.isArray(widgets) || widgets.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Widgets array is required'
        });
      }

      const result = await dashboardWidgetModel.bulkUpdateWidgetPositions(widgets, req.user.id, req.user.role);

      res.json({
        success: true,
        data: result,
        message: 'Widget positions updated successfully'
      });
    } catch (error) {
      console.error('Bulk update widget positions error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating widget positions'
      });
    }
  },

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get available widget types
   */
  async getAvailableWidgetTypes(req, res) {
    try {
      const widgetTypes = dashboardWidgetModel.getAvailableWidgetTypes();

      res.json({
        success: true,
        data: widgetTypes
      });
    } catch (error) {
      console.error('Get widget types error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching widget types'
      });
    }
  },

  /**
   * Get available data sources
   */
  async getAvailableDataSources(req, res) {
    try {
      const dataSources = dashboardWidgetModel.getAvailableDataSources();

      res.json({
        success: true,
        data: dataSources
      });
    } catch (error) {
      console.error('Get data sources error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching data sources'
      });
    }
  }
};

module.exports = dashboardWidgetController;