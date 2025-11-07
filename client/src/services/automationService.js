import api from './api';

const automationService = {
  // Automation Rules
  async getAllRules(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null))
    });
    
    const response = await api.get(`/automation/rules?${params}`);
    return response.data;
  },

  async getActiveRules() {
    const response = await api.get('/automation/rules/active');
    return response.data;
  },

  async getRuleById(id) {
    const response = await api.get(`/automation/rules/${id}`);
    return response.data;
  },

  async createRule(ruleData) {
    const response = await api.post('/automation/rules', ruleData);
    return response.data;
  },

  async updateRule(id, ruleData) {
    const response = await api.put(`/automation/rules/${id}`, ruleData);
    return response.data;
  },

  async toggleRule(id) {
    const response = await api.patch(`/automation/rules/${id}/toggle`);
    return response.data;
  },

  async deleteRule(id) {
    const response = await api.delete(`/automation/rules/${id}`);
    return response.data;
  },

  async getRulesStats() {
    const response = await api.get('/automation/rules/stats');
    return response.data;
  },

  // Scheduled Tasks
  async getAllTasks(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null))
    });
    
    const response = await api.get(`/automation/tasks?${params}`);
    return response.data;
  },

  async getUpcomingTasks(days = 7) {
    const response = await api.get('/automation/tasks/upcoming', { params: { days } });
    return response.data;
  },

  async getTaskById(id) {
    const response = await api.get(`/automation/tasks/${id}`);
    return response.data;
  },

  async createTask(taskData) {
    const response = await api.post('/automation/tasks', taskData);
    return response.data;
  },

  async updateTask(id, taskData) {
    const response = await api.put(`/automation/tasks/${id}`, taskData);
    return response.data;
  },

  async toggleTask(id) {
    const response = await api.patch(`/automation/tasks/${id}/toggle`);
    return response.data;
  },

  async runTask(id) {
    const response = await api.post(`/automation/tasks/${id}/run`);
    return response.data;
  },

  async deleteTask(id) {
    const response = await api.delete(`/automation/tasks/${id}`);
    return response.data;
  },

  async getTasksStats() {
    const response = await api.get('/automation/tasks/stats');
    return response.data;
  },

  // Utility Methods
  async getAvailableEvents() {
    const response = await api.get('/automation/events/available');
    return response.data;
  },

  async getAvailableActions() {
    const response = await api.get('/automation/actions/available');
    return response.data;
  },

  async testRule(ruleData) {
    const response = await api.post('/automation/rules/test', ruleData);
    return response.data;
  }
};

export default automationService;
