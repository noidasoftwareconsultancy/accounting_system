import api from './api';

const invoiceService = {
  // Get all invoices
  async getAll(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null))
    });
    
    const response = await api.get(`/invoices?${params}`);
    return response.data;
  },

  // Get all invoices (legacy method)
  async getInvoices(params = {}) {
    const response = await api.get('/invoices', { params });
    return response.data;
  },

  // Get invoice by ID
  async getInvoice(id) {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  // Create invoice
  async createInvoice(invoiceData) {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  },

  // Update invoice
  async updateInvoice(id, invoiceData) {
    const response = await api.put(`/invoices/${id}`, invoiceData);
    return response.data;
  },

  // Delete invoice
  async deleteInvoice(id) {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  },

  // Record payment
  async recordPayment(paymentData) {
    const response = await api.post('/invoices/payments', paymentData);
    return response.data;
  },

  // Get invoice statistics
  async getInvoiceStats() {
    const response = await api.get('/invoices/stats');
    return response.data;
  },

  // Generate invoice number
  async generateInvoiceNumber() {
    const response = await api.get('/invoices/generate-number');
    return response.data;
  },

  // Send invoice
  async sendInvoice(id) {
    const response = await api.post(`/invoices/${id}/send`);
    return response.data;
  },

  // Mark invoice as paid
  async markAsPaid(id) {
    const response = await api.patch(`/invoices/${id}/mark-paid`);
    return response.data;
  },

  // Get invoice PDF
  async getInvoicePDF(id) {
    const response = await api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Duplicate invoice
  async duplicateInvoice(id) {
    const response = await api.post(`/invoices/${id}/duplicate`);
    return response.data;
  },

  // Get overdue invoices
  async getOverdueInvoices() {
    const response = await api.get('/invoices/overdue');
    return response.data;
  },

  // Get invoice by client
  async getInvoicesByClient(clientId, params = {}) {
    const response = await api.get(`/invoices/client/${clientId}`, { params });
    return response.data;
  },

  // Get invoice by project
  async getInvoicesByProject(projectId, params = {}) {
    const response = await api.get(`/invoices/project/${projectId}`, { params });
    return response.data;
  }
};

export default invoiceService;