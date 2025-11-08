import api from './api';

const bulkOperationsService = {
  // Bulk product operations
  bulkUpdateProducts: (ids, data) => api.post('/products/bulk-update', { ids, data }),
  bulkDeleteProducts: (ids) => api.post('/products/bulk-delete', { ids }),
  bulkActivateProducts: (ids) => api.post('/products/bulk-activate', { ids }),
  bulkDeactivateProducts: (ids) => api.post('/products/bulk-deactivate', { ids }),
  bulkUpdateCategory: (ids, categoryId) => api.post('/products/bulk-category', { ids, category_id: categoryId }),
  bulkUpdatePrices: (ids, adjustment) => api.post('/products/bulk-prices', { ids, adjustment }),

  // Bulk warehouse operations
  bulkUpdateWarehouses: (ids, data) => api.post('/warehouses/bulk-update', { ids, data }),
  bulkDeleteWarehouses: (ids) => api.post('/warehouses/bulk-delete', { ids }),
  bulkActivateWarehouses: (ids) => api.post('/warehouses/bulk-activate', { ids }),
  bulkDeactivateWarehouses: (ids) => api.post('/warehouses/bulk-deactivate', { ids }),

  // Bulk stock operations
  bulkStockAdjustment: (adjustments) => api.post('/stock-adjustments/bulk', { adjustments }),
  bulkStockTransfer: (transfers) => api.post('/stock-transfers/bulk', { transfers }),

  // Bulk purchase order operations
  bulkDeletePurchaseOrders: (ids) => api.post('/purchase-orders/bulk-delete', { ids }),
  bulkCancelPurchaseOrders: (ids) => api.post('/purchase-orders/bulk-cancel', { ids }),

  // Import/Export
  importProducts: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  exportProducts: (params) => api.get('/products/export', { params, responseType: 'blob' }),
  exportInventory: (params) => api.get('/inventory/export', { params, responseType: 'blob' }),
  exportPurchaseOrders: (params) => api.get('/purchase-orders/export', { params, responseType: 'blob' }),
};

export default bulkOperationsService;
