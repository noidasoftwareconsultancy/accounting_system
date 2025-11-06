import api from './api';

const scheduledTaskService = {
  // Get all scheduled tasks
  async getAll(params = {}) {
    const response = await api.get('/scheduled-tasks', { params });
    return response.data;
  },

  // Get scheduled task by ID
  async getById(id) {
    const response = await api.get(`/scheduled-tasks/${id}`);
    return response.data;
  },

  // Create new scheduled task
  async create(taskData) {
    const response = await api.post('/scheduled-tasks', taskData);
    return response.data;
  },

  // Update scheduled task
  async update(id, taskData) {
    const response = await api.put(`/scheduled-tasks/${id}`, taskData);
    return response.data;
  },

  // Delete scheduled task
  async delete(id) {
    const response = await api.delete(`/scheduled-tasks/${id}`);
    return response.data;
  },

  // Get tasks due for execution
  async getTasksDue() {
    const response = await api.get('/scheduled-tasks/due');
    return response.data;
  },

  // Execute task manually
  async executeTask(id) {
    const response = await api.post(`/scheduled-tasks/${id}/execute`);
    return response.data;
  },

  // Toggle task active status
  async toggleActive(id) {
    const response = await api.patch(`/scheduled-tasks/${id}/toggle-active`);
    return response.data;
  },

  // Get task execution history
  async getExecutionHistory(id, limit = 10) {
    const response = await api.get(`/scheduled-tasks/${id}/execution-history`, {
      params: { limit }
    });
    return response.data;
  },

  // Get available task types
  async getTaskTypes() {
    const response = await api.get('/scheduled-tasks/task-types');
    return response.data;
  },

  // Get scheduled task statistics
  async getStats() {
    const response = await api.get('/scheduled-tasks/stats');
    return response.data;
  }
};

export default scheduledTaskService;