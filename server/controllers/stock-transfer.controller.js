const stockTransferModel = require('../models/stock-transfer.model');
const { validationResult } = require('express-validator');

const stockTransferController = {
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        from_warehouse_id: req.query.from_warehouse_id,
        to_warehouse_id: req.query.to_warehouse_id,
        status: req.query.status
      };
      const result = await stockTransferModel.getAll(filters, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Get stock transfers error:', error);
      res.status(500).json({ success: false, message: 'Error fetching stock transfers' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const transfer = await stockTransferModel.getById(id);
      if (!transfer) {
        return res.status(404).json({ success: false, message: 'Stock transfer not found' });
      }
      res.json({ success: true, data: transfer });
    } catch (error) {
      console.error('Get stock transfer error:', error);
      res.status(500).json({ success: false, message: 'Error fetching stock transfer' });
    }
  },

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
      }
      const transferData = { ...req.body, created_by: req.user.id };
      const transfer = await stockTransferModel.create(transferData);
      res.status(201).json({ success: true, message: 'Stock transfer created successfully', data: transfer });
    } catch (error) {
      console.error('Create stock transfer error:', error);
      res.status(500).json({ success: false, message: 'Error creating stock transfer' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const transfer = await stockTransferModel.update(id, req.body);
      res.json({ success: true, message: 'Stock transfer updated successfully', data: transfer });
    } catch (error) {
      console.error('Update stock transfer error:', error);
      res.status(500).json({ success: false, message: 'Error updating stock transfer' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await stockTransferModel.delete(id);
      res.json({ success: true, message: 'Stock transfer deleted successfully' });
    } catch (error) {
      console.error('Delete stock transfer error:', error);
      res.status(500).json({ success: false, message: 'Error deleting stock transfer' });
    }
  },

  async generateTransferNumber(req, res) {
    try {
      const transferNumber = await stockTransferModel.generateTransferNumber();
      res.json({ success: true, data: { transfer_number: transferNumber } });
    } catch (error) {
      console.error('Generate transfer number error:', error);
      res.status(500).json({ success: false, message: 'Error generating transfer number' });
    }
  },

  async process(req, res) {
    try {
      const { id } = req.params;
      const transfer = await stockTransferModel.process(id, req.user.id);
      res.json({ success: true, message: 'Stock transfer processed successfully', data: transfer });
    } catch (error) {
      console.error('Process stock transfer error:', error);
      res.status(500).json({ success: false, message: error.message || 'Error processing stock transfer' });
    }
  },

  async complete(req, res) {
    try {
      const { id } = req.params;
      const { received_items } = req.body;
      const transfer = await stockTransferModel.complete(id, received_items, req.user.id);
      res.json({ success: true, message: 'Stock transfer completed successfully', data: transfer });
    } catch (error) {
      console.error('Complete stock transfer error:', error);
      res.status(500).json({ success: false, message: error.message || 'Error completing stock transfer' });
    }
  },

  async cancel(req, res) {
    try {
      const { id } = req.params;
      const transfer = await stockTransferModel.cancel(id);
      res.json({ success: true, message: 'Stock transfer cancelled successfully', data: transfer });
    } catch (error) {
      console.error('Cancel stock transfer error:', error);
      res.status(500).json({ success: false, message: 'Error cancelling stock transfer' });
    }
  }
};

module.exports = stockTransferController;
