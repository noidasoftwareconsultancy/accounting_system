import api from './api';

const bankingService = {
  // Get all bank accounts
  async getBankAccounts(params = {}) {
    const response = await api.get('/banking/accounts', { params });
    return response.data;
  },

  // Get bank account by ID
  async getBankAccount(id) {
    const response = await api.get(`/banking/accounts/${id}`);
    return response.data;
  },

  // Create bank account
  async createBankAccount(accountData) {
    const response = await api.post('/banking/accounts', accountData);
    return response.data;
  },

  // Update bank account
  async updateBankAccount(id, accountData) {
    const response = await api.put(`/banking/accounts/${id}`, accountData);
    return response.data;
  },

  // Get bank transactions
  async getTransactions(params = {}) {
    const response = await api.get('/banking/transactions', { params });
    return response.data;
  },

  // Create bank transaction
  async createTransaction(transactionData) {
    const response = await api.post('/banking/transactions', transactionData);
    return response.data;
  },

  // Reconcile transaction
  async reconcileTransaction(transactionId) {
    const response = await api.patch(`/banking/transactions/${transactionId}/reconcile`);
    return response.data;
  },

  // Get payment gateways
  async getPaymentGateways() {
    const response = await api.get('/banking/gateways');
    return response.data;
  },

  // Create payment gateway
  async createPaymentGateway(gatewayData) {
    const response = await api.post('/banking/gateways', gatewayData);
    return response.data;
  },

  // Get banking statistics
  async getBankingStats() {
    const response = await api.get('/banking/accounts/stats');
    return response.data;
  }
};
export 
default bankingService;