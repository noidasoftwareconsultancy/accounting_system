import api from './api';

const inventoryService = {
  getInventory: (params) => api.get('/inventory', { params }),
  getInventoryByWarehouse: (warehouseId, params) => api.get(`/inventory/warehouse/${warehouseId}`, { params }),
  getInventoryByProduct: (productId, params) => api.get(`/inventory/product/${productId}`, { params }),
  getLowStockItems: (params) => api.get('/inventory/low-stock', { params }),
  getStockHistory: (params) => api.get('/inventory/history', { params }),
  getStockMovements: (params) => api.get('/inventory/movements', { params }),
};

export default inventoryService;
