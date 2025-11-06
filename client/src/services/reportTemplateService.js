import api from './api';

const reportTemplateService = {
  // Get all report templates
  async getAll(params = {}) {
    const response = await api.get('/report-templates', { params });
    return response.data;
  },

  // Get report template by ID
  async getById(id) {
    const response = await api.get(`/report-templates/${id}`);
    return response.data;
  },

  // Create new report template
  async create(templateData) {
    const response = await api.post('/report-templates', templateData);
    return response.data;
  },

  // Update report template
  async update(id, templateData) {
    const response = await api.put(`/report-templates/${id}`, templateData);
    return response.data;
  },

  // Delete report template
  async delete(id) {
    const response = await api.delete(`/report-templates/${id}`);
    return response.data;
  },

  // Get templates by type
  async getByType(reportType) {
    const response = await api.get(`/report-templates/type/${reportType}`);
    return response.data;
  },

  // Execute report template
  async executeTemplate(id, parameters = {}) {
    const response = await api.post(`/report-templates/${id}/execute`, { parameters });
    return response.data;
  },

  // Get predefined templates
  async getPredefinedTemplates() {
    const response = await api.get('/report-templates/predefined');
    return response.data;
  },

  // Install predefined template
  async installPredefinedTemplate(templateIndex) {
    const response = await api.post(`/report-templates/predefined/${templateIndex}/install`);
    return response.data;
  },

  // Get template statistics
  async getStats() {
    const response = await api.get('/report-templates/stats');
    return response.data;
  }
};

export default reportTemplateService;