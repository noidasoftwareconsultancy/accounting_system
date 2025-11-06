const ledgerEntryModel = require('../models/ledger-entry.model');
const { validationResult } = require('express-validator');

const ledgerEntryController = {
  /**
   * Get all ledger entries
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        account_id: req.query.account_id,
        journal_entry_id: req.query.journal_entry_id,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const result = await ledgerEntryModel.getAll(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get ledger entries error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching ledger entries'
      });
    }
  },

  /**
   * Get ledger entry by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const entry = await ledgerEntryModel.getById(id);

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Ledger entry not found'
        });
      }

      res.json({
        success: true,
        data: entry
      });
    } catch (error) {
      console.error('Get ledger entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching ledger entry'
      });
    }
  },

  /**
   * Get account balance
   */
  async getAccountBalance(req, res) {
    try {
      const { accountId } = req.params;
      const { asOfDate } = req.query;
      
      const balance = await ledgerEntryModel.getAccountBalance(accountId, asOfDate);
      
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
   * Get trial balance
   */
  async getTrialBalance(req, res) {
    try {
      const { asOfDate } = req.query;
      
      const trialBalance = await ledgerEntryModel.getTrialBalance(asOfDate);
      
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
   * Get ledger entries by account
   */
  async getByAccount(req, res) {
    try {
      const { accountId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const result = await ledgerEntryModel.getByAccount(accountId, page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get ledger entries by account error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching account ledger entries'
      });
    }
  },

  /**
   * Get account statement
   */
  async getAccountStatement(req, res) {
    try {
      const { accountId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const statement = await ledgerEntryModel.getAccountStatement(accountId, startDate, endDate);
      
      res.json({
        success: true,
        data: statement
      });
    } catch (error) {
      console.error('Get account statement error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating account statement'
      });
    }
  }
};

module.exports = ledgerEntryController;