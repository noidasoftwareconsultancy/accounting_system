const reportsModel = require('../models/reports.model');
const { validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

const reportsController = {
  /**
   * Get all report templates
   */
  async getAllReportTemplates(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const filters = {
        report_type: req.query.report_type,
        search: req.query.search
      };

      const result = await reportsModel.getAllReportTemplates(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get report templates error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching report templates'
      });
    }
  },

  /**
   * Get report template by ID
   */
  async getReportTemplateById(req, res) {
    try {
      const { id } = req.params;
      const template = await reportsModel.getReportTemplateById(id);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Report template not found'
        });
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Get report template error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching report template'
      });
    }
  },

  /**
   * Create report template
   */
  async createReportTemplate(req, res) {
    try {
      console.log('Create report template request:', {
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

      const templateData = {
        ...req.body,
        created_by: req.user.id
      };

      console.log('Creating template with data:', templateData);
      const template = await reportsModel.createReportTemplate(templateData);

      res.status(201).json({
        success: true,
        message: 'Report template created successfully',
        data: template
      });
    } catch (error) {
      console.error('Create report template error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating report template',
        error: error.message
      });
    }
  },

  /**
   * Update report template
   */
  async updateReportTemplate(req, res) {
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
      const template = await reportsModel.updateReportTemplate(id, req.body);

      res.json({
        success: true,
        message: 'Report template updated successfully',
        data: template
      });
    } catch (error) {
      console.error('Update report template error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating report template'
      });
    }
  },

  /**
   * Delete report template
   */
  async deleteReportTemplate(req, res) {
    try {
      const { id } = req.params;
      await reportsModel.deleteReportTemplate(id);

      res.json({
        success: true,
        message: 'Report template deleted successfully'
      });
    } catch (error) {
      console.error('Delete report template error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error deleting report template'
      });
    }
  },

  /**
   * Execute report template
   */
  async executeReportTemplate(req, res) {
    try {
      const { id } = req.params;
      const parameters = req.body.parameters || {};
      const saveReport = req.body.save_report || false;

      const reportData = await reportsModel.executeReportTemplate(id, parameters, req.user.id);

      let savedReport = null;
      if (saveReport) {
        savedReport = await reportsModel.saveReportExecution(id, reportData, parameters, req.user.id);
      }

      res.json({
        success: true,
        data: reportData,
        saved_report: savedReport
      });
    } catch (error) {
      console.error('Execute report template error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error executing report template'
      });
    }
  },

  /**
   * Get saved reports
   */
  async getSavedReports(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const filters = {
        template_id: req.query.template_id,
        created_by: req.query.created_by
      };

      const result = await reportsModel.getSavedReports(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get saved reports error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching saved reports'
      });
    }
  },

  /**
   * Get saved report by ID
   */
  async getSavedReportById(req, res) {
    try {
      const { id } = req.params;
      const report = await reportsModel.getSavedReportById(id);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Saved report not found'
        });
      }

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Get saved report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching saved report'
      });
    }
  },

  /**
   * Delete saved report
   */
  async deleteSavedReport(req, res) {
    try {
      const { id } = req.params;
      await reportsModel.deleteSavedReport(id);

      res.json({
        success: true,
        message: 'Saved report deleted successfully'
      });
    } catch (error) {
      console.error('Delete saved report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting saved report'
      });
    }
  },

  /**
   * Get report types
   */
  async getReportTypes(req, res) {
    try {
      const reportTypes = [
        {
          id: 'financial_summary',
          name: 'Financial Summary',
          description: 'Overview of revenue, expenses, and net income',
          parameters: [
            { name: 'start_date', type: 'date', required: false, label: 'Start Date' },
            { name: 'end_date', type: 'date', required: false, label: 'End Date' }
          ]
        },
        {
          id: 'income_statement',
          name: 'Income Statement',
          description: 'Detailed profit and loss statement',
          parameters: [
            { name: 'start_date', type: 'date', required: true, label: 'Start Date' },
            { name: 'end_date', type: 'date', required: true, label: 'End Date' }
          ]
        },
        {
          id: 'balance_sheet',
          name: 'Balance Sheet',
          description: 'Assets, liabilities, and equity at a point in time',
          parameters: [
            { name: 'as_of_date', type: 'date', required: true, label: 'As of Date' }
          ]
        },
        {
          id: 'cash_flow',
          name: 'Cash Flow Statement',
          description: 'Cash inflows and outflows by activity',
          parameters: [
            { name: 'start_date', type: 'date', required: true, label: 'Start Date' },
            { name: 'end_date', type: 'date', required: true, label: 'End Date' }
          ]
        },
        {
          id: 'accounts_receivable',
          name: 'Accounts Receivable',
          description: 'Outstanding customer invoices and aging',
          parameters: [
            { name: 'as_of_date', type: 'date', required: false, label: 'As of Date' }
          ]
        },
        {
          id: 'accounts_payable',
          name: 'Accounts Payable',
          description: 'Outstanding vendor bills and aging',
          parameters: [
            { name: 'as_of_date', type: 'date', required: false, label: 'As of Date' }
          ]
        },
        {
          id: 'expense_analysis',
          name: 'Expense Analysis',
          description: 'Detailed expense breakdown and trends',
          parameters: [
            { name: 'start_date', type: 'date', required: true, label: 'Start Date' },
            { name: 'end_date', type: 'date', required: true, label: 'End Date' },
            { name: 'category_id', type: 'select', required: false, label: 'Category', options: 'expense_categories' }
          ]
        },
        {
          id: 'revenue_analysis',
          name: 'Revenue Analysis',
          description: 'Revenue breakdown and trends',
          parameters: [
            { name: 'start_date', type: 'date', required: true, label: 'Start Date' },
            { name: 'end_date', type: 'date', required: true, label: 'End Date' }
          ]
        },
        {
          id: 'payroll_summary',
          name: 'Payroll Summary',
          description: 'Employee payroll costs and breakdown',
          parameters: [
            { name: 'start_date', type: 'date', required: true, label: 'Start Date' },
            { name: 'end_date', type: 'date', required: true, label: 'End Date' }
          ]
        },
        {
          id: 'tax_summary',
          name: 'Tax Summary',
          description: 'Tax calculations and liabilities by tax rate',
          parameters: [
            { name: 'start_date', type: 'date', required: true, label: 'Start Date' },
            { name: 'end_date', type: 'date', required: true, label: 'End Date' },
            { name: 'transaction_type', type: 'select', required: false, label: 'Transaction Type', options: ['invoice', 'expense', 'payroll'] }
          ]
        },
        {
          id: 'tax_collection',
          name: 'Tax Collection Report',
          description: 'Tax collection trends by period',
          parameters: [
            { name: 'start_date', type: 'date', required: true, label: 'Start Date' },
            { name: 'end_date', type: 'date', required: true, label: 'End Date' },
            { name: 'group_by', type: 'select', required: false, label: 'Group By', options: ['day', 'week', 'month', 'quarter', 'year'] }
          ]
        },
        {
          id: 'tax_liability',
          name: 'Tax Liability Report',
          description: 'Net tax liability calculation',
          parameters: [
            { name: 'start_date', type: 'date', required: true, label: 'Start Date' },
            { name: 'end_date', type: 'date', required: true, label: 'End Date' }
          ]
        },
        {
          id: 'tax_compliance',
          name: 'Tax Compliance Report',
          description: 'Monthly tax compliance tracking',
          parameters: [
            { name: 'start_date', type: 'date', required: true, label: 'Start Date' },
            { name: 'end_date', type: 'date', required: true, label: 'End Date' }
          ]
        },
        {
          id: 'custom_query',
          name: 'Custom Query',
          description: 'Execute custom SQL queries (SELECT only)',
          parameters: [
            { name: 'query_template', type: 'textarea', required: true, label: 'SQL Query' }
          ]
        }
      ];

      res.json({
        success: true,
        data: reportTypes
      });
    } catch (error) {
      console.error('Get report types error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching report types'
      });
    }
  },

  /**
   * Get parameter options for dropdowns
   */
  async getParameterOptions(req, res) {
    try {
      const { type } = req.params;
      let options = [];

      switch (type) {
        case 'expense_categories':
          const categories = await prisma.expenseCategory.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
          });
          options = categories.map(c => ({ value: c.id, label: c.name }));
          break;
        case 'clients':
          const clients = await prisma.client.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
          });
          options = clients.map(c => ({ value: c.id, label: c.name }));
          break;
        case 'projects':
          const projects = await prisma.project.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
          });
          options = projects.map(p => ({ value: p.id, label: p.name }));
          break;
        case 'vendors':
          const vendors = await prisma.vendor.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
          });
          options = vendors.map(v => ({ value: v.id, label: v.name }));
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid parameter type'
          });
      }

      res.json({
        success: true,
        data: options
      });
    } catch (error) {
      console.error('Get parameter options error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching parameter options'
      });
    }
  }
};

module.exports = reportsController;