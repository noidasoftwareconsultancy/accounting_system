const automationModel = require('../models/automation.model');
const { validationResult } = require('express-validator');

const automationController = {
  // ============================================================================
  // AUTOMATION RULES
  // ============================================================================

  /**
   * Get all automation rules
   */
  async getAllRules(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        trigger_event: req.query.trigger_event,
        is_active: req.query.is_active,
        search: req.query.search
      };

      const result = await automationModel.getAllRules(filters, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get automation rules error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching automation rules'
      });
    }
  },

  /**
   * Get automation rule by ID
   */
  async getRuleById(req, res) {
    try {
      const { id } = req.params;
      const rule = await automationModel.getRuleById(id);

      if (!rule) {
        return res.status(404).json({
          success: false,
          message: 'Automation rule not found'
        });
      }

      res.json({
        success: true,
        data: rule
      });
    } catch (error) {
      console.error('Get automation rule error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching automation rule'
      });
    }
  },

  /**
   * Create new automation rule
   */
  async createRule(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const ruleData = {
        ...req.body,
        created_by: req.user.id
      };

      const rule = await automationModel.createRule(ruleData);
      
      res.status(201).json({
        success: true,
        data: rule,
        message: 'Automation rule created successfully'
      });
    } catch (error) {
      console.error('Create automation rule error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating automation rule'
      });
    }
  },

  /**
   * Update automation rule
   */
  async updateRule(req, res) {
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
      const rule = await automationModel.updateRule(id, req.body);

      if (!rule) {
        return res.status(404).json({
          success: false,
          message: 'Automation rule not found'
        });
      }

      res.json({
        success: true,
        data: rule,
        message: 'Automation rule updated successfully'
      });
    } catch (error) {
      console.error('Update automation rule error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating automation rule'
      });
    }
  },

  /**
   * Toggle automation rule active status
   */
  async toggleRule(req, res) {
    try {
      const { id } = req.params;
      const rule = await automationModel.toggleRule(id);

      if (!rule) {
        return res.status(404).json({
          success: false,
          message: 'Automation rule not found'
        });
      }

      res.json({
        success: true,
        data: rule,
        message: `Automation rule ${rule.is_active ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Toggle automation rule error:', error);
      res.status(500).json({
        success: false,
        message: 'Error toggling automation rule'
      });
    }
  },

  /**
   * Delete automation rule
   */
  async deleteRule(req, res) {
    try {
      const { id } = req.params;
      const deleted = await automationModel.deleteRule(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Automation rule not found'
        });
      }

      res.json({
        success: true,
        message: 'Automation rule deleted successfully'
      });
    } catch (error) {
      console.error('Delete automation rule error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting automation rule'
      });
    }
  },

  /**
   * Get active automation rules
   */
  async getActiveRules(req, res) {
    try {
      const rules = await automationModel.getActiveRules();

      res.json({
        success: true,
        data: rules
      });
    } catch (error) {
      console.error('Get active rules error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching active automation rules'
      });
    }
  },

  /**
   * Get automation rules statistics
   */
  async getRulesStats(req, res) {
    try {
      const stats = await automationModel.getRulesStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get rules stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching automation rules statistics'
      });
    }
  },

  // ============================================================================
  // SCHEDULED TASKS
  // ============================================================================

  /**
   * Get all scheduled tasks
   */
  async getAllTasks(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        task_type: req.query.task_type,
        frequency: req.query.frequency,
        is_active: req.query.is_active,
        search: req.query.search
      };

      const result = await automationModel.getAllTasks(filters, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get scheduled tasks error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching scheduled tasks'
      });
    }
  },

  /**
   * Get scheduled task by ID
   */
  async getTaskById(req, res) {
    try {
      const { id } = req.params;
      const task = await automationModel.getTaskById(id);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Scheduled task not found'
        });
      }

      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      console.error('Get scheduled task error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching scheduled task'
      });
    }
  },

  /**
   * Create new scheduled task
   */
  async createTask(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const taskData = {
        ...req.body,
        created_by: req.user.id
      };

      const task = await automationModel.createTask(taskData);
      
      res.status(201).json({
        success: true,
        data: task,
        message: 'Scheduled task created successfully'
      });
    } catch (error) {
      console.error('Create scheduled task error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating scheduled task'
      });
    }
  },

  /**
   * Update scheduled task
   */
  async updateTask(req, res) {
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
      const task = await automationModel.updateTask(id, req.body);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Scheduled task not found'
        });
      }

      res.json({
        success: true,
        data: task,
        message: 'Scheduled task updated successfully'
      });
    } catch (error) {
      console.error('Update scheduled task error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating scheduled task'
      });
    }
  },

  /**
   * Toggle scheduled task active status
   */
  async toggleTask(req, res) {
    try {
      const { id } = req.params;
      const task = await automationModel.toggleTask(id);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Scheduled task not found'
        });
      }

      res.json({
        success: true,
        data: task,
        message: `Scheduled task ${task.is_active ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Toggle scheduled task error:', error);
      res.status(500).json({
        success: false,
        message: 'Error toggling scheduled task'
      });
    }
  },

  /**
   * Run scheduled task manually
   */
  async runTask(req, res) {
    try {
      const { id } = req.params;
      const result = await automationModel.runTask(id);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        data: result.task,
        message: 'Task executed successfully'
      });
    } catch (error) {
      console.error('Run task error:', error);
      res.status(500).json({
        success: false,
        message: 'Error running scheduled task'
      });
    }
  },

  /**
   * Delete scheduled task
   */
  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      const deleted = await automationModel.deleteTask(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Scheduled task not found'
        });
      }

      res.json({
        success: true,
        message: 'Scheduled task deleted successfully'
      });
    } catch (error) {
      console.error('Delete scheduled task error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting scheduled task'
      });
    }
  },

  /**
   * Get upcoming scheduled tasks
   */
  async getUpcomingTasks(req, res) {
    try {
      const hours = parseInt(req.query.hours) || 24;
      const tasks = await automationModel.getUpcomingTasks(hours);

      res.json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error('Get upcoming tasks error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching upcoming tasks'
      });
    }
  },

  /**
   * Get scheduled tasks statistics
   */
  async getTasksStats(req, res) {
    try {
      const stats = await automationModel.getTasksStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get tasks stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching scheduled tasks statistics'
      });
    }
  },

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get available trigger events
   */
  async getAvailableEvents(req, res) {
    try {
      const events = automationModel.getAvailableEvents();

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Get available events error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching available events'
      });
    }
  },

  /**
   * Get available actions
   */
  async getAvailableActions(req, res) {
    try {
      const actions = automationModel.getAvailableActions();

      res.json({
        success: true,
        data: actions
      });
    } catch (error) {
      console.error('Get available actions error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching available actions'
      });
    }
  },

  /**
   * Test automation rule
   */
  async testRule(req, res) {
    try {
      const { rule_id, test_data } = req.body;
      
      if (!rule_id) {
        return res.status(400).json({
          success: false,
          message: 'Rule ID is required'
        });
      }

      const result = await automationModel.testRule(rule_id, test_data);

      res.json({
        success: true,
        data: result,
        message: 'Rule test completed'
      });
    } catch (error) {
      console.error('Test rule error:', error);
      res.status(500).json({
        success: false,
        message: 'Error testing automation rule'
      });
    }
  }
};

module.exports = automationController;