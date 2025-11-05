import api from './api';

export const dashboardService = {
  // Get dashboard data
  async getDashboardData() {
    const response = await api.get('/dashboard');
    return response.data;
  },

  // Get financial overview
  async getFinancialOverview(period = 'month') {
    const response = await api.get(`/dashboard/financial-overview?period=${period}`);
    return response.data;
  },

  // Get notifications
  async getNotifications(limit = 10) {
    const response = await api.get(`/dashboard/notifications?limit=${limit}`);
    return response.data;
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    const response = await api.patch(`/dashboard/notifications/${notificationId}/read`);
    return response.data;
  },

  // Delete notification
  async deleteNotification(notificationId) {
    const response = await api.delete(`/dashboard/notifications/${notificationId}`);
    return response.data;
  }
};