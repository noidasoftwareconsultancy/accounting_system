const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const milestoneModel = {
  /**
   * Get all milestones with pagination and filters
   */
  async getAll(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const where = {};
    
    if (filters.project_id) {
      where.project_id = parseInt(filters.project_id);
    }
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [milestones, total] = await Promise.all([
      prisma.milestone.findMany({
        where,
        include: {
          project: {
            select: { 
              id: true, 
              name: true, 
              status: true,
              client: {
                select: { id: true, name: true }
              }
            }
          },
          creator: {
            select: { id: true, username: true, first_name: true, last_name: true }
          }
        },
        orderBy: { due_date: 'asc' },
        skip,
        take: limit
      }),
      prisma.milestone.count({ where })
    ]);

    return {
      milestones,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get milestone by ID
   */
  async getById(id) {
    return await prisma.milestone.findUnique({
      where: { id: parseInt(id) },
      include: {
        project: {
          select: { 
            id: true, 
            name: true, 
            status: true, 
            budget: true,
            client: {
              select: { id: true, name: true, email: true }
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
   * Create new milestone
   */
  async create(milestoneData) {
    return await prisma.milestone.create({
      data: milestoneData,
      include: {
        project: {
          select: { 
            id: true, 
            name: true, 
            client: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });
  },

  /**
   * Update milestone
   */
  async update(id, updateData) {
    try {
      return await prisma.milestone.update({
        where: { id: parseInt(id) },
        data: {
          ...updateData,
          updated_at: new Date()
        },
        include: {
          project: {
            select: { 
              id: true, 
              name: true,
              client: {
                select: { id: true, name: true }
              }
            }
          }
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return null; // Milestone not found
      }
      throw error;
    }
  },

  /**
   * Delete milestone
   */
  async delete(id) {
    try {
      await prisma.milestone.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false; // Milestone not found
      }
      throw error;
    }
  },

  /**
   * Get milestones by project
   */
  async getByProject(projectId) {
    return await prisma.milestone.findMany({
      where: { project_id: parseInt(projectId) },
      orderBy: { due_date: 'asc' }
    });
  },

  /**
   * Get milestone statistics
   */
  async getStats() {
    const [
      totalMilestones,
      pendingMilestones,
      completedMilestones,
      overdueMilestones,
      totalValue,
      completedValue
    ] = await Promise.all([
      prisma.milestone.count(),
      prisma.milestone.count({ where: { status: 'pending' } }),
      prisma.milestone.count({ where: { status: 'completed' } }),
      prisma.milestone.count({
        where: {
          status: { not: 'completed' },
          due_date: { lt: new Date() }
        }
      }),
      prisma.milestone.aggregate({
        _sum: { amount: true }
      }),
      prisma.milestone.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true }
      })
    ]);

    return {
      totalMilestones,
      pendingMilestones,
      completedMilestones,
      overdueMilestones,
      totalValue: totalValue._sum.amount || 0,
      completedValue: completedValue._sum.amount || 0
    };
  },

  /**
   * Get upcoming milestones
   */
  async getUpcoming(days = 30) {
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    
    return await prisma.milestone.findMany({
      where: {
        status: { not: 'completed' },
        due_date: {
          gte: new Date(),
          lte: futureDate
        }
      },
      include: {
        project: {
          select: { 
            id: true, 
            name: true,
            client: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { due_date: 'asc' }
    });
  },

  /**
   * Get overdue milestones
   */
  async getOverdue() {
    return await prisma.milestone.findMany({
      where: {
        status: { not: 'completed' },
        due_date: { lt: new Date() }
      },
      include: {
        project: {
          select: { 
            id: true, 
            name: true,
            client: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { due_date: 'asc' }
    });
  },

  /**
   * Update milestone status
   */
  async updateStatus(id, status) {
    try {
      return await prisma.milestone.update({
        where: { id: parseInt(id) },
        data: { 
          status,
          updated_at: new Date()
        },
        include: {
          project: {
            select: { 
              id: true, 
              name: true,
              client: {
                select: { id: true, name: true }
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
   * Generate invoice for milestone
   */
  async generateInvoice(milestoneId, userId) {
    try {
      const milestone = await prisma.milestone.findUnique({
        where: { id: parseInt(milestoneId) },
        include: {
          project: {
            include: {
              client: true
            }
          }
        }
      });

      if (!milestone) {
        return { success: false, message: 'Milestone not found' };
      }

      if (milestone.invoice_generated) {
        return { success: false, message: 'Invoice already generated for this milestone' };
      }

      if (!milestone.amount || milestone.amount <= 0) {
        return { success: false, message: 'Milestone amount must be greater than 0' };
      }

      // Generate invoice number
      const invoiceCount = await prisma.invoice.count();
      const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`;

      // Create invoice
      const invoice = await prisma.invoice.create({
        data: {
          invoice_number: invoiceNumber,
          client_id: milestone.project.client_id,
          project_id: milestone.project_id,
          issue_date: new Date(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          amount: milestone.amount,
          tax_amount: 0,
          total_amount: milestone.amount,
          status: 'draft',
          notes: `Invoice for milestone: ${milestone.title}`,
          created_by: userId,
          items: {
            create: {
              description: milestone.title,
              quantity: 1,
              unit_price: milestone.amount,
              amount: milestone.amount,
              tax_rate: 0,
              tax_amount: 0
            }
          }
        },
        include: {
          items: true,
          client: {
            select: { id: true, name: true, email: true }
          },
          project: {
            select: { id: true, name: true }
          }
        }
      });

      // Mark milestone as invoice generated
      await prisma.milestone.update({
        where: { id: parseInt(milestoneId) },
        data: { 
          invoice_generated: true,
          updated_at: new Date()
        }
      });

      return { success: true, invoice };
    } catch (error) {
      console.error('Generate invoice error:', error);
      return { success: false, message: 'Error generating invoice' };
    }
  }
};

module.exports = milestoneModel;