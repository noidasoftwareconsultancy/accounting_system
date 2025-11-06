const prisma = require('../lib/prisma');

const clientModel = {
  /**
   * Get all clients with pagination
   */
  async getAll(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          creator: {
            select: { id: true, first_name: true, last_name: true }
          },
          _count: {
            select: {
              projects: true,
              invoices: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.client.count({ where })
    ]);

    return {
      clients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get client by ID
   */
  async getById(id) {
    return prisma.client.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true }
        },
        projects: {
          include: {
            _count: {
              select: { invoices: true }
            }
          }
        },
        invoices: {
          orderBy: { created_at: 'desc' },
          take: 5
        },
        contracts: true
      }
    });
  },

  /**
   * Create a new client
   */
  async create(clientData) {
    return prisma.client.create({
      data: {
        ...clientData,
        created_by: parseInt(clientData.created_by)
      },
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Update client
   */
  async update(id, clientData) {
    return prisma.client.update({
      where: { id: parseInt(id) },
      data: clientData,
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Delete client
   */
  async delete(id) {
    return prisma.client.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Get client statistics
   */
  async getStats() {
    const [total, activeProjects, totalInvoices] = await Promise.all([
      prisma.client.count(),
      prisma.project.count({
        where: { status: 'active' }
      }),
      prisma.invoice.count()
    ]);

    const totalRevenue = await prisma.invoice.aggregate({
      where: { status: 'paid' },
      _sum: { total_amount: true }
    });

    return {
      total,
      activeProjects,
      totalInvoices,
      totalRevenue: totalRevenue._sum.total_amount || 0
    };
  },

  /**
   * Get client projects
   */
  async getClientProjects(clientId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: { client_id: parseInt(clientId) },
        include: {
          creator: {
            select: { id: true, first_name: true, last_name: true }
          },
          _count: {
            select: {
              invoices: true,
              milestones: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.project.count({ where: { client_id: parseInt(clientId) } })
    ]);

    return {
      projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get client invoices
   */
  async getClientInvoices(clientId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: { client_id: parseInt(clientId) },
        include: {
          project: {
            select: { id: true, name: true }
          },
          creator: {
            select: { id: true, first_name: true, last_name: true }
          },
          payments: true,
          _count: {
            select: { items: true }
          }
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
  },

  /**
   * Get client contracts
   */
  async getClientContracts(clientId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where: { client_id: parseInt(clientId) },
        include: {
          project: {
            select: { id: true, name: true }
          },
          creator: {
            select: { id: true, first_name: true, last_name: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.contract.count({ where: { client_id: parseInt(clientId) } })
    ]);

    return {
      contracts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get client financial summary
   */
  async getClientFinancialSummary(clientId) {
    const clientIdInt = parseInt(clientId);
    
    const [
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalRevenue,
      pendingAmount,
      activeProjects,
      totalContracts
    ] = await Promise.all([
      prisma.invoice.count({ where: { client_id: clientIdInt } }),
      prisma.invoice.count({ where: { client_id: clientIdInt, status: 'paid' } }),
      prisma.invoice.count({ 
        where: { 
          client_id: clientIdInt, 
          status: { in: ['sent', 'partially_paid'] }
        } 
      }),
      prisma.invoice.count({ 
        where: { 
          client_id: clientIdInt,
          status: { not: 'paid' },
          due_date: { lt: new Date() }
        } 
      }),
      prisma.invoice.aggregate({
        where: { client_id: clientIdInt, status: 'paid' },
        _sum: { total_amount: true }
      }),
      prisma.invoice.aggregate({
        where: { 
          client_id: clientIdInt, 
          status: { in: ['sent', 'partially_paid'] }
        },
        _sum: { total_amount: true }
      }),
      prisma.project.count({ 
        where: { client_id: clientIdInt, status: 'active' }
      }),
      prisma.contract.count({ where: { client_id: clientIdInt } })
    ]);

    // Get recent activity
    const recentInvoices = await prisma.invoice.findMany({
      where: { client_id: clientIdInt },
      orderBy: { created_at: 'desc' },
      take: 5,
      select: {
        id: true,
        invoice_number: true,
        total_amount: true,
        status: true,
        created_at: true
      }
    });

    const recentPayments = await prisma.payment.findMany({
      where: { 
        invoice: { client_id: clientIdInt }
      },
      orderBy: { created_at: 'desc' },
      take: 5,
      include: {
        invoice: {
          select: { invoice_number: true }
        }
      }
    });

    return {
      summary: {
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        overdueInvoices,
        totalRevenue: totalRevenue._sum.total_amount || 0,
        pendingAmount: pendingAmount._sum.total_amount || 0,
        activeProjects,
        totalContracts
      },
      recentActivity: {
        invoices: recentInvoices,
        payments: recentPayments
      }
    };
  }
};

module.exports = clientModel;