const prisma = require('../lib/prisma');

class Invoice {
  static async getAll(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    const where = {};
    
    // Apply filters
    if (filters.client_id) where.client_id = parseInt(filters.client_id);
    if (filters.status) where.status = filters.status;
    if (filters.start_date && filters.end_date) {
      where.issue_date = {
        gte: new Date(filters.start_date),
        lte: new Date(filters.end_date)
      };
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          client: {
            select: { id: true, name: true, email: true }
          },
          project: {
            select: { id: true, name: true }
          },
          creator: {
            select: { id: true, first_name: true, last_name: true }
          },
          items: true,
          payments: true
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.invoice.count({ where })
    ]);

    return {
      invoices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getById(id) {
    return prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: true,
        project: true,
        creator: {
          select: { id: true, first_name: true, last_name: true }
        },
        items: true,
        payments: {
          include: {
            creator: {
              select: { id: true, first_name: true, last_name: true }
            }
          }
        },
        credit_notes: true
      }
    });
  }

  static async create(invoiceData) {
    const { items, ...invoiceFields } = invoiceData;
    
    // Generate invoice number if not provided
    if (!invoiceFields.invoice_number) {
      invoiceFields.invoice_number = await this.generateInvoiceNumber();
    }

    return prisma.$transaction(async (tx) => {
      // Create invoice
      const invoice = await tx.invoice.create({
        data: {
          invoice_number: invoiceFields.invoice_number,
          client_id: parseInt(invoiceFields.client_id),
          project_id: invoiceFields.project_id ? parseInt(invoiceFields.project_id) : null,
          issue_date: invoiceFields.issue_date ? new Date(invoiceFields.issue_date + 'T00:00:00.000Z') : new Date(),
          due_date: invoiceFields.due_date ? new Date(invoiceFields.due_date + 'T00:00:00.000Z') : new Date(),
          amount: parseFloat(invoiceFields.amount || 0),
          tax_amount: parseFloat(invoiceFields.tax_amount || 0),
          total_amount: parseFloat(invoiceFields.total_amount || 0),
          currency: invoiceFields.currency || 'USD',
          status: invoiceFields.status || 'draft',
          notes: invoiceFields.notes || null,
          department: invoiceFields.department || null,
          created_by: parseInt(invoiceFields.created_by),
          items: {
            create: items?.map(item => ({
              description: item.description,
              quantity: parseFloat(item.quantity),
              unit_price: parseFloat(item.unit_price),
              amount: parseFloat(item.quantity) * parseFloat(item.unit_price),
              tax_rate: parseFloat(item.tax_rate || 0),
              tax_amount: parseFloat(item.quantity) * parseFloat(item.unit_price) * (parseFloat(item.tax_rate || 0) / 100)
            })) || []
          }
        },
        include: {
          client: true,
          project: true,
          items: true
        }
      });

      return invoice;
    });
  }

  static async update(id, invoiceData) {
    const { items, ...invoiceFields } = invoiceData;
    
    return prisma.$transaction(async (tx) => {
      // Update invoice
      const updateData = {};
      
      if (invoiceFields.invoice_number !== undefined) updateData.invoice_number = invoiceFields.invoice_number;
      if (invoiceFields.client_id !== undefined) updateData.client_id = parseInt(invoiceFields.client_id);
      if (invoiceFields.project_id !== undefined) updateData.project_id = invoiceFields.project_id ? parseInt(invoiceFields.project_id) : null;
      if (invoiceFields.issue_date !== undefined) updateData.issue_date = invoiceFields.issue_date ? new Date(invoiceFields.issue_date + 'T00:00:00.000Z') : null;
      if (invoiceFields.due_date !== undefined) updateData.due_date = invoiceFields.due_date ? new Date(invoiceFields.due_date + 'T00:00:00.000Z') : null;
      if (invoiceFields.amount !== undefined) updateData.amount = parseFloat(invoiceFields.amount || 0);
      if (invoiceFields.tax_amount !== undefined) updateData.tax_amount = parseFloat(invoiceFields.tax_amount || 0);
      if (invoiceFields.total_amount !== undefined) updateData.total_amount = parseFloat(invoiceFields.total_amount || 0);
      if (invoiceFields.currency !== undefined) updateData.currency = invoiceFields.currency;
      if (invoiceFields.status !== undefined) updateData.status = invoiceFields.status;
      if (invoiceFields.notes !== undefined) updateData.notes = invoiceFields.notes;
      if (invoiceFields.department !== undefined) updateData.department = invoiceFields.department;

      const invoice = await tx.invoice.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      // Delete existing items and create new ones
      if (items) {
        await tx.invoiceItem.deleteMany({
          where: { invoice_id: parseInt(id) }
        });

        if (items.length > 0) {
          await tx.invoiceItem.createMany({
            data: items.map(item => ({
              invoice_id: parseInt(id),
              description: item.description,
              quantity: parseFloat(item.quantity),
              unit_price: parseFloat(item.unit_price),
              amount: parseFloat(item.quantity) * parseFloat(item.unit_price),
              tax_rate: parseFloat(item.tax_rate || 0),
              tax_amount: parseFloat(item.quantity) * parseFloat(item.unit_price) * (parseFloat(item.tax_rate || 0) / 100)
            }))
          });
        }
      }

      return this.getById(id);
    });
  }

  static async delete(id) {
    return prisma.invoice.delete({
      where: { id: parseInt(id) }
    });
  }

  static async recordPayment(paymentData) {
    return prisma.$transaction(async (tx) => {
      // Create payment
      const payment = await tx.payment.create({
        data: {
          ...paymentData,
          invoice_id: parseInt(paymentData.invoice_id),
          amount: parseFloat(paymentData.amount),
          created_by: parseInt(paymentData.created_by)
        }
      });

      // Get invoice with payments
      const invoice = await tx.invoice.findUnique({
        where: { id: parseInt(paymentData.invoice_id) },
        include: { payments: true }
      });

      // Calculate total payments
      const totalPaid = invoice.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      // Update invoice status
      let status = 'draft';
      if (totalPaid >= parseFloat(invoice.total_amount)) {
        status = 'paid';
      } else if (totalPaid > 0) {
        status = 'partial';
      }

      await tx.invoice.update({
        where: { id: parseInt(paymentData.invoice_id) },
        data: { status }
      });

      return payment;
    });
  }

  static async generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        invoice_number: {
          startsWith: `INV-${year}${month}-`
        }
      },
      orderBy: { invoice_number: 'desc' }
    });
    
    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoice_number.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    return `INV-${year}${month}-${sequence.toString().padStart(4, '0')}`;
  }

  static async getStats() {
    const [total, paid, pending, overdue] = await Promise.all([
      prisma.invoice.count(),
      prisma.invoice.count({ where: { status: 'paid' } }),
      prisma.invoice.count({ where: { status: 'pending' } }),
      prisma.invoice.count({ 
        where: { 
          status: { not: 'paid' },
          due_date: { lt: new Date() }
        } 
      })
    ]);

    const totalAmount = await prisma.invoice.aggregate({
      _sum: { total_amount: true }
    });

    return {
      total,
      paid,
      pending,
      overdue,
      totalAmount: totalAmount._sum.total_amount || 0
    };
  }

  static async sendInvoice(id) {
    return prisma.invoice.update({
      where: { id: parseInt(id) },
      data: { status: 'sent' },
      include: {
        client: true,
        project: true,
        items: true,
        payments: true
      }
    });
  }

  static async markAsPaid(id) {
    return prisma.invoice.update({
      where: { id: parseInt(id) },
      data: { status: 'paid' },
      include: {
        client: true,
        project: true,
        items: true,
        payments: true
      }
    });
  }

  static async duplicateInvoice(id, createdBy) {
    const originalInvoice = await this.getById(id);
    if (!originalInvoice) {
      throw new Error('Invoice not found');
    }

    const newInvoiceNumber = await this.generateInvoiceNumber();
    
    return prisma.$transaction(async (tx) => {
      const newInvoice = await tx.invoice.create({
        data: {
          invoice_number: newInvoiceNumber,
          client_id: originalInvoice.client_id,
          project_id: originalInvoice.project_id,
          issue_date: new Date(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          amount: originalInvoice.amount,
          tax_amount: originalInvoice.tax_amount,
          total_amount: originalInvoice.total_amount,
          currency: originalInvoice.currency,
          status: 'draft',
          notes: originalInvoice.notes,
          department: originalInvoice.department,
          created_by: parseInt(createdBy),
          items: {
            create: originalInvoice.items.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              amount: item.amount,
              tax_rate: item.tax_rate,
              tax_amount: item.tax_amount
            }))
          }
        },
        include: {
          client: true,
          project: true,
          items: true
        }
      });

      return newInvoice;
    });
  }

  static async getOverdueInvoices() {
    return prisma.invoice.findMany({
      where: {
        status: { not: 'paid' },
        due_date: { lt: new Date() }
      },
      include: {
        client: {
          select: { id: true, name: true, email: true }
        },
        project: {
          select: { id: true, name: true }
        },
        payments: true
      },
      orderBy: { due_date: 'asc' }
    });
  }

  static async getByClient(clientId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: { client_id: parseInt(clientId) },
        include: {
          client: {
            select: { id: true, name: true, email: true }
          },
          project: {
            select: { id: true, name: true }
          },
          items: true,
          payments: true
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.invoice.count({ where: { client_id: parseInt(clientId) } })
    ]);

    return {
      invoices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getByProject(projectId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: { project_id: parseInt(projectId) },
        include: {
          client: {
            select: { id: true, name: true, email: true }
          },
          project: {
            select: { id: true, name: true }
          },
          items: true,
          payments: true
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.invoice.count({ where: { project_id: parseInt(projectId) } })
    ]);

    return {
      invoices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = Invoice;