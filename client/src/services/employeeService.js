import api from './api';

const employeeService = {
  // Get all employees with pagination
  async getAll(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null))
    });
    
    const response = await api.get(`/employees?${params}`);
    return response.data;
  },

  // Legacy method for backward compatibility
  async getEmployees(params = {}) {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  // Get employee by ID
  async getById(id) {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  // Legacy method for backward compatibility
  async getEmployee(id) {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  // Create employee
  async create(employeeData) {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  // Legacy method for backward compatibility
  async createEmployee(employeeData) {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  // Update employee
  async update(id, employeeData) {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  // Legacy method for backward compatibility
  async updateEmployee(id, employeeData) {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  // Delete employee
  async delete(id) {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  // Legacy method for backward compatibility
  async deleteEmployee(id) {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  // Salary structure management
  async createSalaryStructure(salaryData) {
    const response = await api.post('/employees/salary-structure', salaryData);
    return response.data;
  },

  async getSalaryHistory(employeeId) {
    const response = await api.get(`/employees/${employeeId}/salary-history`);
    return response.data;
  },

  async updateSalaryStructure(employeeId, salaryData) {
    const response = await api.put(`/employees/${employeeId}/salary-structure`, salaryData);
    return response.data;
  },

  // Attendance management
  async recordAttendance(attendanceData) {
    const response = await api.post('/employees/attendance', attendanceData);
    return response.data;
  },

  async bulkRecordAttendance(attendanceRecords) {
    const response = await api.post('/employees/attendance/bulk', { attendanceRecords });
    return response.data;
  },

  async getAttendance(employeeId, startDate, endDate) {
    const response = await api.get(`/employees/${employeeId}/attendance`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  async getAttendanceSummary(employeeId, month, year) {
    const response = await api.get(`/employees/${employeeId}/attendance-summary`, {
      params: { month, year }
    });
    return response.data;
  },

  // Department and search
  async getByDepartment(department) {
    const response = await api.get(`/employees/department/${department}`);
    return response.data;
  },

  async search(query) {
    const response = await api.get('/employees/search', {
      params: { q: query }
    });
    return response.data;
  },

  // Analytics and statistics
  async getStats() {
    const response = await api.get('/employees/stats');
    return response.data;
  },

  // Legacy method for backward compatibility
  async getEmployeeStats() {
    const response = await api.get('/employees/stats');
    return response.data;
  },

  async getDepartmentAnalytics() {
    const response = await api.get('/employees/analytics/departments');
    return response.data;
  },

  // Additional methods to align with server capabilities
  async bulkUpdateAttendance(attendanceRecords) {
    const response = await api.post('/employees/attendance/bulk', { attendanceRecords });
    return response.data;
  },

  async getEmployeesByDepartment(department) {
    const response = await api.get(`/employees/department/${department}`);
    return response.data;
  },

  async searchEmployees(query) {
    const response = await api.get('/employees/search', { params: { q: query } });
    return response.data;
  },

  // Salary structure methods
  async getSalaryStructure(employeeId) {
    const response = await api.get(`/employees/${employeeId}/salary-structure`);
    return response.data;
  },

  async createEmployeeSalaryStructure(employeeId, salaryData) {
    const response = await api.post(`/employees/${employeeId}/salary-structure`, salaryData);
    return response.data;
  },

  async updateEmployeeSalaryStructure(employeeId, salaryData) {
    const response = await api.put(`/employees/${employeeId}/salary-structure`, salaryData);
    return response.data;
  },

  // Performance and evaluation methods
  async getEmployeePerformance(employeeId, year) {
    const response = await api.get(`/employees/${employeeId}/performance`, { params: { year } });
    return response.data;
  },

  async recordPerformanceReview(reviewData) {
    const response = await api.post('/employees/performance-reviews', reviewData);
    return response.data;
  },

  // Leave management methods
  async getEmployeeLeaves(employeeId, year) {
    const response = await api.get(`/employees/${employeeId}/leaves`, { params: { year } });
    return response.data;
  },

  async applyLeave(leaveData) {
    const response = await api.post('/employees/leaves', leaveData);
    return response.data;
  },

  async approveLeave(leaveId) {
    const response = await api.patch(`/employees/leaves/${leaveId}/approve`);
    return response.data;
  },

  async rejectLeave(leaveId, reason) {
    const response = await api.patch(`/employees/leaves/${leaveId}/reject`, { reason });
    return response.data;
  }
};

export default employeeService;