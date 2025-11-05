const Payment = require('../models/payment.model');
const { validationResult } = require('express-validator');

const paymentController = {
  /**
   * Get all payments
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        search: req.query.search,
        payment_method: req.query.payment_method,
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        invoice_id: req.query.invoice_id
      };

      const result = await Payment.getAll(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching payments'
      });
    }
  },

  /**
   * Get payment by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const payment = await Payment.getById(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching payment'
      });
    }
  },

  /**
   * Create new payment
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

      const paymentData = {
        ...req.body,
        created_by: req.user.id
      };

      const payment = await Payment.create(paymentData);

      res.status(201).json({
        success: true,
        message: 'Payment recorded successfully',
        data: payment
      });
    } catch (error) {
      console.error('Create payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error recording payment'
      });
    }
  },

  /**
   * Update payment
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
      const payment = await Payment.update(id, req.body);

      res.json({
        success: true,
        message: 'Payment updated successfully',
        data: payment
      });
    } catch (error) {
      console.error('Update payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating payment'
      });
    }
  },

  /**
   * Delete payment
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await Payment.delete(id);

      res.json({
        success: true,
        message: 'Payment deleted successfully'
      });
    } catch (error) {
      console.error('Delete payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting payment'
      });
    }
  },

  /**
   * Get payments by invoice
   */
  async getByInvoice(req, res) {
    try {
      const { invoiceId } = req.params;
      const payments = await Payment.getByInvoice(invoiceId);

      res.json({
        success: true,
        data: payments
      });
    } catch (error) {
      console.error('Get payments by invoice error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching payments'
      });
    }
  },

  /**
   * Get payment statistics
   */
  async getStats(req, res) {
    try {
      const stats = await Payment.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get payment stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching payment statistics'
      });
    }
  }
};

module.exports = paymentController;