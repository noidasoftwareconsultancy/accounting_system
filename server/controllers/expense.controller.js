const expenseModel = require('../models/expense.model');
const { validationResult } = require('express-validator');

const expenseController = {
  /**
   * Get all expenses
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        category_id: req.query.category_id,
        vendor_id: req.query.vendor_id,
        project_id: req.query.project_id,
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        min_amount: req.query.min_amount,
        max_amount: req.query.max_amount,
        status: req.query.status
      };

      const result = await expenseModel.getAll(filters, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get expenses error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching expenses'
      });
    }
  },

  /**
   * Get expense by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const expense = await expenseModel.getById(id);

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      res.json({
        success: true,
        data: expense
      });
    } catch (error) {
      console.error('Get expense error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching expense'
      });
    }
  },

  /**
   * Create new expense
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

      const expenseData = {
        ...req.body,
        created_by: req.user.id
      };

      const expense = await expenseModel.create(expenseData);

      res.status(201).json({
        success: true,
        message: 'Expense created successfully',
        data: expense
      });
    } catch (error) {
      console.error('Create expense error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating expense'
      });
    }
  },

  /**
   * Update expense
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
      const expense = await expenseModel.update(id, req.body);

      res.json({
        success: true,
        message: 'Expense updated successfully',
        data: expense
      });
    } catch (error) {
      console.error('Update expense error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating expense'
      });
    }
  },

  /**
   * Delete expense
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await expenseModel.delete(id);

      res.json({
        success: true,
        message: 'Expense deleted successfully'
      });
    } catch (error) {
      console.error('Delete expense error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting expense'
      });
    }
  },

  /**
   * Get expense categories
   */
  async getCategories(req, res) {
    try {
      const categories = await expenseModel.getCategories();
      
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
   * Create expense category
   */
  async createCategory(req, res) {
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

      const category = await expenseModel.createCategory(categoryData);

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
   * Update expense category
   */
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const category = await expenseModel.updateCategory(id, req.body);

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
   * Delete expense category
   */
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      await expenseModel.deleteCategory(id);

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting category'
      });
    }
  },

  /**
   * Get vendors
   */
  async getVendors(req, res) {
    try {
      const vendors = await expenseModel.getVendors();
      
      res.json({
        success: true,
        data: vendors
      });
    } catch (error) {
      console.error('Get vendors error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vendors'
      });
    }
  },

  /**
   * Create vendor
   */
  async createVendor(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const vendorData = {
        ...req.body,
        created_by: req.user.id
      };

      const vendor = await expenseModel.createVendor(vendorData);

      res.status(201).json({
        success: true,
        message: 'Vendor created successfully',
        data: vendor
      });
    } catch (error) {
      console.error('Create vendor error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating vendor'
      });
    }
  },

  /**
   * Update vendor
   */
  async updateVendor(req, res) {
    try {
      const { id } = req.params;
      const vendor = await expenseModel.updateVendor(id, req.body);

      res.json({
        success: true,
        message: 'Vendor updated successfully',
        data: vendor
      });
    } catch (error) {
      console.error('Update vendor error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating vendor'
      });
    }
  },

  /**
   * Delete vendor
   */
  async deleteVendor(req, res) {
    try {
      const { id } = req.params;
      await expenseModel.deleteVendor(id);

      res.json({
        success: true,
        message: 'Vendor deleted successfully'
      });
    } catch (error) {
      console.error('Delete vendor error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting vendor'
      });
    }
  },

  /**
   * Get expense summary by category
   */
  async getSummaryByCategory(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const summary = await expenseModel.getSummaryByCategory(start_date, end_date);
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Get summary by category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching expense summary'
      });
    }
  },

  /**
   * Get expense summary by month
   */
  async getSummaryByMonth(req, res) {
    try {
      const { year } = req.query;
      
      if (!year) {
        return res.status(400).json({
          success: false,
          message: 'Year is required'
        });
      }

      const summary = await expenseModel.getSummaryByMonth(year);
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Get summary by month error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching monthly summary'
      });
    }
  },

  /**
   * Get expense statistics
   */
  async getStats(req, res) {
    try {
      const stats = await expenseModel.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get expense stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching expense statistics'
      });
    }
  },

  // Legacy methods for backward compatibility
  getAllExpenses: function(req, res) { return this.getAll(req, res); },
  getExpenseById: function(req, res) { return this.getById(req, res); },
  createExpense: function(req, res) { return this.create(req, res); },
  updateExpense: function(req, res) { return this.update(req, res); },
  deleteExpense: function(req, res) { return this.delete(req, res); }
};

module.exports = expenseController;