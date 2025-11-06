const taxModel = require('../models/tax.model');
const { validationResult } = require('express-validator');

const taxController = {
  /**
   * Get all tax rates
   */
  async getAllTaxRates(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const filters = {
        type: req.query.type,
        is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
        search: req.query.search
      };

      const result = await taxModel.getAllTaxRates(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get tax rates error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching tax rates'
      });
    }
  },

  /**
   * Get tax rate by ID
   */
  async getTaxRateById(req, res) {
    try {
      const { id } = req.params;
      const taxRate = await taxModel.getTaxRateById(id);

      if (!taxRate) {
        return res.status(404).json({
          success: false,
          message: 'Tax rate not found'
        });
      }

      res.json({
        success: true,
        data: taxRate
      });
    } catch (error) {
      console.error('Get tax rate error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching tax rate'
      });
    }
  },

  /**
   * Create tax rate
   */
  async createTaxRate(req, res) {
    try {
      console.log('Create tax rate request:', {
        body: req.body,
        user: req.user
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const taxRateData = {
        ...req.body,
        created_by: req.user.id
      };

      console.log('Creating tax rate with data:', taxRateData);
      const taxRate = await taxModel.createTaxRate(taxRateData);

      res.status(201).json({
        success: true,
        message: 'Tax rate created successfully',
        data: taxRate
      });
    } catch (error) {
      console.error('Create tax rate error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating tax rate',
        error: error.message
      });
    }
  },

  /**
   * Update tax rate
   */
  async updateTaxRate(req, res) {
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
      const taxRate = await taxModel.updateTaxRate(id, req.body);

      res.json({
        success: true,
        message: 'Tax rate updated successfully',
        data: taxRate
      });
    } catch (error) {
      console.error('Update tax rate error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating tax rate'
      });
    }
  },

  /**
   * Delete tax rate
   */
  async deleteTaxRate(req, res) {
    try {
      const { id } = req.params;
      await taxModel.deleteTaxRate(id);

      res.json({
        success: true,
        message: 'Tax rate deleted successfully'
      });
    } catch (error) {
      console.error('Delete tax rate error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting tax rate'
      });
    }
  },

  /**
   * Get tax records
   */
  async getTaxRecords(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const filters = {
        tax_rate_id: req.query.tax_rate_id,
        transaction_type: req.query.transaction_type,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const result = await taxModel.getTaxRecords(page, limit, filters);
      
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
   * Create tax record
   */
  async createTaxRecord(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const taxRecord = await taxModel.createTaxRecord(req.body);

      res.status(201).json({
        success: true,
        message: 'Tax record created successfully',
        data: taxRecord
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
   * Get tax summary report
   */
  async getTaxSummaryReport(req, res) {
    try {
      const filters = {
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        transaction_type: req.query.transaction_type
      };

      const result = await taxModel.getTaxSummaryReport(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get tax summary report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating tax summary report'
      });
    }
  },

  /**
   * Get tax collection report
   */
  async getTaxCollectionReport(req, res) {
    try {
      const filters = {
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        group_by: req.query.group_by || 'month'
      };

      const result = await taxModel.getTaxCollectionReport(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get tax collection report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating tax collection report'
      });
    }
  },

  /**
   * Get tax liability report
   */
  async getTaxLiabilityReport(req, res) {
    try {
      const filters = {
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const result = await taxModel.getTaxLiabilityReport(filters);
      
      res.json({
        success: true,
        data: result
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
   * Get tax compliance report
   */
  async getTaxComplianceReport(req, res) {
    try {
      const filters = {
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const result = await taxModel.getTaxComplianceReport(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get tax compliance report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating tax compliance report'
      });
    }
  },

  /**
   * Get tax types for dropdown
   */
  async getTaxTypes(req, res) {
    try {
      const taxTypes = [
        { value: 'GST', label: 'Goods and Services Tax (GST)' },
        { value: 'VAT', label: 'Value Added Tax (VAT)' },
        { value: 'TDS', label: 'Tax Deducted at Source (TDS)' },
        { value: 'TCS', label: 'Tax Collected at Source (TCS)' },
        { value: 'INCOME_TAX', label: 'Income Tax' },
        { value: 'CORPORATE_TAX', label: 'Corporate Tax' },
        { value: 'SALES_TAX', label: 'Sales Tax' },
        { value: 'EXCISE', label: 'Excise Duty' },
        { value: 'CUSTOMS', label: 'Customs Duty' },
        { value: 'OTHER', label: 'Other Tax' }
      ];

      res.json({
        success: true,
        data: taxTypes
      });
    } catch (error) {
      console.error('Get tax types error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching tax types'
      });
    }
  }
};

module.exports = taxController;