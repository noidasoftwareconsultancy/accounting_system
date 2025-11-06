import api from './api';

const taxService = {
  // Tax Rates
  async getTaxRates(params = {}) {
    const response = await api.get('/tax/rates', { params });
    return response.data;
  },

  async getTaxRate(id) {
    const response = await api.get(`/tax/rates/${id}`);
    return response.data;
  },

  async createTaxRate(taxRateData) {
    const response = await api.post('/tax/rates', taxRateData);
    return response.data;
  },

  async updateTaxRate(id, taxRateData) {
    const response = await api.put(`/tax/rates/${id}`, taxRateData);
    return response.data;
  },

  async deleteTaxRate(id) {
    const response = await api.delete(`/tax/rates/${id}`);
    return response.data;
  },

  // Tax Records
  async getTaxRecords(params = {}) {
    const response = await api.get('/tax/records', { params });
    return response.data;
  },

  async createTaxRecord(taxRecordData) {
    const response = await api.post('/tax/records', taxRecordData);
    return response.data;
  },

  // Tax Reports
  async getTaxSummaryReport(params = {}) {
    const response = await api.get('/tax/reports/summary', { params });
    return response.data;
  },

  async getTaxCollectionReport(params = {}) {
    const response = await api.get('/tax/reports/collection', { params });
    return response.data;
  },

  async getTaxLiabilityReport(params = {}) {
    const response = await api.get('/tax/reports/liability', { params });
    return response.data;
  },

  async getTaxComplianceReport(params = {}) {
    const response = await api.get('/tax/reports/compliance', { params });
    return response.data;
  },

  // Utility Methods
  async getTaxTypes() {
    const response = await api.get('/tax/types');
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
    a.download = `${filename || 'tax-report'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  exportToJson(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'tax-report'}.json`;
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
  },

  // Tax Calculation Helpers
  calculateTaxAmount(amount, taxRate) {
    return (parseFloat(amount) * parseFloat(taxRate)) / 100;
  },

  calculateTotalWithTax(amount, taxRate) {
    const taxAmount = this.calculateTaxAmount(amount, taxRate);
    return parseFloat(amount) + taxAmount;
  },

  calculateAmountFromTotal(totalAmount, taxRate) {
    const divisor = 1 + (parseFloat(taxRate) / 100);
    return parseFloat(totalAmount) / divisor;
  }
};

export default taxService;