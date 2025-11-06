const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const creditNoteModel = {
  /**
   * Get all credit notes with pagination and filters
   */
  async getAll(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const where = {};
    
    if (filters.invoice_id) {
      where.invoice_id = parseInt(filters.invoice_id);
    }
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.search) {
      where.OR = [
        { credit_note_number: { contains: filters.search, mode: 'insensitive' } },
        { reason: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [creditNotes, total] = await Promise.all([
      prisma.creditNote.findMany({
        where,
        include: {
          invoice: {
            select: { 
              id: true, 
              invoice_number: true, 
              amount: true,
              client: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          creator: {
            select: { id: true, username: true, first_name: true, last_name: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.creditNote.count({ where })
    ]);

    return {
      creditNotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get credit note by ID
   */
  async getById(id) {
    return await prisma.creditNote.findUnique({
      where: { id: parseInt(id) },
      include: {
        invoice: {
          include: {
            client: {
              select: { id: true, name: true, email: true, phone: true, address: true }
            },
            project: {
              select: { id: true, name: true }
            }
          }
        },
        creator: {
          select: { id: true, username: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Create new credit note
   */
  async create(creditNoteData) {
    // Generate credit note number if not provided
    if (!creditNoteData.credit_note_number) {
      creditNoteData.credit_note_number = await this.generateCreditNoteNumber();
    }

    return await prisma.creditNote.create({
      data: creditNoteData,
      include: {
        invoice: {
          select: { 
            id: true, 
            invoice_number: true, 
            amount: true,
            client: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });
  },

  /**
   * Update credit note
   */
  async update(id, updateData) {
    try {
      return await prisma.creditNote.update({
        where: { id: parseInt(id) },
        data: {
          ...updateData,
          updated_at: new Date()
        },
        include: {
          invoice: {
            select: { 
              id: true, 
              invoice_number: true, 
              amount: true,
              client: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return null; // Credit note not found
      }
      throw error;
    }
  },

  /**
   * Delete credit note
   */
  async delete(id) {
    try {
      await prisma.creditNote.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false; // Credit note not found
      }
      throw error;
    }
  },

  /**
   * Get credit notes by invoice
   */
  async getByInvoice(invoiceId) {
    return await prisma.creditNote.findMany({
      where: { invoice_id: parseInt(invoiceId) },
      orderBy: { created_at: 'desc' }
    });
  },

  /**
   * Get credit note statistics
   */
  async getStats() {
    const [
      totalCreditNotes,
      issuedCreditNotes,
      appliedCreditNotes,
      totalAmount,
      appliedAmount
    ] = await Promise.all([
      prisma.creditNote.count(),
      prisma.creditNote.count({ where: { status: 'issued' } }),
      prisma.creditNote.count({ where: { status: 'applied' } }),
      prisma.creditNote.aggregate({
        _sum: { amount: true }
      }),
      prisma.creditNote.aggregate({
        where: { status: 'applied' },
        _sum: { amount: true }
      })
    ]);

    return {
      totalCreditNotes,
      issuedCreditNotes,
      appliedCreditNotes,
      totalAmount: totalAmount._sum.amount || 0,
      appliedAmount: appliedAmount._sum.amount || 0
    };
  },

  /**
   * Update credit note status
   */
  async updateStatus(id, status) {
    try {
      return await prisma.creditNote.update({
        where: { id: parseInt(id) },
        data: { 
          status,
          updated_at: new Date()
        },
        include: {
          invoice: {
            select: { 
              id: true, 
              invoice_number: true, 
              amount: true,
              client: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  },

  /**
   * Apply credit note to invoice
   */
  async applyCreditNote(id) {
    try {
      const creditNote = await prisma.creditNote.findUnique({
        where: { id: parseInt(id) },
        include: {
          invoice: true
        }
      });

      if (!creditNote) {
        return { success: false, message: 'Credit note not found' };
      }

      if (creditNote.status === 'applied') {
        return { success: false, message: 'Credit note already applied' };
      }

      if (creditNote.status !== 'issued') {
        return { success: false, message: 'Credit note must be issued before applying' };
      }

      // Update credit note status to applied
      const updatedCreditNote = await prisma.creditNote.update({
        where: { id: parseInt(id) },
        data: { 
          status: 'applied',
          updated_at: new Date()
        },
        include: {
          invoice: {
            select: { 
              id: true, 
              invoice_number: true, 
              amount: true,
              client: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });

      // TODO: Implement logic to adjust invoice amount or create payment record
      // This would depend on business logic requirements

      return { success: true, creditNote: updatedCreditNote };
    } catch (error) {
      console.error('Apply credit note error:', error);
      return { success: false, message: 'Error applying credit note' };
    }
  },

  /**
   * Generate credit note number
   */
  async generateCreditNoteNumber() {
    const count = await prisma.creditNote.count();
    return `CN-${String(count + 1).padStart(6, '0')}`;
  }
};

module.exports = creditNoteModel;