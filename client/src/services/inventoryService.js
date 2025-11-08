import api from './api';

const inventoryService = {
  // Inventory operations
  getAllInventory: (params) => api.get('/inventory', { params }),
  getInventoryStats: () => api.get('/inventory/stats'),
  getLowStockItems: () => api.get('/inventory/low-stock'),
  getInventoryValuation: (warehouseId) => api.get('/inventory/valuation', { params: { warehouse_id: warehouseId } }),
  getInventoryByProduct: (productId) => api.get(`/inventory/product/${productId}`),
  getInventoryByWarehouse: (warehouseId, params) => api.get(`/inventory/warehouse/${warehouseId}`, { params }),
  getInventoryByProductAndWarehouse: (productId, warehouseId) => api.get(`/inventory/product/${productId}/warehouse/${warehouseId}`),
  updateQuantity: (data) => api.post('/inventory/update-quantity', data),
  reserveInventory: (data) => api.post('/inventory/reserve', data),
  releaseInventory: (data) => api.post('/inventory/release', data),
};

export default inventoryService;
