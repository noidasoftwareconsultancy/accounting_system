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

  // Delete bank account
  async deleteBankAccount(id) {
    const response = await api.delete(`/banking/accounts/${id}`);
    return response.data;
  },

  // Get account balance history
  async getAccountBalanceHistory(id, days = 30) {
    const response = await api.get(`/banking/accounts/${id}/balance-history`, { params: { days } });
    return response.data;
  },

  // Get cash flow summary
  async getCashFlowSummary(accountId, period = 'month') {
    const response = await api.get(`/banking/accounts/${accountId}/cash-flow`, { params: { period } });
    return response.data;
  },

  // Get unreconciled transactions
  async getUnreconciledTransactions(accountId) {
    const response = await api.get('/banking/transactions/unreconciled', { 
      params: accountId ? { account_id: accountId } : {} 
    });
    return response.data;
  },

  // Bulk reconcile transactions
  async bulkReconcileTransactions(transactionIds) {
    const response = await api.patch('/banking/transactions/bulk-reconcile', { transactionIds });
    return response.data;
  },

  // Transfer between accounts
  async transferBetweenAccounts(transferData) {
    const response = await api.post('/banking/transactions/transfer', transferData);
    return response.data;
  },

  // Get banking statistics
  async getBankingStats() {
    const response = await api.get('/banking/accounts/stats');
    return response.data;
  },

  // Additional methods to align with server capabilities
  async importBankStatement(accountId, file) {
    const formData = new FormData();
    formData.append('statement', file);
    
    const response = await api.post(`/banking/accounts/${accountId}/import-statement`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Reconciliation methods
  async getReconciliationSummary(accountId, month, year) {
    const response = await api.get(`/banking/accounts/${accountId}/reconciliation-summary`, {
      params: { month, year }
    });
    return response.data;
  },

  async startReconciliation(accountId, statementData) {
    const response = await api.post(`/banking/accounts/${accountId}/reconciliation/start`, statementData);
    return response.data;
  },

  async completeReconciliation(accountId, reconciliationId) {
    const response = await api.post(`/banking/accounts/${accountId}/reconciliation/${reconciliationId}/complete`);
    return response.data;
  },

  // Transaction categorization
  async categorizeTransaction(transactionId, categoryId) {
    const response = await api.patch(`/banking/transactions/${transactionId}/categorize`, { categoryId });
    return response.data;
  },

  async bulkCategorizeTransactions(transactionIds, categoryId) {
    const response = await api.patch('/banking/transactions/bulk-categorize', { transactionIds, categoryId });
    return response.data;
  },

  // Payment gateway methods
  async updatePaymentGateway(id, gatewayData) {
    const response = await api.put(`/banking/gateways/${id}`, gatewayData);
    return response.data;
  },

  async deletePaymentGateway(id) {
    const response = await api.delete(`/banking/gateways/${id}`);
    return response.data;
  },

  async testPaymentGateway(id) {
    const response = await api.post(`/banking/gateways/${id}/test`);
    return response.data;
  },

  // Advanced reporting
  async getCashFlowReport(accountId, startDate, endDate) {
    const response = await api.get(`/banking/accounts/${accountId}/cash-flow-report`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  async getBankingAnalytics(period = 'month') {
    const response = await api.get('/banking/analytics', { params: { period } });
    return response.data;
  }
};

export default bankingService;