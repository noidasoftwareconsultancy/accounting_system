const scheduledTaskModel = require('../models/scheduled-task.model');
const { validationResult } = require('express-validator');

const scheduledTaskController = {
  /**
   * Get all scheduled tasks
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        task_type: req.query.task_type,
        is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
        search: req.query.search
      };

      const result = await scheduledTaskModel.getAll(page, limit, filters);
      
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
  async getById(req, res) {
    try {
      const { id } = req.params;
      const task = await scheduledTaskModel.getById(id);

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

      const taskData = {
        ...req.body,
        created_by: req.user.id
      };

      const task = await scheduledTaskModel.create(taskData);

      res.status(201).json({
        success: true,
        message: 'Scheduled task created successfully',
        data: task
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
      const task = await scheduledTaskModel.update(id, req.body);

      res.json({
        success: true,
        message: 'Scheduled task updated successfully',
        data: task
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
   * Delete scheduled task
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await scheduledTaskModel.delete(id);

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
   * Get tasks due for execution
   */
  async getTasksDue(req, res) {
    try {
      const tasks = await scheduledTaskModel.getTasksDue();
      
      res.json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error('Get tasks due error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching due tasks'
      });
    }
  },

  /**
   * Execute task manually
   */
  async executeTask(req, res) {
    try {
      const { id } = req.params;
      
      const result = await scheduledTaskModel.executeTask(id);

      res.json({
        success: true,
        message: 'Task executed successfully',
        data: result
      });
    } catch (error) {
      console.error('Execute task error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Toggle task active status
   */
  async toggleActive(req, res) {
    try {
      const { id } = req.params;
      const task = await scheduledTaskModel.getById(id);
      
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Scheduled task not found'
        });
      }

      const updatedTask = await scheduledTaskModel.update(id, {
        is_active: !task.is_active
      });

      res.json({
        success: true,
        message: `Task ${updatedTask.is_active ? 'activated' : 'deactivated'} successfully`,
        data: updatedTask
      });
    } catch (error) {
      console.error('Toggle task active error:', error);
      res.status(500).json({
        success: false,
        message: 'Error toggling task status'
      });
    }
  },

  /**
   * Get task execution history
   */
  async getExecutionHistory(req, res) {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      
      const history = await scheduledTaskModel.getExecutionHistory(id, limit);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Get execution history error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching execution history'
      });
    }
  },

  /**
   * Get available task types
   */
  async getTaskTypes(req, res) {
    try {
      const taskTypes = [
        {
          type: 'invoice_reminder',
          name: 'Invoice Reminder',
          description: 'Send reminders for overdue invoices',
          parameters: {
            reminderDays: { type: 'number', default: 7, description: 'Days after due date to send reminder' }
          }
        },
        {
          type: 'expense_report',
          name: 'Expense Report',
          description: 'Generate periodic expense reports',
          parameters: {
            startDate: { type: 'date', description: 'Report start date' },
            endDate: { type: 'date', description: 'Report end date' }
          }
        },
        {
          type: 'payroll_processing',
          name: 'Payroll Processing',
          description: 'Process monthly payroll',
          parameters: {
            month: { type: 'number', description: 'Month to process (1-12)' },
            year: { type: 'number', description: 'Year to process' }
          }
        },
        {
          type: 'backup_data',
          name: 'Data Backup',
          description: 'Backup system data',
          parameters: {
            backupType: { type: 'string', default: 'full', description: 'Type of backup (full, incremental)' }
          }
        },
        {
          type: 'generate_report',
          name: 'Generate Report',
          description: 'Generate scheduled reports',
          parameters: {
            templateId: { type: 'number', description: 'Report template ID' },
            reportParameters: { type: 'object', description: 'Parameters for report generation' }
          }
        }
      ];

      res.json({
        success: true,
        data: taskTypes
      });
    } catch (error) {
      console.error('Get task types error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching task types'
      });
    }
  },

  /**
   * Get scheduled task statistics
   */
  async getStats(req, res) {
    try {
      const stats = await scheduledTaskModel.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get scheduled task stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching scheduled task statistics'
      });
    }
  }
};

module.exports = scheduledTaskController;