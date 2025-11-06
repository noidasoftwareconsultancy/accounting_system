import api from './api';

const taxRecordService = {
  // Get all tax records
  async getAll(params = {}) {
    const response = await api.get('/tax-records', { params });
    return response.data;
  },

  // Get tax record by ID
  async getById(id) {
    const response = await api.get(`/tax-records/${id}`);
    return response.data;
  },

  // Create new tax record
  async create(recordData) {
    const response = await api.post('/tax-records', recordData);
    return response.data;
  },

  // Update tax record
  async update(id, recordData) {
    const response = await api.put(`/tax-records/${id}`, recordData);
    return response.data;
  },

  // Delete tax record
  async delete(id) {
    const response = await api.delete(`/tax-records/${id}`);
    return response.data;
  },

  // Get tax summary
  async getTaxSummary(startDate, endDate, groupBy = 'tax_rate') {
    const response = await api.get('/tax-records/summary', {
      params: { startDate, endDate, groupBy }
    });
    return response.data;
  },

  // Get tax records by transaction
  async getByTransaction(transactionType, transactionId) {
    const response = await api.get(`/tax-records/transaction/${transactionType}/${transactionId}`);
    return response.data;
  },

  // Get tax liability report
  async getTaxLiabilityReport(startDate, endDate) {
    const response = await api.get('/tax-records/liability-report', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get tax statistics
  async getStats() {
    const response = await api.get('/tax-records/stats');
    return response.data;
  }
};

export default taxRecordService;