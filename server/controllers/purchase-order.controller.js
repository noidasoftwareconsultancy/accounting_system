const purchaseOrderModel = require('../models/purchase-order.model');
const { validationResult } = require('express-validator');

const purchaseOrderController = {
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        vendor_id: req.query.vendor_id,
        status: req.query.status,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };
      const result = await purchaseOrderModel.getAll(filters, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Get purchase orders error:', error);
      res.status(500).json({ success: false, message: 'Error fetching purchase orders' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const order = await purchaseOrderModel.getById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Purchase order not found' });
      }
      res.json({ success: true, data: order });
    } catch (error) {
      console.error('Get purchase order error:', error);
      res.status(500).json({ success: false, message: 'Error fetching purchase order' });
    }
  },

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
      }
      const orderData = { ...req.body, created_by: req.user.id };
      const order = await purchaseOrderModel.create(orderData);
      res.status(201).json({ success: true, message: 'Purchase order created successfully', data: order });
    } catch (error) {
      console.error('Create purchase order error:', error);
      res.status(500).json({ success: false, message: 'Error creating purchase order' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const order = await purchaseOrderModel.update(id, req.body);
      res.json({ success: true, message: 'Purchase order updated successfully', data: order });
    } catch (error) {
      console.error('Update purchase order error:', error);
      res.status(500).json({ success: false, message: 'Error updating purchase order' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await purchaseOrderModel.delete(id);
      res.json({ success: true, message: 'Purchase order deleted successfully' });
    } catch (error) {
      console.error('Delete purchase order error:', error);
      res.status(500).json({ success: false, message: 'Error deleting purchase order' });
    }
  },

  async generatePONumber(req, res) {
    try {
      const poNumber = await purchaseOrderModel.generatePONumber();
      res.json({ success: true, data: { po_number: poNumber } });
    } catch (error) {
      console.error('Generate PO number error:', error);
      res.status(500).json({ success: false, message: 'Error generating PO number' });
    }
  },

  async receive(req, res) {
    try {
      const { id } = req.params;
      const { received_items, warehouse_id } = req.body;
      const order = await purchaseOrderModel.receive(id, received_items, warehouse_id, req.user.id);
      res.json({ success: true, message: 'Purchase order received successfully', data: order });
    } catch (error) {
      console.error('Receive purchase order error:', error);
      res.status(500).json({ success: false, message: 'Error receiving purchase order' });
    }
  },

  async getStats(req, res) {
    try {
      const stats = await purchaseOrderModel.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Get purchase order stats error:', error);
      res.status(500).json({ success: false, message: 'Error fetching statistics' });
    }
  },

  async getByVendor(req, res) {
    try {
      const { vendorId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await purchaseOrderModel.getByVendor(vendorId, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Get purchase orders by vendor error:', error);
      res.status(500).json({ success: false, message: 'Error fetching purchase orders' });
    }
  }
};

module.exports = purchaseOrderController;
