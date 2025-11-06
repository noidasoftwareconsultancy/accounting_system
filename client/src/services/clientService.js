import api from './api';

const clientService = {
  // Get all clients with pagination and search
  async getAll(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    
    const response = await api.get(`/clients?${params}`);
    return response.data;
  },

  // Legacy method for backward compatibility
  async getClients(params = {}) {
    const response = await api.get('/clients', { params });
    return response.data;
  },

  // Get client by ID with full details
  async getById(id) {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  // Legacy method for backward compatibility
  async getClient(id) {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  // Create client
  async create(clientData) {
    const response = await api.post('/clients', clientData);
    return response.data;
  },

  // Legacy method for backward compatibility
  async createClient(clientData) {
    const response = await api.post('/clients', clientData);
    return response.data;
  },

  // Update client
  async update(id, clientData) {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },

  // Legacy method for backward compatibility
  async updateClient(id, clientData) {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },

  // Delete client
  async delete(id) {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },

  // Legacy method for backward compatibility
  async deleteClient(id) {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },

  // Get client statistics
  async getStats() {
    const response = await api.get('/clients/stats');
    return response.data;
  },

  // Legacy method for backward compatibility
  async getClientStats() {
    const response = await api.get('/clients/stats');
    return response.data;
  },

  // Get client projects
  async getClientProjects(clientId, params = {}) {
    const response = await api.get(`/clients/${clientId}/projects`, { params });
    return response.data;
  },

  // Get client invoices
  async getClientInvoices(clientId, params = {}) {
    const response = await api.get(`/clients/${clientId}/invoices`, { params });
    return response.data;
  },

  // Get client contracts
  async getClientContracts(clientId, params = {}) {
    const response = await api.get(`/clients/${clientId}/contracts`, { params });
    return response.data;
  },

  // Get client financial summary
  async getClientFinancialSummary(clientId) {
    const response = await api.get(`/clients/${clientId}/financial-summary`);
    return response.data;
  }
};

export default clientService;