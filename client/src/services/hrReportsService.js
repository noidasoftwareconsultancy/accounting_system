import api from './api';

const hrReportsService = {
  // Get employee summary report
  async getEmployeeSummary(params = {}) {
    const response = await api.get('/hr-reports/employee-summary', { params });
    return response.data;
  },

  // Get payroll summary report
  async getPayrollSummary(params = {}) {
    const response = await api.get('/hr-reports/payroll-summary', { params });
    return response.data;
  },

  // Get attendance report
  async getAttendanceReport(params = {}) {
    const response = await api.get('/hr-reports/attendance', { params });
    return response.data;
  },

  // Get department performance report
  async getDepartmentPerformance(params = {}) {
    const response = await api.get('/hr-reports/department-performance', { params });
    return response.data;
  },

  // Get employee lifecycle report
  async getEmployeeLifecycleReport(params = {}) {
    const response = await api.get('/hr-reports/employee-lifecycle', { params });
    return response.data;
  },

  // Get HR dashboard
  async getHRDashboard(params = {}) {
    const response = await api.get('/hr-reports/dashboard', { params });
    return response.data;
  },

  // Export methods
  exportToCsv(data, filename) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('No data to export');
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'hr-report'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  exportToJson(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'hr-report'}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  // Formatting helpers
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  formatDate(date) {
    return new Date(date).toLocaleDateString();
  },

  formatDateTime(date) {
    return new Date(date).toLocaleString();
  },

  formatPercentage(value, decimals = 2) {
    return `${(value * 100).toFixed(decimals)}%`;
  }
};

export default hrReportsService;
