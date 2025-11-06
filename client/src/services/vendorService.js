import api from './api';

const vendorService = {
  // Get all vendors
  async getAll() {
    const response = await api.get('/vendors');
    return response.data;
  },

  // Get vendor by ID
  async getById(id) {
    const response = await api.get(`/vendors/${id}`);
    return response.data;
  },

  // Create vendor
  async create(vendorData) {
    const response = await api.post('/vendors', vendorData);
    return response.data;
  },

  // Update vendor
  async update(id, vendorData) {
    const response = await api.put(`/vendors/${id}`, vendorData);
    return response.data;
  },

  // Delete vendor
  async delete(id) {
    const response = await api.delete(`/vendors/${id}`);
    return response.data;
  },

  // Get vendor statistics
  async getStats() {
    const response = await api.get('/vendors/stats');
    return response.data;
  },

  // Get vendor expense summary
  async getExpenseSummary(id, startDate, endDate) {
    const response = await api.get(`/vendors/${id}/expenses`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  // Get vendors with trends
  async getVendorsWithTrends(period = 'month') {
    const response = await api.get('/vendors/trends', {
      params: { period }
    });
    return response.data;
  },

  // Search vendors
  async search(query) {
    const response = await api.get('/vendors/search', {
      params: { q: query }
    });
    return response.data;
  },

  // Get vendor payment analysis
  async getPaymentAnalysis(id) {
    const response = await api.get(`/vendors/${id}/analysis`);
    return response.data;
  }
};

export default vendorService;