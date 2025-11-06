const contractModel = require('../models/contract.model');
const { validationResult } = require('express-validator');

const contractController = {
  /**
   * Get all contracts
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        client_id: req.query.client_id,
        project_id: req.query.project_id,
        status: req.query.status,
        search: req.query.search
      };

      const result = await contractModel.getAll(filters, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get contracts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching contracts'
      });
    }
  },

  /**
   * Get contract by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const contract = await contractModel.getById(id);

      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contract not found'
        });
      }

      res.json({
        success: true,
        data: contract
      });
    } catch (error) {
      console.error('Get contract error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching contract'
      });
    }
  },

  /**
   * Create new contract
   */
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const contractData = {
        ...req.body,
        created_by: req.user.id
      };

      const contract = await contractModel.create(contractData);
      
      res.status(201).json({
        success: true,
        data: contract,
        message: 'Contract created successfully'
      });
    } catch (error) {
      console.error('Create contract error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating contract'
      });
    }
  },

  /**
   * Update contract
   */
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const contract = await contractModel.update(id, req.body);

      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contract not found'
        });
      }

      res.json({
        success: true,
        data: contract,
        message: 'Contract updated successfully'
      });
    } catch (error) {
      console.error('Update contract error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating contract'
      });
    }
  },

  /**
   * Delete contract
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await contractModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Contract not found'
        });
      }

      res.json({
        success: true,
        message: 'Contract deleted successfully'
      });
    } catch (error) {
      console.error('Delete contract error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting contract'
      });
    }
  },

  /**
   * Get contracts by client
   */
  async getByClient(req, res) {
    try {
      const { clientId } = req.params;
      const contracts = await contractModel.getByClient(clientId);

      res.json({
        success: true,
        data: contracts
      });
    } catch (error) {
      console.error('Get contracts by client error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching client contracts'
      });
    }
  },

  /**
   * Get contracts by project
   */
  async getByProject(req, res) {
    try {
      const { projectId } = req.params;
      const contracts = await contractModel.getByProject(projectId);

      res.json({
        success: true,
        data: contracts
      });
    } catch (error) {
      console.error('Get contracts by project error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching project contracts'
      });
    }
  },

  /**
   * Get contract statistics
   */
  async getStats(req, res) {
    try {
      const stats = await contractModel.getStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get contract stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching contract statistics'
      });
    }
  },

  /**
   * Get expiring contracts
   */
  async getExpiringContracts(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const contracts = await contractModel.getExpiringContracts(days);

      res.json({
        success: true,
        data: contracts
      });
    } catch (error) {
      console.error('Get expiring contracts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching expiring contracts'
      });
    }
  },

  /**
   * Update contract status
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['draft', 'active', 'completed', 'terminated', 'expired'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const contract = await contractModel.updateStatus(id, status);

      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contract not found'
        });
      }

      res.json({
        success: true,
        data: contract,
        message: 'Contract status updated successfully'
      });
    } catch (error) {
      console.error('Update contract status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating contract status'
      });
    }
  },

  /**
   * Upload contract document
   */
  async uploadDocument(req, res) {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const documentPath = req.file.path;
      const contract = await contractModel.updateDocument(id, documentPath);

      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contract not found'
        });
      }

      res.json({
        success: true,
        data: contract,
        message: 'Document uploaded successfully'
      });
    } catch (error) {
      console.error('Upload document error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading document'
      });
    }
  },

  /**
   * Get contract document
   */
  async getDocument(req, res) {
    try {
      const { id } = req.params;
      const contract = await contractModel.getById(id);

      if (!contract || !contract.document_path) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      res.sendFile(contract.document_path);
    } catch (error) {
      console.error('Get document error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving document'
      });
    }
  },

  /**
   * Delete contract document
   */
  async deleteDocument(req, res) {
    try {
      const { id } = req.params;
      const contract = await contractModel.updateDocument(id, null);

      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contract not found'
        });
      }

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      console.error('Delete document error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting document'
      });
    }
  }
};

module.exports = contractController;