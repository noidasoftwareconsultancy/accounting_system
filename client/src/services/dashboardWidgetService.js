import api from './api';

const dashboardWidgetService = {
  // Dashboard operations
  async getAllDashboards(params = {}) {
    const response = await api.get('/dashboard-widgets/dashboards', { params });
    return response.data;
  },

  async getMyDashboards() {
    const response = await api.get('/dashboard-widgets/dashboards/my');
    return response.data;
  },

  async getDefaultDashboard() {
    const response = await api.get('/dashboard-widgets/dashboards/default');
    return response.data;
  },

  async getDashboardById(id) {
    const response = await api.get(`/dashboard-widgets/dashboards/${id}`);
    return response.data;
  },

  async createDashboard(dashboardData) {
    const response = await api.post('/dashboard-widgets/dashboards', dashboardData);
    return response.data;
  },

  async updateDashboard(id, dashboardData) {
    const response = await api.put(`/dashboard-widgets/dashboards/${id}`, dashboardData);
    return response.data;
  },

  async setDefaultDashboard(id) {
    const response = await api.patch(`/dashboard-widgets/dashboards/${id}/set-default`);
    return response.data;
  },

  async deleteDashboard(id) {
    const response = await api.delete(`/dashboard-widgets/dashboards/${id}`);
    return response.data;
  },

  async duplicateDashboard(id) {
    const response = await api.post(`/dashboard-widgets/dashboards/${id}/duplicate`);
    return response.data;
  },

  // Widget operations
  async getAllWidgets(params = {}) {
    const response = await api.get('/dashboard-widgets/widgets', { params });
    return response.data;
  },

  async getWidgetsByDashboard(dashboardId) {
    const response = await api.get(`/dashboard-widgets/widgets/dashboard/${dashboardId}`);
    return response.data;
  },

  async getWidgetById(id) {
    const response = await api.get(`/dashboard-widgets/widgets/${id}`);
    return response.data;
  },

  async getWidgetData(id, params = {}) {
    const response = await api.get(`/dashboard-widgets/widgets/${id}/data`, { params });
    return response.data;
  },

  async createWidget(widgetData) {
    const response = await api.post('/dashboard-widgets/widgets', widgetData);
    return response.data;
  },

  async updateWidget(id, widgetData) {
    const response = await api.put(`/dashboard-widgets/widgets/${id}`, widgetData);
    return response.data;
  },

  async updateWidgetPosition(id, position) {
    const response = await api.patch(`/dashboard-widgets/widgets/${id}/position`, { position });
    return response.data;
  },

  async deleteWidget(id) {
    const response = await api.delete(`/dashboard-widgets/widgets/${id}`);
    return response.data;
  },

  async bulkUpdateWidgetPositions(widgets) {
    const response = await api.post('/dashboard-widgets/widgets/bulk-update-positions', { widgets });
    return response.data;
  },

  // Metadata
  async getAvailableWidgetTypes() {
    const response = await api.get('/dashboard-widgets/widget-types');
    return response.data;
  },

  async getAvailableDataSources() {
    const response = await api.get('/dashboard-widgets/data-sources');
    return response.data;
  }
};

export default dashboardWidgetService;
