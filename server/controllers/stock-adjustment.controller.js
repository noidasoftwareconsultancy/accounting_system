const stockAdjustmentModel = require('../models/stock-adjustment.model');
const { validationResult } = require('express-validator');

const stockAdjustmentController = {
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        warehouse_id: req.query.warehouse_id,
        status: req.query.status
      };
      const result = await stockAdjustmentModel.getAll(filters, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Get stock adjustments error:', error);
      res.status(500).json({ success: false, message: 'Error fetching stock adjustments' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const adjustment = await stockAdjustmentModel.getById(id);
      if (!adjustment) {
        return res.status(404).json({ success: false, message: 'Stock adjustment not found' });
      }
      res.json({ success: true, data: adjustment });
    } catch (error) {
      console.error('Get stock adjustment error:', error);
      res.status(500).json({ success: false, message: 'Error fetching stock adjustment' });
    }
  },

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
      }
      const adjustmentData = { ...req.body, created_by: req.user.id };
      const adjustment = await stockAdjustmentModel.create(adjustmentData);
      res.status(201).json({ success: true, message: 'Stock adjustment created successfully', data: adjustment });
    } catch (error) {
      console.error('Create stock adjustment error:', error);
      res.status(500).json({ success: false, message: 'Error creating stock adjustment' });
    }
  },

  async approve(req, res) {
    try {
      const { id } = req.params;
      const { warehouse_id } = req.body;
      const adjustment = await stockAdjustmentModel.approve(id, warehouse_id, req.user.id);
      res.json({ success: true, message: 'Stock adjustment approved successfully', data: adjustment });
    } catch (error) {
      console.error('Approve stock adjustment error:', error);
      res.status(500).json({ success: false, message: error.message || 'Error approving stock adjustment' });
    }
  },

  async cancel(req, res) {
    try {
      const { id } = req.params;
      const adjustment = await stockAdjustmentModel.cancel(id);
      res.json({ success: true, message: 'Stock adjustment cancelled successfully', data: adjustment });
    } catch (error) {
      console.error('Cancel stock adjustment error:', error);
      res.status(500).json({ success: false, message: 'Error cancelling stock adjustment' });
    }
  },

  async generateAdjustmentNumber(req, res) {
    try {
      const adjustmentNumber = await stockAdjustmentModel.generateAdjustmentNumber();
      res.json({ success: true, data: { adjustment_number: adjustmentNumber } });
    } catch (error) {
      console.error('Generate adjustment number error:', error);
      res.status(500).json({ success: false, message: 'Error generating adjustment number' });
    }
  }
};

module.exports = stockAdjustmentController;
