import api from './api';

const stockAdjustmentService = {
  getAllAdjustments: (params) => api.get('/stock-adjustments', { params }),
  getAdjustmentById: (id) => api.get(`/stock-adjustments/${id}`),
  createAdjustment: (data) => api.post('/stock-adjustments', data),
  updateAdjustment: (id, data) => api.put(`/stock-adjustments/${id}`, data),
  deleteAdjustment: (id) => api.delete(`/stock-adjustments/${id}`),
};

export default stockAdjustmentService;
