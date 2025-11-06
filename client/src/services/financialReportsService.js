import api from './api';

const financialReportsService = {
  // Financial Reports
  async getRevenueSummary(params = {}) {
    const response = await api.get('/financial-reports/revenue-summary', { params });
    return response.data;
  },

  async getExpenseSummary(params = {}) {
    const response = await api.get('/financial-reports/expense-summary', { params });
    return response.data;
  },

  async getProfitLossReport(params = {}) {
    const response = await api.get('/financial-reports/profit-loss', { params });
    return response.data;
  },

  async getCashFlowReport(params = {}) {
    const response = await api.get('/financial-reports/cash-flow', { params });
    return response.data;
  },

  async getClientPerformanceReport(params = {}) {
    const response = await api.get('/financial-reports/client-performance', { params });
    return response.data;
  },

  async getMonthlyTrendsReport(params = {}) {
    const response = await api.get('/financial-reports/monthly-trends', { params });
    return response.data;
  },

  async getFinancialDashboard(params = {}) {
    const response = await api.get('/financial-reports/dashboard', { params });
    return response.data;
  },

  // Export Methods
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
    a.download = `${filename || 'financial-report'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  exportToJson(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'financial-report'}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  // Formatting Helpers
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  formatPercentage(value, decimals = 2) {
    return `${parseFloat(value).toFixed(decimals)}%`;
  },

  formatDate(date) {
    return new Date(date).toLocaleDateString();
  },

  formatDateTime(date) {
    return new Date(date).toLocaleString();
  }
};

export default financialReportsService;