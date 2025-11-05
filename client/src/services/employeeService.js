import api from './api';

export const employeeService = {
  // Get all employees
  async getEmployees(params = {}) {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  // Get employee by ID
  async getEmployee(id) {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  // Create employee
  async createEmployee(employeeData) {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  // Update employee
  async updateEmployee(id, employeeData) {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  // Delete employee
  async deleteEmployee(id) {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  // Create salary structure
  async createSalaryStructure(salaryData) {
    const response = await api.post('/employees/salary-structure', salaryData);
    return response.data;
  },

  // Record attendance
  async recordAttendance(attendanceData) {
    const response = await api.post('/employees/attendance', attendanceData);
    return response.data;
  },

  // Get employee statistics
  async getEmployeeStats() {
    const response = await api.get('/employees/stats');
    return response.data;
  }
};