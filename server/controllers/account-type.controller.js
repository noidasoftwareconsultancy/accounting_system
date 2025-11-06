const accountTypeModel = require('../models/account-type.model');
const { validationResult } = require('express-validator');

const accountTypeController = {
  /**
   * Get all account types
   */
  async getAll(req, res) {
    try {
      const accountTypes = await accountTypeModel.getAll();
      
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
   * Get account type by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const accountType = await accountTypeModel.getById(id);

      if (!accountType) {
        return res.status(404).json({
          success: false,
          message: 'Account type not found'
        });
      }

      res.json({
        success: true,
        data: accountType
      });
    } catch (error) {
      console.error('Get account type error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching account type'
      });
    }
  },

  /**
   * Create new account type
   */
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const accountType = await accountTypeModel.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Account type created successfully',
        data: accountType
      });
    } catch (error) {
      console.error('Create account type error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating account type'
      });
    }
  },

  /**
   * Update account type
   */
  async update(req, res) {
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
      const accountType = await accountTypeModel.update(id, req.body);

      res.json({
        success: true,
        message: 'Account type updated successfully',
        data: accountType
      });
    } catch (error) {
      console.error('Update account type error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating account type'
      });
    }
  },

  /**
   * Delete account type
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await accountTypeModel.delete(id);

      res.json({
        success: true,
        message: 'Account type deleted successfully'
      });
    } catch (error) {
      console.error('Delete account type error:', error);
      if (error.message.includes('Cannot delete account type with associated accounts')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Error deleting account type'
      });
    }
  },

  /**
   * Get account type statistics
   */
  async getStats(req, res) {
    try {
      const stats = await accountTypeModel.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get account type stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching account type statistics'
      });
    }
  }
};

module.exports = accountTypeController;