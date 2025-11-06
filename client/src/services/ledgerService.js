import api from './api';

const ledgerService = {
  // Get all ledger entries
  async getAllEntries(params = {}) {
    const response = await api.get('/ledger-entries', { params });
    return response.data;
  },

  // Get ledger entry by ID
  async getEntryById(id) {
    const response = await api.get(`/ledger-entries/${id}`);
    return response.data;
  },

  // Get account balance
  async getAccountBalance(accountId, asOfDate = null) {
    const params = asOfDate ? { asOfDate } : {};
    const response = await api.get(`/ledger-entries/account/${accountId}/balance`, { params });
    return response.data;
  },

  // Get trial balance
  async getTrialBalance(asOfDate = null) {
    const params = asOfDate ? { asOfDate } : {};
    const response = await api.get('/ledger-entries/trial-balance', { params });
    return response.data;
  },

  // Get ledger entries by account
  async getEntriesByAccount(accountId, params = {}) {
    const response = await api.get(`/ledger-entries/account/${accountId}/entries`, { params });
    return response.data;
  },

  // Get account statement
  async getAccountStatement(accountId, startDate, endDate) {
    const response = await api.get(`/ledger-entries/account/${accountId}/statement`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get all account types
  async getAccountTypes() {
    const response = await api.get('/account-types');
    return response.data;
  },

  // Create account type
  async createAccountType(data) {
    const response = await api.post('/account-types', data);
    return response.data;
  },

  // Update account type
  async updateAccountType(id, data) {
    const response = await api.put(`/account-types/${id}`, data);
    return response.data;
  },

  // Delete account type
  async deleteAccountType(id) {
    const response = await api.delete(`/account-types/${id}`);
    return response.data;
  },

  // Get account type statistics
  async getAccountTypeStats() {
    const response = await api.get('/account-types/stats');
    return response.data;
  }
};

export default ledgerService;