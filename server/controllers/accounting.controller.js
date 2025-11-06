const accountingModel = require('../models/accounting.model');
const { validationResult } = require('express-validator');

const accountingController = {
  /**
   * Get all accounts
   */
  async getAllAccounts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const filters = {
        type_id: req.query.type_id,
        is_active: req.query.is_active,
        search: req.query.search
      };

      const result = await accountingModel.getAllAccounts(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get accounts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching accounts'
      });
    }
  },

  /**
   * Get chart of accounts
   */
  async getChartOfAccounts(req, res) {
    try {
      const chartOfAccounts = await accountingModel.getChartOfAccounts();
      
      res.json({
        success: true,
        data: chartOfAccounts
      });
    } catch (error) {
      console.error('Get chart of accounts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching chart of accounts'
      });
    }
  },

  /**
   * Get account by ID
   */
  async getAccountById(req, res) {
    try {
      const { id } = req.params;
      const account = await accountingModel.getAccountById(id);

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      res.json({
        success: true,
        data: account
      });
    } catch (error) {
      console.error('Get account error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching account'
      });
    }
  },

  /**
   * Create account
   */
  async createAccount(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const accountData = {
        ...req.body,
        created_by: req.user.id
      };

      const account = await accountingModel.createAccount(accountData);

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: account
      });
    } catch (error) {
      console.error('Create account error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating account'
      });
    }
  },

  /**
   * Update account
   */
  async updateAccount(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const account = await accountingModel.updateAccount(id, req.body);

      res.json({
        success: true,
        message: 'Account updated successfully',
        data: account
      });
    } catch (error) {
      console.error('Update account error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating account'
      });
    }
  },

  /**
   * Get all journal entries
   */
  async getAllJournalEntries(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await accountingModel.getAllJournalEntries(page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get journal entries error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching journal entries'
      });
    }
  },

  /**
   * Create journal entry
   */
  async createJournalEntry(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const entryData = {
        ...req.body,
        created_by: req.user.id
      };

      const journalEntry = await accountingModel.createJournalEntry(entryData);

      res.status(201).json({
        success: true,
        message: 'Journal entry created successfully',
        data: journalEntry
      });
    } catch (error) {
      console.error('Create journal entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating journal entry'
      });
    }
  },

  /**
   * Get journal entry by ID
   */
  async getJournalEntryById(req, res) {
    try {
      const { id } = req.params;
      const journalEntry = await accountingModel.getJournalEntryById(id);

      if (!journalEntry) {
        return res.status(404).json({
          success: false,
          message: 'Journal entry not found'
        });
      }

      res.json({
        success: true,
        data: journalEntry
      });
    } catch (error) {
      console.error('Get journal entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching journal entry'
      });
    }
  },

  /**
   * Update journal entry
   */
  async updateJournalEntry(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const journalEntry = await accountingModel.updateJournalEntry(id, req.body);

      res.json({
        success: true,
        message: 'Journal entry updated successfully',
        data: journalEntry
      });
    } catch (error) {
      console.error('Update journal entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating journal entry'
      });
    }
  },

  /**
   * Post journal entry
   */
  async postJournalEntry(req, res) {
    try {
      const { id } = req.params;
      const journalEntry = await accountingModel.postJournalEntry(id);

      res.json({
        success: true,
        message: 'Journal entry posted successfully',
        data: journalEntry
      });
    } catch (error) {
      console.error('Post journal entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Error posting journal entry'
      });
    }
  },

  /**
   * Get trial balance
   */
  async getTrialBalance(req, res) {
    try {
      const trialBalance = await accountingModel.getTrialBalance();
      
      res.json({
        success: true,
        data: trialBalance
      });
    } catch (error) {
      console.error('Get trial balance error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching trial balance'
      });
    }
  },

  /**
   * Get account types
   */
  async getAccountTypes(req, res) {
    try {
      const accountTypes = await accountingModel.getAccountTypes();
      
      res.json({
        success: true,
        data: accountTypes
      });
    } catch (error) {
      console.error('Get account types error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching account types'
      });
    }
  },

  /**
   * Delete account
   */
  async deleteAccount(req, res) {
    try {
      const { id } = req.params;
      await accountingModel.deleteAccount(id);

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error deleting account'
      });
    }
  },

  /**
   * Get accounts by type
   */
  async getAccountsByType(req, res) {
    try {
      const { typeId } = req.params;
      const accounts = await accountingModel.getAccountsByType(typeId);
      
      res.json({
        success: true,
        data: accounts
      });
    } catch (error) {
      console.error('Get accounts by type error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching accounts by type'
      });
    }
  },

  /**
   * Search accounts
   */
  async searchAccounts(req, res) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const accounts = await accountingModel.searchAccounts(q);
      
      res.json({
        success: true,
        data: accounts
      });
    } catch (error) {
      console.error('Search accounts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching accounts'
      });
    }
  },

  /**
   * Get account balance
   */
  async getAccountBalance(req, res) {
    try {
      const { id } = req.params;
      const balance = await accountingModel.getAccountBalance(id);
      
      res.json({
        success: true,
        data: balance
      });
    } catch (error) {
      console.error('Get account balance error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching account balance'
      });
    }
  },

  /**
   * Create journal entry for invoice (integration endpoint)
   */
  async createInvoiceJournalEntry(req, res) {
    try {
      const { invoiceId } = req.params;
      
      // Get invoice details (this would typically come from invoice service)
      const invoice = await prisma.invoice.findUnique({
        where: { id: parseInt(invoiceId) },
        include: { client: true }
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      const journalEntry = await accountingModel.createInvoiceJournalEntry(invoice, req.user.id);

      res.json({
        success: true,
        message: 'Journal entry created for invoice',
        data: journalEntry
      });
    } catch (error) {
      console.error('Create invoice journal entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating journal entry for invoice'
      });
    }
  },

  /**
   * Create journal entry for expense (integration endpoint)
   */
  async createExpenseJournalEntry(req, res) {
    try {
      const { expenseId } = req.params;
      
      // Get expense details (this would typically come from expense service)
      const expense = await prisma.expense.findUnique({
        where: { id: parseInt(expenseId) },
        include: { category: true, vendor: true }
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      const journalEntry = await accountingModel.createExpenseJournalEntry(expense, req.user.id);

      res.json({
        success: true,
        message: 'Journal entry created for expense',
        data: journalEntry
      });
    } catch (error) {
      console.error('Create expense journal entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating journal entry for expense'
      });
    }
  },

  /**
   * Create journal entry for payroll (integration endpoint)
   */
  async createPayrollJournalEntry(req, res) {
    try {
      const { payslipId } = req.params;
      
      // Get payslip details (this would typically come from payroll service)
      const payslip = await prisma.payslip.findUnique({
        where: { id: parseInt(payslipId) },
        include: { employee: true }
      });

      if (!payslip) {
        return res.status(404).json({
          success: false,
          message: 'Payslip not found'
        });
      }

      const journalEntry = await accountingModel.createPayrollJournalEntry(payslip, req.user.id);

      res.json({
        success: true,
        message: 'Journal entry created for payroll',
        data: journalEntry
      });
    } catch (error) {
      console.error('Create payroll journal entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating journal entry for payroll'
      });
    }
  }
};

module.exports = accountingController;