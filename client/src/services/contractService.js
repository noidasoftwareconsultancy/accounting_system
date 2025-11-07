import api from './api';

const contractService = {
  // Get all contracts
  async getAll(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null))
    });
    
    const response = await api.get(`/contracts?${params}`);
    return response.data;
  },

  // Get contract by ID
  async getById(id) {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  },

  // Create contract
  async create(contractData) {
    const response = await api.post('/contracts', contractData);
    return response.data;
  },

  // Update contract
  async update(id, contractData) {
    const response = await api.put(`/contracts/${id}`, contractData);
    return response.data;
  },

  // Delete contract
  async delete(id) {
    const response = await api.delete(`/contracts/${id}`);
    return response.data;
  },

  // Get contract statistics
  async getStats() {
    const response = await api.get('/contracts/stats');
    return response.data;
  },

  // Get expiring contracts
  async getExpiringContracts(days = 30) {
    const response = await api.get('/contracts/expiring', { params: { days } });
    return response.data;
  },

  // Get contracts by client
  async getByClient(clientId, params = {}) {
    const response = await api.get(`/contracts/client/${clientId}`, { params });
    return response.data;
  },

  // Get contracts by project
  async getByProject(projectId, params = {}) {
    const response = await api.get(`/contracts/project/${projectId}`, { params });
    return response.data;
  },

  // Update contract status
  async updateStatus(id, status) {
    const response = await api.patch(`/contracts/${id}/status`, { status });
    return response.data;
  },

  // Document management
  async uploadDocument(id, file) {
    const formData = new FormData();
    formData.append('document', file);
    
    const response = await api.post(`/contracts/${id}/document`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async getDocument(id) {
    const response = await api.get(`/contracts/${id}/document`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async deleteDocument(id) {
    const response = await api.delete(`/contracts/${id}/document`);
    return response.data;
  }
};

export default contractService;
