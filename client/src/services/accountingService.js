import api from './api';

export const accountingService = {
  // Get all accounts
  async getAccounts(params = {}) {
    const response = await api.get('/accounting/accounts', { params });
    return response.data;
  },

  // Get account by ID
  async getAccount(id) {
    const response = await api.get(`/accounting/accounts/${id}`);
    return response.data;
  },

  // Create account
  async createAccount(accountData) {
    const response = await api.post('/accounting/accounts', accountData);
    return response.data;
  },

  // Update account
  async updateAccount(id, accountData) {
    const response = await api.put(`/accounting/accounts/${id}`, accountData);
    return response.data;
  },

  // Get account types
  async getAccountTypes() {
    const response = await api.get('/accounting/accounts/types');
    return response.data;
  },

  // Get all journal entries
  async getJournalEntries(params = {}) {
    const response = await api.get('/accounting/journal-entries', { params });
    return response.data;
  },

  // Get journal entry by ID
  async getJournalEntry(id) {
    const response = await api.get(`/accounting/journal-entries/${id}`);
    return response.data;
  },

  // Create journal entry
  async createJournalEntry(entryData) {
    const response = await api.post('/accounting/journal-entries', entryData);
    return response.data;
  },

  // Post journal entry
  async postJournalEntry(id) {
    const response = await api.patch(`/accounting/journal-entries/${id}/post`);
    return response.data;
  },

  // Get trial balance
  async getTrialBalance() {
    const response = await api.get('/accounting/trial-balance');
    return response.data;
  }
};