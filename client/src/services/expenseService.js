import api from './api';

export const expenseService = {
  // Get all expenses
  async getExpenses(params = {}) {
    const response = await api.get('/expenses', { params });
    return response.data;
  },

  // Get expense by ID
  async getExpense(id) {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  // Create expense
  async createExpense(expenseData) {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  // Update expense
  async updateExpense(id, expenseData) {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  // Delete expense
  async deleteExpense(id) {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  // Get expense categories
  async getCategories() {
    const response = await api.get('/expenses/categories');
    return response.data;
  },

  // Create expense category
  async createCategory(categoryData) {
    const response = await api.post('/expenses/categories', categoryData);
    return response.data;
  },

  // Update expense category
  async updateCategory(id, categoryData) {
    const response = await api.put(`/expenses/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete expense category
  async deleteCategory(id) {
    const response = await api.delete(`/expenses/categories/${id}`);
    return response.data;
  },

  // Get vendors
  async getVendors() {
    const response = await api.get('/expenses/vendors');
    return response.data;
  },

  // Create vendor
  async createVendor(vendorData) {
    const response = await api.post('/expenses/vendors', vendorData);
    return response.data;
  },

  // Update vendor
  async updateVendor(id, vendorData) {
    const response = await api.put(`/expenses/vendors/${id}`, vendorData);
    return response.data;
  },

  // Delete vendor
  async deleteVendor(id) {
    const response = await api.delete(`/expenses/vendors/${id}`);
    return response.data;
  },

  // Get expense summary by category
  async getSummaryByCategory(startDate, endDate) {
    const response = await api.get('/expenses/summary/by-category', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  // Get expense summary by month
  async getSummaryByMonth(year) {
    const response = await api.get('/expenses/summary/by-month', {
      params: { year }
    });
    return response.data;
  },

  // Get expense statistics
  async getExpenseStats() {
    const response = await api.get('/expenses/stats');
    return response.data;
  }
};