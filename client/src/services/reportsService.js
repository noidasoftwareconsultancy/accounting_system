import api from './api';

const reportsService = {
  // Report Templates
  async getReportTemplates(params = {}) {
    const response = await api.get('/reports/templates', { params });
    return response.data;
  },

  async getReportTemplate(id) {
    const response = await api.get(`/reports/templates/${id}`);
    return response.data;
  },

  async createReportTemplate(templateData) {
    const response = await api.post('/reports/templates', templateData);
    return response.data;
  },

  async updateReportTemplate(id, templateData) {
    const response = await api.put(`/reports/templates/${id}`, templateData);
    return response.data;
  },

  async deleteReportTemplate(id) {
    const response = await api.delete(`/reports/templates/${id}`);
    return response.data;
  },

  // Report Execution
  async executeReport(templateId, parameters = {}, saveReport = false) {
    const response = await api.post(`/reports/templates/${templateId}/execute`, {
      parameters,
      save_report: saveReport
    });
    return response.data;
  },

  // Saved Reports
  async getSavedReports(params = {}) {
    const response = await api.get('/reports/saved', { params });
    return response.data;
  },

  async getSavedReport(id) {
    const response = await api.get(`/reports/saved/${id}`);
    return response.data;
  },

  async deleteSavedReport(id) {
    const response = await api.delete(`/reports/saved/${id}`);
    return response.data;
  },

  // Test Method
  async testConnection() {
    const response = await api.get('/reports/test');
    return response.data;
  },

  // Utility Methods
  async getReportTypes() {
    const response = await api.get('/reports/types');
    return response.data;
  },

  async getParameterOptions(type) {
    const response = await api.get(`/reports/parameters/${type}/options`);
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
          // Handle values that might contain commas or quotes
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
    a.download = `${filename || 'report'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  exportToJson(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'report'}.json`;
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

export default reportsService;