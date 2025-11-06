const bankingModel = require('../models/banking.model');
const { validationResult } = require('express-validator');

const bankingController = {
  /**
   * Get all bank accounts
   */
  async getAllBankAccounts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await bankingModel.getAllBankAccounts(page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get bank accounts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching bank accounts'
      });
    }
  },

  /**
   * Get bank account by ID
   */
  async getBankAccountById(req, res) {
    try {
      const { id } = req.params;
      const bankAccount = await bankingModel.getBankAccountById(id);

      if (!bankAccount) {
        return res.status(404).json({
          success: false,
          message: 'Bank account not found'
        });
      }

      res.json({
        success: true,
        data: bankAccount
      });
    } catch (error) {
      console.error('Get bank account error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching bank account'
      });
    }
  },

  /**
   * Create bank account
   */
  async createBankAccount(req, res) {
    try {
      console.log('Create bank account request:', {
        user: req.user,
        body: req.body
      });

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

      const bankAccount = await bankingModel.createBankAccount(accountData);

      res.status(201).json({
        success: true,
        message: 'Bank account created successfully',
        data: bankAccount
      });
    } catch (error) {
      console.error('Create bank account error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating bank account',
        error: error.message
      });
    }
  },

  /**
   * Update bank account
   */
  async updateBankAccount(req, res) {
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
      const bankAccount = await bankingModel.updateBankAccount(id, req.body);

      res.json({
        success: true,
        message: 'Bank account updated successfully',
        data: bankAccount
      });
    } catch (error) {
      console.error('Update bank account error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating bank account'
      });
    }
  },

  /**
   * Create bank transaction
   */
  async createTransaction(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const transactionData = {
        ...req.body,
        created_by: req.user.id
      };

      const transaction = await bankingModel.createTransaction(transactionData);

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: transaction
      });
    } catch (error) {
      console.error('Create transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating transaction'
      });
    }
  },

  /**
   * Get bank transactions
   */
  async getTransactions(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const bankAccountId = req.query.bank_account_id;

      const result = await bankingModel.getTransactions(bankAccountId, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching transactions'
      });
    }
  },

  /**
   * Reconcile transaction
   */
  async reconcileTransaction(req, res) {
    try {
      const { transactionId } = req.params;
      const transaction = await bankingModel.reconcileTransaction(transactionId);

      res.json({
        success: true,
        message: 'Transaction reconciled successfully',
        data: transaction
      });
    } catch (error) {
      console.error('Reconcile transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Error reconciling transaction'
      });
    }
  },

  /**
   * Get payment gateways
   */
  async getPaymentGateways(req, res) {
    try {
      const gateways = await bankingModel.getPaymentGateways();
      
      res.json({
        success: true,
        data: gateways
      });
    } catch (error) {
      console.error('Get payment gateways error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching payment gateways'
      });
    }
  },

  /**
   * Create payment gateway
   */
  async createPaymentGateway(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const gatewayData = {
        ...req.body,
        created_by: req.user.id
      };

      const gateway = await bankingModel.createPaymentGateway(gatewayData);

      res.status(201).json({
        success: true,
        message: 'Payment gateway created successfully',
        data: gateway
      });
    } catch (error) {
      console.error('Create payment gateway error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating payment gateway'
      });
    }
  },

  /**
   * Get banking statistics
   */
  async getStats(req, res) {
    try {
      const stats = await bankingModel.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get banking stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching banking statistics'
      });
    }
  },

  /**
   * Delete bank account
   */
  async deleteBankAccount(req, res) {
    try {
      const { id } = req.params;
      await bankingModel.deleteBankAccount(id);

      res.json({
        success: true,
        message: 'Bank account deleted successfully'
      });
    } catch (error) {
      console.error('Delete bank account error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting bank account'
      });
    }
  },

  /**
   * Get account balance history
   */
  async getAccountBalanceHistory(req, res) {
    try {
      const { id } = req.params;
      const days = parseInt(req.query.days) || 30;
      
      const history = await bankingModel.getAccountBalanceHistory(id, days);
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Get balance history error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching balance history'
      });
    }
  },

  /**
   * Get cash flow summary
   */
  async getCashFlowSummary(req, res) {
    try {
      const { accountId } = req.params;
      const period = req.query.period || 'month';
      
      const summary = await bankingModel.getCashFlowSummary(accountId, period);
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Get cash flow summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching cash flow summary'
      });
    }
  },

  /**
   * Get unreconciled transactions
   */
  async getUnreconciledTransactions(req, res) {
    try {
      const accountId = req.query.account_id;
      const transactions = await bankingModel.getUnreconciledTransactions(accountId);
      
      res.json({
        success: true,
        data: transactions
      });
    } catch (error) {
      console.error('Get unreconciled transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching unreconciled transactions'
      });
    }
  },

  /**
   * Bulk reconcile transactions
   */
  async bulkReconcileTransactions(req, res) {
    try {
      const { transactionIds } = req.body;
      
      if (!transactionIds || !Array.isArray(transactionIds)) {
        return res.status(400).json({
          success: false,
          message: 'Transaction IDs array is required'
        });
      }

      await bankingModel.bulkReconcileTransactions(transactionIds);
      
      res.json({
        success: true,
        message: 'Transactions reconciled successfully'
      });
    } catch (error) {
      console.error('Bulk reconcile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error reconciling transactions'
      });
    }
  },

  /**
   * Transfer between accounts
   */
  async transferBetweenAccounts(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { fromAccountId, toAccountId, amount, description } = req.body;
      
      const result = await bankingModel.transferBetweenAccounts(
        fromAccountId, 
        toAccountId, 
        amount, 
        description, 
        req.user.id
      );
      
      res.json({
        success: true,
        message: 'Transfer completed successfully',
        data: result
      });
    } catch (error) {
      console.error('Transfer error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing transfer'
      });
    }
  }
};

module.exports = bankingController;