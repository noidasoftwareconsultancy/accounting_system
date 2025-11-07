import api from './api';

const creditNoteService = {
  // Get all credit notes
  async getAll(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null))
    });
    
    const response = await api.get(`/credit-notes?${params}`);
    return response.data;
  },

  // Get credit note by ID
  async getById(id) {
    const response = await api.get(`/credit-notes/${id}`);
    return response.data;
  },

  // Create credit note
  async create(creditNoteData) {
    const response = await api.post('/credit-notes', creditNoteData);
    return response.data;
  },

  // Update credit note
  async update(id, creditNoteData) {
    const response = await api.put(`/credit-notes/${id}`, creditNoteData);
    return response.data;
  },

  // Delete credit note
  async delete(id) {
    const response = await api.delete(`/credit-notes/${id}`);
    return response.data;
  },

  // Get credit note statistics
  async getStats() {
    const response = await api.get('/credit-notes/stats');
    return response.data;
  },

  // Get credit notes by invoice
  async getByInvoice(invoiceId, params = {}) {
    const response = await api.get(`/credit-notes/invoice/${invoiceId}`, { params });
    return response.data;
  },

  // Update credit note status
  async updateStatus(id, status) {
    const response = await api.patch(`/credit-notes/${id}/status`, { status });
    return response.data;
  },

  // Apply credit note
  async applyCreditNote(id) {
    const response = await api.patch(`/credit-notes/${id}/apply`);
    return response.data;
  },

  // Get credit note PDF
  async getCreditNotePDF(id) {
    const response = await api.get(`/credit-notes/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Generate credit note number
  async generateCreditNoteNumber() {
    const response = await api.post('/credit-notes/generate-number');
    return response.data;
  }
};

export default creditNoteService;
