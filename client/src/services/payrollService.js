import api from './api';

const payrollService = {
  // Get all payroll runs with pagination
  async getAll(page = 1, limit = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    const response = await api.get(`/payroll/runs?${params}`);
    return response.data;
  },

  // Legacy method for backward compatibility
  async getPayrollRuns(params = {}) {
    const response = await api.get('/payroll/runs', { params });
    return response.data;
  },

  // Get payroll run by ID
  async getById(id) {
    const response = await api.get(`/payroll/runs/${id}`);
    return response.data;
  },

  // Legacy method for backward compatibility
  async getPayrollRun(id) {
    const response = await api.get(`/payroll/runs/${id}`);
    return response.data;
  },

  // Create payroll run
  async create(runData) {
    const response = await api.post('/payroll/runs', runData);
    return response.data;
  },

  // Legacy method for backward compatibility
  async createPayrollRun(runData) {
    const response = await api.post('/payroll/runs', runData);
    return response.data;
  },

  // Generate payroll data
  async generatePayrollData(runId, employeeIds = null) {
    const response = await api.get(`/payroll/runs/${runId}/generate`, {
      params: employeeIds ? { employeeIds: employeeIds.join(',') } : {}
    });
    return response.data;
  },

  // Process payroll
  async processPayroll(runId, employeePayslips) {
    const response = await api.post(`/payroll/runs/${runId}/process`, {
      employeePayslips
    });
    return response.data;
  },

  // Get payslip by ID
  async getPayslipById(id) {
    const response = await api.get(`/payroll/payslips/${id}`);
    return response.data;
  },

  // Legacy method for backward compatibility
  async getPayslip(id) {
    const response = await api.get(`/payroll/payslips/${id}`);
    return response.data;
  },

  // Get employee payslips
  async getEmployeePayslips(employeeId, page = 1, limit = 12) {
    const response = await api.get(`/payroll/employees/${employeeId}/payslips`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Update payslip payment status
  async updatePaymentStatus(payslipId, status, paymentDate) {
    const response = await api.patch(`/payroll/payslips/${payslipId}/payment-status`, {
      status,
      payment_date: paymentDate
    });
    return response.data;
  },

  // Bulk update payment status
  async bulkUpdatePaymentStatus(payslipIds, status, paymentDate) {
    const response = await api.patch('/payroll/payslips/bulk-payment-status', {
      payslipIds,
      status,
      paymentDate
    });
    return response.data;
  },

  // Get payroll analytics
  async getAnalytics(period = 'year') {
    const response = await api.get('/payroll/analytics', {
      params: { period }
    });
    return response.data;
  },

  // Get payroll statistics
  async getStats() {
    const response = await api.get('/payroll/runs/stats');
    return response.data;
  },

  // Legacy method for backward compatibility
  async getPayrollStats() {
    const response = await api.get('/payroll/runs/stats');
    return response.data;
  }
};

export default payrollService;