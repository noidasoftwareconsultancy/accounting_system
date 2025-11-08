import api from './api';

const purchaseOrderService = {
  getAllPurchaseOrders: (params) => api.get('/purchase-orders', { params }),
  getPurchaseOrderById: (id) => api.get(`/purchase-orders/${id}`),
  getPurchaseOrdersByVendor: (vendorId, params) => api.get(`/purchase-orders/vendor/${vendorId}`, { params }),
  getStats: () => api.get('/purchase-orders/stats'),
  generatePONumber: () => api.get('/purchase-orders/generate-po-number'),
  createPurchaseOrder: (data) => api.post('/purchase-orders', data),
  updatePurchaseOrder: (id, data) => api.put(`/purchase-orders/${id}`, data),
  deletePurchaseOrder: (id) => api.delete(`/purchase-orders/${id}`),
  receivePurchaseOrder: (id, data) => api.post(`/purchase-orders/${id}/receive`, data),
};

export default purchaseOrderService;
