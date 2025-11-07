import api from './api';

const notificationService = {
  // Get all notifications
  async getAll(page = 1, limit = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    const response = await api.get(`/notifications?${params}`);
    return response.data;
  },

  // Get my notifications
  async getMyNotifications(page = 1, limit = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    const response = await api.get(`/notifications/my?${params}`);
    return response.data;
  },

  // Get unread notifications
  async getUnreadNotifications() {
    const response = await api.get('/notifications/unread');
    return response.data;
  },

  // Get notification by ID
  async getById(id) {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },

  // Create notification
  async create(notificationData) {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  },

  // Create bulk notifications
  async createBulk(bulkData) {
    const response = await api.post('/notifications/bulk', bulkData);
    return response.data;
  },

  // Mark notification as read
  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  async markAllAsRead() {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  },

  // Delete notification
  async delete(id) {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  // Delete bulk notifications
  async deleteBulk(notificationIds) {
    const response = await api.delete('/notifications/bulk', {
      data: { notificationIds }
    });
    return response.data;
  },

  // Get notification statistics
  async getStats() {
    const response = await api.get('/notifications/stats');
    return response.data;
  },

  // System notifications (admin only)
  async broadcastToAll(notificationData) {
    const response = await api.post('/notifications/system/broadcast', notificationData);
    return response.data;
  },

  async broadcastToDepartment(department, notificationData) {
    const response = await api.post(`/notifications/system/department/${department}`, notificationData);
    return response.data;
  }
};

export default notificationService;
