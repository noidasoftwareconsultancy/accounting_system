import api from './api';

const categoryService = {
  // Get all categories
  async getAll() {
    const response = await api.get('/categories');
    return response.data;
  },

  // Get category by ID
  async getById(id) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Create category
  async create(categoryData) {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Update category
  async update(id, categoryData) {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category
  async delete(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // Get category statistics
  async getStats() {
    const response = await api.get('/categories/stats');
    return response.data;
  },

  // Get category expense summary
  async getExpenseSummary(id, startDate, endDate) {
    const response = await api.get(`/categories/${id}/expenses`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  // Get categories with trends
  async getCategoriesWithTrends(period = 'month') {
    const response = await api.get('/categories/trends', {
      params: { period }
    });
    return response.data;
  },

  // Search categories
  async search(query) {
    const response = await api.get('/categories/search', {
      params: { q: query }
    });
    return response.data;
  }
};

export default categoryService;