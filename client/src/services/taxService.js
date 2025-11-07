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

  // Tax Types
  async getTaxTypes() {
    const response = await api.get('/tax/types');
    return response.data;
  },

  async createTaxType(taxTypeData) {
    const response = await api.post('/tax/types', taxTypeData);
    return response.data;
  },

  async updateTaxType(id, taxTypeData) {
    const response = await api.put(`/tax/types/${id}`, taxTypeData);
    return response.data;
  },

  async deleteTaxType(id) {
    const response = await api.delete(`/tax/types/${id}`);
    return response.data;
  },

  // Tax Records
  async getTaxRecords(params = {}) {
    const response = await api.get('/tax/records', { params });
    return response.data;
  },

  async getTaxRecord(id) {
    const response = await api.get(`/tax/records/${id}`);
    return response.data;
  },

  async createTaxRecord(taxRecordData) {
    const response = await api.post('/tax/records', taxRecordData);
    return response.data;
  },

  async updateTaxRecord(id, taxRecordData) {
    const response = await api.put(`/tax/records/${id}`, taxRecordData);
    return response.data;
  },

  async deleteTaxRecord(id) {
    const response = await api.delete(`/tax/records/${id}`);
    return response.data;
  },

  // Tax Calculations
  async calculateTax(calculationData) {
    const response = await api.post('/tax/calculate', calculationData);
    return response.data;
  },

  async calculateIncomeTax(incomeData) {
    const response = await api.post('/tax/calculate/income', incomeData);
    return response.data;
  },

  async calculateSalesTax(salesData) {
    const response = await api.post('/tax/calculate/sales', salesData);
    return response.data;
  },

  // Tax Reports
  async getTaxReports(params = {}) {
    const response = await api.get('/tax/reports', { params });
    return response.data;
  },

  async generateTaxReport(reportData) {
    const response = await api.post('/tax/reports/generate', reportData);
    return response.data;
  },

  async getTaxSummary(period) {
    const response = await api.get('/tax/summary', { params: { period } });
    return response.data;
  },

  async getQuarterlyTaxReport(year, quarter) {
    const response = await api.get('/tax/reports/quarterly', { 
      params: { year, quarter } 
    });
    return response.data;
  },

  async getAnnualTaxReport(year) {
    const response = await api.get('/tax/reports/annual', { 
      params: { year } 
    });
    return response.data;
  },

  // Tax Report Methods (aligned with server API)
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

  // Tax Filing
  async getTaxFilings(params = {}) {
    const response = await api.get('/tax/filings', { params });
    return response.data;
  },

  async createTaxFiling(filingData) {
    const response = await api.post('/tax/filings', filingData);
    return response.data;
  },

  async updateTaxFiling(id, filingData) {
    const response = await api.put(`/tax/filings/${id}`, filingData);
    return response.data;
  },

  async submitTaxFiling(id) {
    const response = await api.post(`/tax/filings/${id}/submit`);
    return response.data;
  },

  // Tax Settings
  async getTaxSettings() {
    const response = await api.get('/tax/settings');
    return response.data;
  },

  async updateTaxSettings(settingsData) {
    const response = await api.put('/tax/settings', settingsData);
    return response.data;
  },

  // Utility Methods
  formatPercentage(value, decimals = 2) {
    return `${parseFloat(value).toFixed(decimals)}%`;
  },

  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  formatDateTime(date) {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Tax Calculation Helpers
  calculateTaxAmount(amount, rate, isPercentage = true) {
    if (isPercentage) {
      return (amount * rate) / 100;
    }
    return rate;
  },

  calculateNetAmount(grossAmount, taxAmount) {
    return grossAmount - taxAmount;
  },

  calculateGrossAmount(netAmount, taxRate, isPercentage = true) {
    if (isPercentage) {
      return netAmount / (1 - (taxRate / 100));
    }
    return netAmount + taxRate;
  },

  // Validation Helpers
  validateTaxRate(rate, isPercentage = true) {
    if (isPercentage) {
      return rate >= 0 && rate <= 100;
    }
    return rate >= 0;
  },

  validateTaxPeriod(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start < end;
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
  }
};

export default taxService;