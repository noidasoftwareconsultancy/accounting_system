const payrollModel = require('../models/payroll.model');
const { validationResult } = require('express-validator');

const payrollController = {
  /**
   * Get all payroll runs
   */
  async getAllRuns(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await payrollModel.getAllRuns(page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get payroll runs error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching payroll runs'
      });
    }
  },

  /**
   * Get payroll run by ID
   */
  async getRunById(req, res) {
    try {
      const { id } = req.params;
      const payrollRun = await payrollModel.getRunById(id);

      if (!payrollRun) {
        return res.status(404).json({
          success: false,
          message: 'Payroll run not found'
        });
      }

      res.json({
        success: true,
        data: payrollRun
      });
    } catch (error) {
      console.error('Get payroll run error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching payroll run'
      });
    }
  },

  /**
   * Create payroll run
   */
  async createRun(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const runData = {
        ...req.body,
        processed_by: req.user.id
      };

      const payrollRun = await payrollModel.createRun(runData);

      res.status(201).json({
        success: true,
        message: 'Payroll run created successfully',
        data: payrollRun
      });
    } catch (error) {
      console.error('Create payroll run error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating payroll run'
      });
    }
  },

  /**
   * Update payroll run
   */
  async updateRun(req, res) {
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
      const runData = req.body;

      const payrollRun = await payrollModel.updateRun(id, runData);

      if (!payrollRun) {
        return res.status(404).json({
          success: false,
          message: 'Payroll run not found'
        });
      }

      res.json({
        success: true,
        message: 'Payroll run updated successfully',
        data: payrollRun
      });
    } catch (error) {
      console.error('Update payroll run error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating payroll run'
      });
    }
  },

  /**
   * Delete payroll run
   */
  async deleteRun(req, res) {
    try {
      const { id } = req.params;
      
      // Check if run has been processed
      const run = await payrollModel.getRunById(id);
      if (!run) {
        return res.status(404).json({
          success: false,
          message: 'Payroll run not found'
        });
      }

      if (run.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete a completed payroll run'
        });
      }

      await payrollModel.deleteRun(id);

      res.json({
        success: true,
        message: 'Payroll run deleted successfully'
      });
    } catch (error) {
      console.error('Delete payroll run error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting payroll run'
      });
    }
  },

  /**
   * Process payroll
   */
  async processPayroll(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { runId } = req.params;
      const { employeePayslips } = req.body;

      const payslips = await payrollModel.processPayroll(runId, employeePayslips, req.user.id);

      res.json({
        success: true,
        message: 'Payroll processed successfully',
        data: payslips
      });
    } catch (error) {
      console.error('Process payroll error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing payroll'
      });
    }
  },

  /**
   * Get payslip by ID
   */
  async getPayslipById(req, res) {
    try {
      const { id } = req.params;
      const payslip = await payrollModel.getPayslipById(id);

      if (!payslip) {
        return res.status(404).json({
          success: false,
          message: 'Payslip not found'
        });
      }

      res.json({
        success: true,
        data: payslip
      });
    } catch (error) {
      console.error('Get payslip error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching payslip'
      });
    }
  },

  /**
   * Get employee payslips
   */
  async getEmployeePayslips(req, res) {
    try {
      const { employeeId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;

      const result = await payrollModel.getEmployeePayslips(employeeId, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get employee payslips error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching employee payslips'
      });
    }
  },

  /**
   * Update payslip payment status
   */
  async updatePaymentStatus(req, res) {
    try {
      const { payslipId } = req.params;
      const { status, payment_date } = req.body;

      const payslip = await payrollModel.updatePaymentStatus(payslipId, status, payment_date);

      res.json({
        success: true,
        message: 'Payment status updated successfully',
        data: payslip
      });
    } catch (error) {
      console.error('Update payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating payment status'
      });
    }
  },

  /**
   * Get payroll statistics
   */
  async getStats(req, res) {
    try {
      const stats = await payrollModel.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get payroll stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching payroll statistics'
      });
    }
  },

  /**
   * Generate payroll data
   */
  async generatePayrollData(req, res) {
    try {
      const { runId } = req.params;
      const { employeeIds } = req.query;
      
      const payrollData = await payrollModel.generatePayrollData(
        runId, 
        employeeIds ? employeeIds.split(',') : null
      );
      
      res.json({
        success: true,
        data: payrollData
      });
    } catch (error) {
      console.error('Generate payroll data error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error generating payroll data'
      });
    }
  },

  /**
   * Get payroll analytics
   */
  async getAnalytics(req, res) {
    try {
      const { period = 'year' } = req.query;
      const analytics = await payrollModel.getAnalytics(period);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Get payroll analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching payroll analytics'
      });
    }
  },

  /**
   * Bulk update payment status
   */
  async bulkUpdatePaymentStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { payslipIds, status, paymentDate } = req.body;
      await payrollModel.bulkUpdatePaymentStatus(payslipIds, status, paymentDate);

      res.json({
        success: true,
        message: 'Payment status updated successfully'
      });
    } catch (error) {
      console.error('Bulk update payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating payment status'
      });
    }
  }
};

module.exports = payrollController;