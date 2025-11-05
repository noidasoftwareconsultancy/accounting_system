import api from './api';

export const payrollService = {
  // Get all payroll runs
  async getPayrollRuns(params = {}) {
    const response = await api.get('/payroll/runs', { params });
    return response.data;
  },

  // Get payroll run by ID
  async getPayrollRun(id) {
    const response = await api.get(`/payroll/runs/${id}`);
    return response.data;
  },

  // Create payroll run
  async createPayrollRun(runData) {
    const response = await api.post('/payroll/runs', runData);
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
  async getPayslip(id) {
    const response = await api.get(`/payroll/payslips/${id}`);
    return response.data;
  },

  // Get employee payslips
  async getEmployeePayslips(employeeId, params = {}) {
    const response = await api.get(`/payroll/employees/${employeeId}/payslips`, { params });
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

  // Get payroll statistics
  async getPayrollStats() {
    const response = await api.get('/payroll/runs/stats');
    return response.data;
  }
};