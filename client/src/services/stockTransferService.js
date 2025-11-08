import api from './api';

const stockTransferService = {
  getAllTransfers: (params) => api.get('/stock-transfers', { params }),
  getTransferById: (id) => api.get(`/stock-transfers/${id}`),
  generateTransferNumber: () => api.get('/stock-transfers/generate-transfer-number'),
  createTransfer: (data) => api.post('/stock-transfers', data),
  updateTransfer: (id, data) => api.put(`/stock-transfers/${id}`, data),
  deleteTransfer: (id) => api.delete(`/stock-transfers/${id}`),
  processTransfer: (id) => api.post(`/stock-transfers/${id}/process`),
  completeTransfer: (id, data) => api.post(`/stock-transfers/${id}/complete`, data),
  cancelTransfer: (id) => api.post(`/stock-transfers/${id}/cancel`),
};

export default stockTransferService;
