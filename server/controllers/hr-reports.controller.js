const hrReportsModel = require('../models/hr-reports.model');
const { validationResult } = require('express-validator');

const hrReportsController = {
  /**
   * Get Employee Summary Report
   */
  async getEmployeeSummary(req, res) {
    try {
      const filters = {
        department: req.query.department,
        status: req.query.status
      };

      const result = await hrReportsModel.getEmployeeSummary(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get employee summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating employee summary report'
      });
    }
  },

  /**
   * Get Payroll Summary Report
   */
  async getPayrollSummary(req, res) {
    try {
      const filters = {
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        month: req.query.month,
        year: req.query.year
      };

      const result = await hrReportsModel.getPayrollSummary(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get payroll summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating payroll summary report'
      });
    }
  },

  /**
   * Get Attendance Report
   */
  async getAttendanceReport(req, res) {
    try {
      const filters = {
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        employee_id: req.query.employee_id,
        department: req.query.department
      };

      const result = await hrReportsModel.getAttendanceReport(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get attendance report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating attendance report'
      });
    }
  },

  /**
   * Get Department Performance Report
   */
  async getDepartmentPerformance(req, res) {
    try {
      const filters = {
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const result = await hrReportsModel.getDepartmentPerformance(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get department performance error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating department performance report'
      });
    }
  },

  /**
   * Get Employee Lifecycle Report
   */
  async getEmployeeLifecycleReport(req, res) {
    try {
      const filters = {
        year: req.query.year
      };

      const result = await hrReportsModel.getEmployeeLifecycleReport(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get employee lifecycle report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating employee lifecycle report'
      });
    }
  },

  /**
   * Get HR Dashboard Data
   */
  async getHRDashboard(req, res) {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      const [
        employeeSummary,
        currentPayroll,
        departmentPerformance,
        lifecycleData
      ] = await Promise.all([
        hrReportsModel.getEmployeeSummary({}),
        hrReportsModel.getPayrollSummary({ month: currentMonth, year: currentYear }),
        hrReportsModel.getDepartmentPerformance({}),
        hrReportsModel.getEmployeeLifecycleReport({ year: currentYear })
      ]);

      const dashboard = {
        employee_overview: {
          total_employees: employeeSummary.summary.total_employees,
          total_salary_cost: employeeSummary.summary.total_salary_cost,
          departments: Object.keys(employeeSummary.summary.by_department).length
        },
        current_payroll: {
          runs: currentPayroll.summary.total_runs,
          employees_paid: currentPayroll.summary.total_employees,
          total_cost: currentPayroll.summary.total_net_salary
        },
        department_breakdown: departmentPerformance,
        hiring_trends: lifecycleData.monthly_data
      };

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      console.error('Get HR dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating HR dashboard'
      });
    }
  }
};

module.exports = hrReportsController;