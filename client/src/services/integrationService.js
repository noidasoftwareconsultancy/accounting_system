import api from './api';

const integrationService = {
  // Invoice-Inventory Integration
  reserveStock: (invoiceId, items) => api.post(`/invoices/${invoiceId}/reserve-stock`, { items }),
  releaseStock: (invoiceId) => api.post(`/invoices/${invoiceId}/release-stock`),
  deductStock: (invoiceId) => api.post(`/invoices/${invoiceId}/deduct-stock`),
  getStockAvailability: (items) => api.post('/inventory/check-availability', { items }),
  
  // Automatic Reorder
  checkReorderPoints: () => api.get('/inventory/check-reorder-points'),
  generateReorderPOs: () => api.post('/purchase-orders/auto-generate'),
  getReorderSuggestions: () => api.get('/inventory/reorder-suggestions'),
  updateReorderSettings: (productId, settings) => api.put(`/products/${productId}/reorder-settings`, settings),

  // Vendor Integration
  sendPOToVendor: (poId) => api.post(`/purchase-orders/${poId}/send-to-vendor`),
  getVendorAcknowledgment: (poId) => api.get(`/purchase-orders/${poId}/vendor-acknowledgment`),
  trackShipment: (poId) => api.get(`/purchase-orders/${poId}/shipment-tracking`),
  getVendorPerformance: (vendorId) => api.get(`/vendors/${vendorId}/performance`),

  // Multi-currency
  getExchangeRates: () => api.get('/exchange-rates'),
  updateExchangeRate: (currency, rate) => api.put('/exchange-rates', { currency, rate }),
  convertCurrency: (amount, from, to) => api.post('/exchange-rates/convert', { amount, from, to }),

  // Cost Tracking
  calculateCOGS: (invoiceId) => api.get(`/invoices/${invoiceId}/cogs`),
  getInventoryValuation: (method = 'FIFO') => api.get('/inventory/valuation', { params: { method } }),
  getProfitMargin: (productId) => api.get(`/products/${productId}/profit-margin`),

  // Backorder Management
  createBackorder: (data) => api.post('/backorders', data),
  getBackorders: (params) => api.get('/backorders', { params }),
  fulfillBackorder: (backorderId) => api.post(`/backorders/${backorderId}/fulfill`),
  cancelBackorder: (backorderId) => api.post(`/backorders/${backorderId}/cancel`),
};

export default integrationService;
