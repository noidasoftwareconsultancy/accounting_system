import api from './api';

export const projectService = {
  // Get all projects
  async getProjects(params = {}) {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  // Get project by ID
  async getProject(id) {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Create project
  async createProject(projectData) {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Update project
  async updateProject(id, projectData) {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  // Delete project
  async deleteProject(id) {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  // Get project financial summary
  async getProjectFinancialSummary(id) {
    const response = await api.get(`/projects/${id}/financial-summary`);
    return response.data;
  },

  // Get project statistics
  async getProjectStats() {
    const response = await api.get('/projects/stats');
    return response.data;
  }
};