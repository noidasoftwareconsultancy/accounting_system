import api from './api';

const stockAdjustmentService = {
  getAllAdjustments: (params) => api.get('/stock-adjustments', { params }),
  getAdjustmentById: (id) => api.get(`/stock-adjustments/${id}`),
  generateAdjustmentNumber: () => api.get('/stock-adjustments/generate-adjustment-number'),
  createAdjustment: (data) => api.post('/stock-adjustments', data),
  approveAdjustment: (id, data) => api.post(`/stock-adjustments/${id}/approve`, data),
  cancelAdjustment: (id) => api.post(`/stock-adjustments/${id}/cancel`),
};

export default stockAdjustmentService;
