const creditNoteModel = require('../models/credit-note.model');
const { validationResult } = require('express-validator');

const creditNoteController = {
  /**
   * Get all credit notes
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        invoice_id: req.query.invoice_id,
        status: req.query.status,
        search: req.query.search
      };

      const result = await creditNoteModel.getAll(filters, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get credit notes error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching credit notes'
      });
    }
  },

  /**
   * Get credit note by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const creditNote = await creditNoteModel.getById(id);

      if (!creditNote) {
        return res.status(404).json({
          success: false,
          message: 'Credit note not found'
        });
      }

      res.json({
        success: true,
        data: creditNote
      });
    } catch (error) {
      console.error('Get credit note error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching credit note'
      });
    }
  },

  /**
   * Create new credit note
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

      const creditNoteData = {
        ...req.body,
        created_by: req.user.id
      };

      const creditNote = await creditNoteModel.create(creditNoteData);
      
      res.status(201).json({
        success: true,
        data: creditNote,
        message: 'Credit note created successfully'
      });
    } catch (error) {
      console.error('Create credit note error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating credit note'
      });
    }
  },

  /**
   * Update credit note
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
      const creditNote = await creditNoteModel.update(id, req.body);

      if (!creditNote) {
        return res.status(404).json({
          success: false,
          message: 'Credit note not found'
        });
      }

      res.json({
        success: true,
        data: creditNote,
        message: 'Credit note updated successfully'
      });
    } catch (error) {
      console.error('Update credit note error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating credit note'
      });
    }
  },

  /**
   * Delete credit note
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await creditNoteModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Credit note not found'
        });
      }

      res.json({
        success: true,
        message: 'Credit note deleted successfully'
      });
    } catch (error) {
      console.error('Delete credit note error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting credit note'
      });
    }
  },

  /**
   * Get credit notes by invoice
   */
  async getByInvoice(req, res) {
    try {
      const { invoiceId } = req.params;
      const creditNotes = await creditNoteModel.getByInvoice(invoiceId);

      res.json({
        success: true,
        data: creditNotes
      });
    } catch (error) {
      console.error('Get credit notes by invoice error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching invoice credit notes'
      });
    }
  },

  /**
   * Get credit note statistics
   */
  async getStats(req, res) {
    try {
      const stats = await creditNoteModel.getStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get credit note stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching credit note statistics'
      });
    }
  },

  /**
   * Update credit note status
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['draft', 'issued', 'applied', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const creditNote = await creditNoteModel.updateStatus(id, status);

      if (!creditNote) {
        return res.status(404).json({
          success: false,
          message: 'Credit note not found'
        });
      }

      res.json({
        success: true,
        data: creditNote,
        message: 'Credit note status updated successfully'
      });
    } catch (error) {
      console.error('Update credit note status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating credit note status'
      });
    }
  },

  /**
   * Apply credit note to invoice
   */
  async applyCreditNote(req, res) {
    try {
      const { id } = req.params;
      const result = await creditNoteModel.applyCreditNote(id);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        data: result.creditNote,
        message: 'Credit note applied successfully'
      });
    } catch (error) {
      console.error('Apply credit note error:', error);
      res.status(500).json({
        success: false,
        message: 'Error applying credit note'
      });
    }
  },

  /**
   * Generate credit note number
   */
  async generateCreditNoteNumber(req, res) {
    try {
      const creditNoteNumber = await creditNoteModel.generateCreditNoteNumber();

      res.json({
        success: true,
        data: { credit_note_number: creditNoteNumber }
      });
    } catch (error) {
      console.error('Generate credit note number error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating credit note number'
      });
    }
  },

  /**
   * Get credit note PDF
   */
  async getCreditNotePDF(req, res) {
    try {
      const { id } = req.params;
      const creditNote = await creditNoteModel.getById(id);

      if (!creditNote) {
        return res.status(404).json({
          success: false,
          message: 'Credit note not found'
        });
      }

      // TODO: Implement PDF generation
      res.json({
        success: true,
        message: 'PDF generation not implemented yet',
        data: creditNote
      });
    } catch (error) {
      console.error('Get credit note PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating credit note PDF'
      });
    }
  }
};

module.exports = creditNoteController;