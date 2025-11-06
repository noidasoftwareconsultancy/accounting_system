import api from './api';

const savedReportService = {
  // Get all saved reports
  async getAll(params = {}) {
    const response = await api.get('/saved-reports', { params });
    return response.data;
  },

  // Get saved report by ID
  async getById(id) {
    const response = await api.get(`/saved-reports/${id}`);
    return response.data;
  },

  // Create new saved report
  async create(reportData) {
    const response = await api.post('/saved-reports', reportData);
    return response.data;
  },

  // Update saved report
  async update(id, reportData) {
    const response = await api.put(`/saved-reports/${id}`, reportData);
    return response.data;
  },

  // Delete saved report
  async delete(id) {
    const response = await api.delete(`/saved-reports/${id}`);
    return response.data;
  },

  // Get reports by template
  async getByTemplate(templateId, params = {}) {
    const response = await api.get(`/saved-reports/template/${templateId}`, { params });
    return response.data;
  },

  // Get reports by user
  async getByUser(userId, params = {}) {
    const response = await api.get(`/saved-reports/user/${userId}`, { params });
    return response.data;
  },

  // Get my reports
  async getMyReports(params = {}) {
    const response = await api.get('/saved-reports/my-reports', { params });
    return response.data;
  },

  // Execute and save report
  async executeAndSave(templateId, parameters, name) {
    const response = await api.post('/saved-reports/execute-and-save', {
      templateId,
      parameters,
      name
    });
    return response.data;
  },

  // Regenerate report data
  async regenerate(id) {
    const response = await api.post(`/saved-reports/${id}/regenerate`);
    return response.data;
  },

  // Export report data
  async exportData(id, format = 'json') {
    const response = await api.get(`/saved-reports/${id}/export`, {
      params: { format },
      responseType: format === 'csv' ? 'blob' : 'json'
    });
    
    if (format === 'csv') {
      // Handle CSV download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${id}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return { success: true, message: 'Report exported successfully' };
    }
    
    return response.data;
  },

  // Get saved report statistics
  async getStats() {
    const response = await api.get('/saved-reports/stats');
    return response.data;
  }
};

export default savedReportService;