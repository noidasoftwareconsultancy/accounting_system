const clientModel = require('../models/client.model');
const { validationResult } = require('express-validator');

const clientController = {
  /**
   * Get all clients
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const result = await clientModel.getAll(page, limit, search);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get clients error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching clients'
      });
    }
  },

  /**
   * Get client by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const client = await clientModel.getById(id);

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      res.json({
        success: true,
        data: client
      });
    } catch (error) {
      console.error('Get client error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching client'
      });
    }
  },

  /**
   * Create new client
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

      const clientData = {
        ...req.body,
        created_by: req.user.id
      };

      const client = await clientModel.create(clientData);

      res.status(201).json({
        success: true,
        message: 'Client created successfully',
        data: client
      });
    } catch (error) {
      console.error('Create client error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating client'
      });
    }
  },

  /**
   * Update client
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
      const client = await clientModel.update(id, req.body);

      res.json({
        success: true,
        message: 'Client updated successfully',
        data: client
      });
    } catch (error) {
      console.error('Update client error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating client'
      });
    }
  },

  /**
   * Delete client
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await clientModel.delete(id);

      res.json({
        success: true,
        message: 'Client deleted successfully'
      });
    } catch (error) {
      console.error('Delete client error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting client'
      });
    }
  },

  /**
   * Get client statistics
   */
  async getStats(req, res) {
    try {
      const stats = await clientModel.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get client stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching client statistics'
      });
    }
  },

  /**
   * Get client projects
   */
  async getClientProjects(req, res) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await clientModel.getClientProjects(id, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get client projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching client projects'
      });
    }
  },

  /**
   * Get client invoices
   */
  async getClientInvoices(req, res) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await clientModel.getClientInvoices(id, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get client invoices error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching client invoices'
      });
    }
  },

  /**
   * Get client contracts
   */
  async getClientContracts(req, res) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await clientModel.getClientContracts(id, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get client contracts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching client contracts'
      });
    }
  },

  /**
   * Get client financial summary
   */
  async getClientFinancialSummary(req, res) {
    try {
      const { id } = req.params;
      const summary = await clientModel.getClientFinancialSummary(id);
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Get client financial summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching client financial summary'
      });
    }
  }
};

module.exports = clientController;