import api from './api';

const expenseService = {
  // Get all expenses with pagination and filters
  async getAll(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null))
    });
    
    const response = await api.get(`/expenses?${params}`);
    return response.data;
  },

  // Legacy method for backward compatibility
  async getExpenses(params = {}) {
    const response = await api.get('/expenses', { params });
    return response.data;
  },

  // Get expense by ID with full details
  async getById(id) {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  // Legacy method for backward compatibility
  async getExpense(id) {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  // Create expense
  async create(expenseData) {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  // Legacy method for backward compatibility
  async createExpense(expenseData) {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  // Update expense
  async update(id, expenseData) {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  // Legacy method for backward compatibility
  async updateExpense(id, expenseData) {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  // Delete expense
  async delete(id) {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  // Legacy method for backward compatibility
  async deleteExpense(id) {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  // Get expense categories
  async getCategories() {
    const response = await api.get('/categories');
    return response.data;
  },

  // Create expense category
  async createCategory(categoryData) {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Update expense category
  async updateCategory(id, categoryData) {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete expense category
  async deleteCategory(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // Get vendors
  async getVendors() {
    const response = await api.get('/vendors');
    return response.data;
  },

  // Create vendor
  async createVendor(vendorData) {
    const response = await api.post('/vendors', vendorData);
    return response.data;
  },

  // Update vendor
  async updateVendor(id, vendorData) {
    const response = await api.put(`/vendors/${id}`, vendorData);
    return response.data;
  },

  // Delete vendor
  async deleteVendor(id) {
    const response = await api.delete(`/vendors/${id}`);
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
  async getStats() {
    const response = await api.get('/expenses/stats');
    return response.data;
  },

  // Legacy method for backward compatibility
  async getExpenseStats() {
    const response = await api.get('/expenses/stats');
    return response.data;
  },

  // Get expenses by category
  async getByCategory(categoryId, params = {}) {
    const response = await api.get(`/expenses/category/${categoryId}`, { params });
    return response.data;
  },

  // Get expenses by vendor
  async getByVendor(vendorId, params = {}) {
    const response = await api.get(`/expenses/vendor/${vendorId}`, { params });
    return response.data;
  },

  // Get expenses by project
  async getByProject(projectId, params = {}) {
    const response = await api.get(`/expenses/project/${projectId}`, { params });
    return response.data;
  },

  // Approve expense
  async approve(id) {
    const response = await api.patch(`/expenses/${id}/approve`);
    return response.data;
  },

  // Reject expense
  async reject(id, reason = '') {
    const response = await api.patch(`/expenses/${id}/reject`, { reason });
    return response.data;
  },

  // Mark expense as paid
  async markAsPaid(id) {
    const response = await api.patch(`/expenses/${id}/mark-paid`);
    return response.data;
  },

  // Upload receipt
  async uploadReceipt(id, file) {
    const formData = new FormData();
    formData.append('receipt', file);
    
    const response = await api.post(`/expenses/${id}/receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Get recurring expenses
  async getRecurringExpenses() {
    const response = await api.get('/expenses/recurring');
    return response.data;
  },

  // Create recurring expense
  async createRecurringExpense(recurringData) {
    const response = await api.post('/expenses/recurring', recurringData);
    return response.data;
  },

  // Get expense analytics
  async getAnalytics(period = 'month') {
    const response = await api.get(`/expenses/analytics?period=${period}`);
    return response.data;
  }
};

export default expenseService;