const financialReportsModel = require('../models/financial-reports.model');
const { validationResult } = require('express-validator');

const financialReportsController = {
  /**
   * Get Revenue Summary Report
   */
  async getRevenueSummary(req, res) {
    try {
      const filters = {
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        client_id: req.query.client_id,
        project_id: req.query.project_id
      };

      const result = await financialReportsModel.getRevenueSummary(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get revenue summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating revenue summary report'
      });
    }
  },

  /**
   * Get Expense Summary Report
   */
  async getExpenseSummary(req, res) {
    try {
      const filters = {
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        category_id: req.query.category_id,
        vendor_id: req.query.vendor_id
      };

      const result = await financialReportsModel.getExpenseSummary(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get expense summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating expense summary report'
      });
    }
  },

  /**
   * Get Profit & Loss Report
   */
  async getProfitLossReport(req, res) {
    try {
      const filters = {
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const result = await financialReportsModel.getProfitLossReport(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get profit & loss report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating profit & loss report'
      });
    }
  },

  /**
   * Get Cash Flow Report
   */
  async getCashFlowReport(req, res) {
    try {
      const filters = {
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const result = await financialReportsModel.getCashFlowReport(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get cash flow report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating cash flow report'
      });
    }
  },

  /**
   * Get Client Performance Report
   */
  async getClientPerformanceReport(req, res) {
    try {
      const filters = {
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const result = await financialReportsModel.getClientPerformanceReport(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get client performance report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating client performance report'
      });
    }
  },

  /**
   * Get Monthly Trends Report
   */
  async getMonthlyTrendsReport(req, res) {
    try {
      const filters = {
        year: req.query.year
      };

      const result = await financialReportsModel.getMonthlyTrendsReport(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get monthly trends report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating monthly trends report'
      });
    }
  },

  /**
   * Get Financial Dashboard Data
   */
  async getFinancialDashboard(req, res) {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const startOfYear = `${currentYear}-01-01`;
      const endOfYear = `${currentYear}-12-31`;
      const startOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
      const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

      const [
        yearlyRevenue,
        yearlyExpenses,
        monthlyRevenue,
        monthlyExpenses,
        clientPerformance,
        monthlyTrends
      ] = await Promise.all([
        financialReportsModel.getRevenueSummary({ start_date: startOfYear, end_date: endOfYear }),
        financialReportsModel.getExpenseSummary({ start_date: startOfYear, end_date: endOfYear }),
        financialReportsModel.getRevenueSummary({ start_date: startOfMonth, end_date: endOfMonth }),
        financialReportsModel.getExpenseSummary({ start_date: startOfMonth, end_date: endOfMonth }),
        financialReportsModel.getClientPerformanceReport({ start_date: startOfYear, end_date: endOfYear }),
        financialReportsModel.getMonthlyTrendsReport({ year: currentYear })
      ]);

      const dashboard = {
        yearly_summary: {
          revenue: yearlyRevenue.summary.total_revenue,
          expenses: yearlyExpenses.summary.total_expenses,
          profit: yearlyRevenue.summary.total_revenue - yearlyExpenses.summary.total_expenses,
          invoices: yearlyRevenue.summary.invoice_count,
          payments: yearlyRevenue.summary.payment_count
        },
        monthly_summary: {
          revenue: monthlyRevenue.summary.total_revenue,
          expenses: monthlyExpenses.summary.total_expenses,
          profit: monthlyRevenue.summary.total_revenue - monthlyExpenses.summary.total_expenses,
          invoices: monthlyRevenue.summary.invoice_count
        },
        top_clients: clientPerformance.slice(0, 5),
        monthly_trends: monthlyTrends
      };

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      console.error('Get financial dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating financial dashboard'
      });
    }
  }
};

module.exports = financialReportsController;