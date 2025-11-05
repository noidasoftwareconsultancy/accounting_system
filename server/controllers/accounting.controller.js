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

      const result = await accountingModel.getAllAccounts(page, limit);
      
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
  }
};

module.exports = accountingController;