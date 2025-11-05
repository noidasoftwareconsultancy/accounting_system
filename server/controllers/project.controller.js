const projectModel = require('../models/project.model');
const { validationResult } = require('express-validator');

const projectController = {
  /**
   * Get all projects
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        client_id: req.query.client_id,
        status: req.query.status,
        department: req.query.department
      };

      const result = await projectModel.getAll(filters, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching projects'
      });
    }
  },

  /**
   * Get project by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const project = await projectModel.getById(id);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching project'
      });
    }
  },

  /**
   * Create new project
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

      const projectData = {
        ...req.body,
        created_by: req.user.id
      };

      const project = await projectModel.create(projectData);

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating project'
      });
    }
  },

  /**
   * Update project
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
      const project = await projectModel.update(id, req.body);

      res.json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating project'
      });
    }
  },

  /**
   * Delete project
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await projectModel.delete(id);

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting project'
      });
    }
  },

  /**
   * Get project financial summary
   */
  async getFinancialSummary(req, res) {
    try {
      const { id } = req.params;
      const summary = await projectModel.getFinancialSummary(id);
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Get project financial summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching project financial summary'
      });
    }
  },

  /**
   * Get project statistics
   */
  async getStats(req, res) {
    try {
      const stats = await projectModel.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get project stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching project statistics'
      });
    }
  }
};

module.exports = projectController;