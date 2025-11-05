import api from './api';

export const clientService = {
  // Get all clients
  async getClients(params = {}) {
    const response = await api.get('/clients', { params });
    return response.data;
  },

  // Get client by ID
  async getClient(id) {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  // Create client
  async createClient(clientData) {
    const response = await api.post('/clients', clientData);
    return response.data;
  },

  // Update client
  async updateClient(id, clientData) {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },

  // Delete client
  async deleteClient(id) {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },

  // Get client statistics
  async getClientStats() {
    const response = await api.get('/clients/stats');
    return response.data;
  }
};