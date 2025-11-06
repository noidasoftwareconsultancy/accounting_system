const taxRecordModel = require('../models/tax-record.model');
const { validationResult } = require('express-validator');

const taxRecordController = {
  /**
   * Get all tax records
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        tax_rate_id: req.query.tax_rate_id,
        transaction_type: req.query.transaction_type,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const result = await taxRecordModel.getAll(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get tax records error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching tax records'
      });
    }
  },

  /**
   * Get tax record by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const record = await taxRecordModel.getById(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Tax record not found'
        });
      }

      res.json({
        success: true,
        data: record
      });
    } catch (error) {
      console.error('Get tax record error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching tax record'
      });
    }
  },

  /**
   * Create new tax record
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

      const record = await taxRecordModel.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Tax record created successfully',
        data: record
      });
    } catch (error) {
      console.error('Create tax record error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating tax record'
      });
    }
  },

  /**
   * Update tax record
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
      const record = await taxRecordModel.update(id, req.body);

      res.json({
        success: true,
        message: 'Tax record updated successfully',
        data: record
      });
    } catch (error) {
      console.error('Update tax record error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating tax record'
      });
    }
  },

  /**
   * Delete tax record
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await taxRecordModel.delete(id);

      res.json({
        success: true,
        message: 'Tax record deleted successfully'
      });
    } catch (error) {
      console.error('Delete tax record error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting tax record'
      });
    }
  },

  /**
   * Get tax summary
   */
  async getTaxSummary(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const groupBy = req.query.groupBy || 'tax_rate';

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const summary = await taxRecordModel.getTaxSummary(startDate, endDate, groupBy);
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Get tax summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching tax summary'
      });
    }
  },

  /**
   * Get tax records by transaction
   */
  async getByTransaction(req, res) {
    try {
      const { transactionType, transactionId } = req.params;
      
      const records = await taxRecordModel.getByTransaction(transactionType, transactionId);
      
      res.json({
        success: true,
        data: records
      });
    } catch (error) {
      console.error('Get tax records by transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching transaction tax records'
      });
    }
  },

  /**
   * Get tax liability report
   */
  async getTaxLiabilityReport(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const report = await taxRecordModel.getTaxLiabilityReport(startDate, endDate);
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Get tax liability report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating tax liability report'
      });
    }
  },

  /**
   * Get tax statistics
   */
  async getStats(req, res) {
    try {
      const stats = await taxRecordModel.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get tax stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching tax statistics'
      });
    }
  }
};

module.exports = taxRecordController;