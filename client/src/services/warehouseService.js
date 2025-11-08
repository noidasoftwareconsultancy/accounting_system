import api from './api';

const warehouseService = {
  getAllWarehouses: (params) => api.get('/warehouses', { params }),
  getWarehouseById: (id) => api.get(`/warehouses/${id}`),
  getInventorySummary: (id) => api.get(`/warehouses/${id}/inventory-summary`),
  createWarehouse: (data) => api.post('/warehouses', data),
  updateWarehouse: (id, data) => api.put(`/warehouses/${id}`, data),
  deleteWarehouse: (id) => api.delete(`/warehouses/${id}`),
};

export default warehouseService;
