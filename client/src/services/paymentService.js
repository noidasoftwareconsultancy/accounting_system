import api from './api';

const paymentService = {
  // Get all payments
  async getAll(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null))
    });
    
    const response = await api.get(`/payments?${params}`);
    return response.data;
  },

  // Get payment by ID
  async getById(id) {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  // Record payment
  async recordPayment(paymentData) {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  // Update payment
  async updatePayment(id, paymentData) {
    const response = await api.put(`/payments/${id}`, paymentData);
    return response.data;
  },

  // Delete payment
  async deletePayment(id) {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  },

  // Get payment statistics
  async getStats() {
    const response = await api.get('/payments/stats');
    return response.data;
  },

  // Get payments by invoice
  async getByInvoice(invoiceId) {
    const response = await api.get(`/payments/invoice/${invoiceId}`);
    return response.data;
  }
};

export default paymentService;