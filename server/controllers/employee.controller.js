const employeeModel = require('../models/employee.model');
const { validationResult } = require('express-validator');

const employeeController = {
  /**
   * Get all employees
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        department: req.query.department,
        designation: req.query.designation,
        status: req.query.status
      };

      const result = await employeeModel.getAll(filters, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get employees error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching employees'
      });
    }
  },

  /**
   * Get employee by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const employee = await employeeModel.getById(id);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      res.json({
        success: true,
        data: employee
      });
    } catch (error) {
      console.error('Get employee error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching employee'
      });
    }
  },

  /**
   * Create new employee
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

      const employeeData = {
        ...req.body,
        created_by: req.user.id
      };

      const employee = await employeeModel.create(employeeData);

      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: employee
      });
    } catch (error) {
      console.error('Create employee error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating employee'
      });
    }
  },

  /**
   * Update employee
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
      const employee = await employeeModel.update(id, req.body);

      res.json({
        success: true,
        message: 'Employee updated successfully',
        data: employee
      });
    } catch (error) {
      console.error('Update employee error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating employee'
      });
    }
  },

  /**
   * Delete employee
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await employeeModel.delete(id);

      res.json({
        success: true,
        message: 'Employee deleted successfully'
      });
    } catch (error) {
      console.error('Delete employee error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting employee'
      });
    }
  },

  /**
   * Create salary structure
   */
  async createSalaryStructure(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const salaryData = {
        ...req.body,
        created_by: req.user.id
      };

      const salaryStructure = await employeeModel.createSalaryStructure(salaryData);

      res.status(201).json({
        success: true,
        message: 'Salary structure created successfully',
        data: salaryStructure
      });
    } catch (error) {
      console.error('Create salary structure error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating salary structure'
      });
    }
  },

  /**
   * Record attendance
   */
  async recordAttendance(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const attendanceData = {
        ...req.body,
        created_by: req.user.id
      };

      const attendance = await employeeModel.recordAttendance(attendanceData);

      res.status(201).json({
        success: true,
        message: 'Attendance recorded successfully',
        data: attendance
      });
    } catch (error) {
      console.error('Record attendance error:', error);
      res.status(500).json({
        success: false,
        message: 'Error recording attendance'
      });
    }
  },

  /**
   * Get employee statistics
   */
  async getStats(req, res) {
    try {
      const stats = await employeeModel.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get employee stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching employee statistics'
      });
    }
  },

  /**
   * Get employee attendance
   */
  async getAttendance(req, res) {
    try {
      const { id } = req.params;
      const { start_date, end_date } = req.query;
      
      const attendance = await employeeModel.getAttendance(id, start_date, end_date);
      
      res.json({
        success: true,
        data: attendance
      });
    } catch (error) {
      console.error('Get attendance error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching attendance'
      });
    }
  },

  /**
   * Bulk record attendance
   */
  async bulkRecordAttendance(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { attendanceRecords } = req.body;
      await employeeModel.bulkRecordAttendance(attendanceRecords, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Attendance recorded successfully'
      });
    } catch (error) {
      console.error('Bulk record attendance error:', error);
      res.status(500).json({
        success: false,
        message: 'Error recording attendance'
      });
    }
  },

  /**
   * Get attendance summary
   */
  async getAttendanceSummary(req, res) {
    try {
      const { id } = req.params;
      const { month, year } = req.query;
      
      const summary = await employeeModel.getAttendanceSummary(
        id, 
        parseInt(month), 
        parseInt(year)
      );
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Get attendance summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching attendance summary'
      });
    }
  },

  /**
   * Get salary history
   */
  async getSalaryHistory(req, res) {
    try {
      const { id } = req.params;
      const history = await employeeModel.getSalaryHistory(id);
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Get salary history error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching salary history'
      });
    }
  },

  /**
   * Update salary structure
   */
  async updateSalaryStructure(req, res) {
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
      const salaryStructure = await employeeModel.updateSalaryStructure(
        id, 
        req.body, 
        req.user.id
      );

      res.json({
        success: true,
        message: 'Salary structure updated successfully',
        data: salaryStructure
      });
    } catch (error) {
      console.error('Update salary structure error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating salary structure'
      });
    }
  },

  /**
   * Get employees by department
   */
  async getByDepartment(req, res) {
    try {
      const { department } = req.params;
      const employees = await employeeModel.getByDepartment(department);
      
      res.json({
        success: true,
        data: employees
      });
    } catch (error) {
      console.error('Get employees by department error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching employees by department'
      });
    }
  },

  /**
   * Search employees
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

      const employees = await employeeModel.search(q.trim());
      
      res.json({
        success: true,
        data: employees
      });
    } catch (error) {
      console.error('Search employees error:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching employees'
      });
    }
  },

  /**
   * Get department analytics
   */
  async getDepartmentAnalytics(req, res) {
    try {
      const analytics = await employeeModel.getDepartmentAnalytics();
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Get department analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching department analytics'
      });
    }
  }
};

module.exports = employeeController;