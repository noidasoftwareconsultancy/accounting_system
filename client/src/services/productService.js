import api from './api';

const productService = {
  // Product operations
  getAllProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getProductBySKU: (sku) => api.get(`/products/sku/${sku}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),

  // Category operations
  getAllCategories: () => api.get('/products/categories/all'),
  createCategory: (data) => api.post('/products/categories', data),
  updateCategory: (id, data) => api.put(`/products/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/products/categories/${id}`),

  // Supplier operations
  getProductSuppliers: (productId) => api.get(`/products/${productId}/suppliers`),
  addSupplier: (data) => api.post('/products/suppliers', data),
  updateSupplier: (productId, vendorId, data) => api.put(`/products/${productId}/suppliers/${vendorId}`, data),
  removeSupplier: (productId, vendorId) => api.delete(`/products/${productId}/suppliers/${vendorId}`),

  // Serial number operations
  getSerialNumbers: (productId, status) => api.get(`/products/${productId}/serial-numbers`, { params: { status } }),
  addSerialNumber: (data) => api.post('/products/serial-numbers', data),
  updateSerialNumber: (serialId, data) => api.put(`/products/serial-numbers/${serialId}`, data),

  // Batch number operations
  getBatchNumbers: (productId) => api.get(`/products/${productId}/batch-numbers`),
  addBatchNumber: (data) => api.post('/products/batch-numbers', data),
  updateBatchNumber: (productId, batchNo, data) => api.put(`/products/${productId}/batch-numbers/${batchNo}`, data),
};

export default productService;
