const vendorModel = require('../models/vendor.model');
const { validationResult } = require('express-validator');

const vendorController = {
  /**
   * Get all vendors
   */
  async getAll(req, res) {
    try {
      const vendors = await vendorModel.getAll();
      
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
   * Get vendor by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const vendor = await vendorModel.getById(id);

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found'
        });
      }

      res.json({
        success: true,
        data: vendor
      });
    } catch (error) {
      console.error('Get vendor error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vendor'
      });
    }
  },

  /**
   * Create vendor
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

      const vendorData = {
        ...req.body,
        created_by: req.user.id
      };

      const vendor = await vendorModel.create(vendorData);

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
      const vendor = await vendorModel.update(id, req.body);

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
  async delete(req, res) {
    try {
      const { id } = req.params;
      await vendorModel.delete(id);

      res.json({
        success: true,
        message: 'Vendor deleted successfully'
      });
    } catch (error) {
      console.error('Delete vendor error:', error);
      
      if (error.message.includes('Cannot delete vendor with existing expenses')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error deleting vendor'
      });
    }
  },

  /**
   * Get vendor statistics
   */
  async getStats(req, res) {
    try {
      const stats = await vendorModel.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get vendor stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vendor statistics'
      });
    }
  },

  /**
   * Get vendor expense summary
   */
  async getExpenseSummary(req, res) {
    try {
      const { id } = req.params;
      const { start_date, end_date } = req.query;
      
      const summary = await vendorModel.getExpenseSummary(id, start_date, end_date);
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Get vendor expense summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vendor expense summary'
      });
    }
  },

  /**
   * Get vendors with trends
   */
  async getVendorsWithTrends(req, res) {
    try {
      const { period = 'month' } = req.query;
      const vendors = await vendorModel.getVendorsWithTrends(period);
      
      res.json({
        success: true,
        data: vendors
      });
    } catch (error) {
      console.error('Get vendors with trends error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vendor trends'
      });
    }
  },

  /**
   * Search vendors
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

      const vendors = await vendorModel.search(q.trim());
      
      res.json({
        success: true,
        data: vendors
      });
    } catch (error) {
      console.error('Search vendors error:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching vendors'
      });
    }
  },

  /**
   * Get vendor payment analysis
   */
  async getPaymentAnalysis(req, res) {
    try {
      const { id } = req.params;
      const analysis = await vendorModel.getPaymentAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found'
        });
      }
      
      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Get vendor payment analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vendor payment analysis'
      });
    }
  }
};

module.exports = vendorController;