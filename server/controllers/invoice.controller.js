const Invoice = require('../models/invoice.model');
const { validationResult } = require('express-validator');

const invoiceController = {
  /**
   * Get all invoices
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        client_id: req.query.client_id,
        status: req.query.status,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const result = await Invoice.getAll(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get invoices error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching invoices'
      });
    }
  },

  /**
   * Get invoice by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const invoice = await Invoice.getById(id);

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      res.json({
        success: true,
        data: invoice
      });
    } catch (error) {
      console.error('Get invoice error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching invoice'
      });
    }
  },

  /**
   * Create new invoice
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

      // Calculate totals
      let totalAmount = 0;
      let taxAmount = 0;
      
      if (req.body.items && req.body.items.length > 0) {
        req.body.items.forEach(item => {
          const itemAmount = parseFloat(item.quantity) * parseFloat(item.unit_price);
          const itemTaxAmount = itemAmount * (parseFloat(item.tax_rate || 0) / 100);
          
          totalAmount += itemAmount;
          taxAmount += itemTaxAmount;
        });
      }

      const invoiceData = {
        ...req.body,
        amount: totalAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount + taxAmount,
        created_by: req.user.id
      };

      const invoice = await Invoice.create(invoiceData);

      res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: invoice
      });
    } catch (error) {
      console.error('Create invoice error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating invoice'
      });
    }
  },

  /**
   * Update invoice
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

      // Calculate totals
      let totalAmount = 0;
      let taxAmount = 0;
      
      if (req.body.items && req.body.items.length > 0) {
        req.body.items.forEach(item => {
          const itemAmount = parseFloat(item.quantity) * parseFloat(item.unit_price);
          const itemTaxAmount = itemAmount * (parseFloat(item.tax_rate || 0) / 100);
          
          totalAmount += itemAmount;
          taxAmount += itemTaxAmount;
        });
      }

      const invoiceData = {
        ...req.body,
        amount: totalAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount + taxAmount
      };

      const { id } = req.params;
      const invoice = await Invoice.update(id, invoiceData);

      res.json({
        success: true,
        message: 'Invoice updated successfully',
        data: invoice
      });
    } catch (error) {
      console.error('Update invoice error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating invoice'
      });
    }
  },

  /**
   * Delete invoice
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await Invoice.delete(id);

      res.json({
        success: true,
        message: 'Invoice deleted successfully'
      });
    } catch (error) {
      console.error('Delete invoice error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting invoice'
      });
    }
  },

  /**
   * Record payment
   */
  async recordPayment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const paymentData = {
        ...req.body,
        created_by: req.user.id
      };

      const payment = await Invoice.recordPayment(paymentData);

      res.json({
        success: true,
        message: 'Payment recorded successfully',
        data: payment
      });
    } catch (error) {
      console.error('Record payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error recording payment'
      });
    }
  },

  /**
   * Get invoice statistics
   */
  async getStats(req, res) {
    try {
      const stats = await Invoice.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get invoice stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching invoice statistics'
      });
    }
  },

  // Legacy methods for backward compatibility
  getAllInvoices: function(req, res) { return this.getAll(req, res); },
  getInvoiceById: function(req, res) { return this.getById(req, res); },
  createInvoice: function(req, res) { return this.create(req, res); },
  updateInvoice: function(req, res) { return this.update(req, res); },
  deleteInvoice: function(req, res) { return this.delete(req, res); }
};

module.exports = invoiceController;