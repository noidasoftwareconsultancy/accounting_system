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
  }
};

module.exports = clientModel;