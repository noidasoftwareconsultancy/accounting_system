import api from './api';

const scheduledTaskService = {
  // Get all scheduled tasks
  async getAll(params = {}) {
    const response = await api.get('/automation/tasks', { params });
    return response.data;
  },

  // Get scheduled task by ID
  async getById(id) {
    const response = await api.get(`/automation/tasks/${id}`);
    return response.data;
  },

  // Create new scheduled task
  async create(taskData) {
    const response = await api.post('/automation/tasks', taskData);
    return response.data;
  },

  // Update scheduled task
  async update(id, taskData) {
    const response = await api.put(`/automation/tasks/${id}`, taskData);
    return response.data;
  },

  // Delete scheduled task
  async delete(id) {
    const response = await api.delete(`/automation/tasks/${id}`);
    return response.data;
  },

  // Get upcoming tasks
  async getTasksDue(days = 7) {
    const response = await api.get('/automation/tasks/upcoming', { params: { days } });
    return response.data;
  },

  // Execute task manually
  async executeTask(id) {
    const response = await api.post(`/automation/tasks/${id}/run`);
    return response.data;
  },

  // Toggle task active status
  async toggleActive(id) {
    const response = await api.patch(`/automation/tasks/${id}/toggle`);
    return response.data;
  },

  // Get task execution history (Note: This endpoint may not exist on server, keeping for backward compatibility)
  async getExecutionHistory(id, limit = 10) {
    const response = await api.get(`/automation/tasks/${id}/execution-history`, {
      params: { limit }
    });
    return response.data;
  },

  // Get available task types (Note: This endpoint may not exist on server, keeping for backward compatibility)
  async getTaskTypes() {
    const response = await api.get('/automation/tasks/task-types');
    return response.data;
  },

  // Get scheduled task statistics
  async getStats() {
    const response = await api.get('/automation/tasks/stats');
    return response.data;
  }
};

export default scheduledTaskService;