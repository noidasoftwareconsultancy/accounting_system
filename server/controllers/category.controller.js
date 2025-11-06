const categoryModel = require('../models/category.model');
const { validationResult } = require('express-validator');

const categoryController = {
  /**
   * Get all categories
   */
  async getAll(req, res) {
    try {
      const categories = await categoryModel.getAll();
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching categories'
      });
    }
  },

  /**
   * Get category by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const category = await categoryModel.getById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching category'
      });
    }
  },

  /**
   * Create category
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

      const categoryData = {
        ...req.body,
        created_by: req.user.id
      };

      const category = await categoryModel.create(categoryData);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating category'
      });
    }
  },

  /**
   * Update category
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
      const category = await categoryModel.update(id, req.body);

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating category'
      });
    }
  },

  /**
   * Delete category
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await categoryModel.delete(id);

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      
      if (error.message.includes('Cannot delete category with existing expenses')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error deleting category'
      });
    }
  },

  /**
   * Get category statistics
   */
  async getStats(req, res) {
    try {
      const stats = await categoryModel.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get category stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching category statistics'
      });
    }
  },

  /**
   * Get category expense summary
   */
  async getExpenseSummary(req, res) {
    try {
      const { id } = req.params;
      const { start_date, end_date } = req.query;
      
      const summary = await categoryModel.getExpenseSummary(id, start_date, end_date);
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Get category expense summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching category expense summary'
      });
    }
  },

  /**
   * Get categories with trends
   */
  async getCategoriesWithTrends(req, res) {
    try {
      const { period = 'month' } = req.query;
      const categories = await categoryModel.getCategoriesWithTrends(period);
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get categories with trends error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching category trends'
      });
    }
  },

  /**
   * Search categories
   */
  async search(req, res) {
    try {
      const { q } = req.query;
      
      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters'
        });
      }

      const categories = await categoryModel.search(q.trim());
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Search categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching categories'
      });
    }
  }
};

module.exports = categoryController;