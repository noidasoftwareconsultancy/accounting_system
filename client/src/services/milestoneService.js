import api from './api';

const milestoneService = {
  // Get all milestones
  async getAll(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null))
    });
    
    const response = await api.get(`/milestones?${params}`);
    return response.data;
  },

  // Get milestone by ID
  async getById(id) {
    const response = await api.get(`/milestones/${id}`);
    return response.data;
  },

  // Create milestone
  async create(milestoneData) {
    const response = await api.post('/milestones', milestoneData);
    return response.data;
  },

  // Update milestone
  async update(id, milestoneData) {
    const response = await api.put(`/milestones/${id}`, milestoneData);
    return response.data;
  },

  // Delete milestone
  async delete(id) {
    const response = await api.delete(`/milestones/${id}`);
    return response.data;
  },

  // Get milestone statistics
  async getStats() {
    const response = await api.get('/milestones/stats');
    return response.data;
  },

  // Get upcoming milestones
  async getUpcoming(days = 30) {
    const response = await api.get('/milestones/upcoming', { params: { days } });
    return response.data;
  },

  // Get overdue milestones
  async getOverdue() {
    const response = await api.get('/milestones/overdue');
    return response.data;
  },

  // Get milestones by project
  async getByProject(projectId, params = {}) {
    const response = await api.get(`/milestones/project/${projectId}`, { params });
    return response.data;
  },

  // Update milestone status
  async updateStatus(id, status) {
    const response = await api.patch(`/milestones/${id}/status`, { status });
    return response.data;
  },

  // Mark milestone as complete
  async markComplete(id) {
    const response = await api.patch(`/milestones/${id}/complete`);
    return response.data;
  },

  // Generate invoice from milestone
  async generateInvoice(id) {
    const response = await api.patch(`/milestones/${id}/generate-invoice`);
    return response.data;
  }
};

export default milestoneService;
