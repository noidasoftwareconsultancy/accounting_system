const milestoneModel = require('../models/milestone.model');
const { validationResult } = require('express-validator');

const milestoneController = {
  /**
   * Get all milestones
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        project_id: req.query.project_id,
        status: req.query.status,
        search: req.query.search
      };

      const result = await milestoneModel.getAll(filters, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get milestones error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching milestones'
      });
    }
  },

  /**
   * Get milestone by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const milestone = await milestoneModel.getById(id);

      if (!milestone) {
        return res.status(404).json({
          success: false,
          message: 'Milestone not found'
        });
      }

      res.json({
        success: true,
        data: milestone
      });
    } catch (error) {
      console.error('Get milestone error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching milestone'
      });
    }
  },

  /**
   * Create new milestone
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

      const milestoneData = {
        ...req.body,
        created_by: req.user.id
      };

      const milestone = await milestoneModel.create(milestoneData);
      
      res.status(201).json({
        success: true,
        data: milestone,
        message: 'Milestone created successfully'
      });
    } catch (error) {
      console.error('Create milestone error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating milestone'
      });
    }
  },

  /**
   * Update milestone
   */
  async update(req, res) {
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
      const milestone = await milestoneModel.update(id, req.body);

      if (!milestone) {
        return res.status(404).json({
          success: false,
          message: 'Milestone not found'
        });
      }

      res.json({
        success: true,
        data: milestone,
        message: 'Milestone updated successfully'
      });
    } catch (error) {
      console.error('Update milestone error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating milestone'
      });
    }
  },

  /**
   * Delete milestone
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await milestoneModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Milestone not found'
        });
      }

      res.json({
        success: true,
        message: 'Milestone deleted successfully'
      });
    } catch (error) {
      console.error('Delete milestone error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting milestone'
      });
    }
  },

  /**
   * Get milestones by project
   */
  async getByProject(req, res) {
    try {
      const { projectId } = req.params;
      const milestones = await milestoneModel.getByProject(projectId);

      res.json({
        success: true,
        data: milestones
      });
    } catch (error) {
      console.error('Get milestones by project error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching project milestones'
      });
    }
  },

  /**
   * Get milestone statistics
   */
  async getStats(req, res) {
    try {
      const stats = await milestoneModel.getStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get milestone stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching milestone statistics'
      });
    }
  },

  /**
   * Get upcoming milestones
   */
  async getUpcoming(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const milestones = await milestoneModel.getUpcoming(days);

      res.json({
        success: true,
        data: milestones
      });
    } catch (error) {
      console.error('Get upcoming milestones error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching upcoming milestones'
      });
    }
  },

  /**
   * Get overdue milestones
   */
  async getOverdue(req, res) {
    try {
      const milestones = await milestoneModel.getOverdue();

      res.json({
        success: true,
        data: milestones
      });
    } catch (error) {
      console.error('Get overdue milestones error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching overdue milestones'
      });
    }
  },

  /**
   * Update milestone status
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const milestone = await milestoneModel.updateStatus(id, status);

      if (!milestone) {
        return res.status(404).json({
          success: false,
          message: 'Milestone not found'
        });
      }

      res.json({
        success: true,
        data: milestone,
        message: 'Milestone status updated successfully'
      });
    } catch (error) {
      console.error('Update milestone status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating milestone status'
      });
    }
  },

  /**
   * Mark milestone as complete
   */
  async markComplete(req, res) {
    try {
      const { id } = req.params;
      const milestone = await milestoneModel.updateStatus(id, 'completed');

      if (!milestone) {
        return res.status(404).json({
          success: false,
          message: 'Milestone not found'
        });
      }

      res.json({
        success: true,
        data: milestone,
        message: 'Milestone marked as completed'
      });
    } catch (error) {
      console.error('Mark milestone complete error:', error);
      res.status(500).json({
        success: false,
        message: 'Error marking milestone as complete'
      });
    }
  },

  /**
   * Generate invoice for milestone
   */
  async generateInvoice(req, res) {
    try {
      const { id } = req.params;
      const result = await milestoneModel.generateInvoice(id, req.user.id);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        data: result.invoice,
        message: 'Invoice generated successfully for milestone'
      });
    } catch (error) {
      console.error('Generate invoice error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating invoice for milestone'
      });
    }
  }
};

module.exports = milestoneController;