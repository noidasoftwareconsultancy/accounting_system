const prisma = require('../lib/prisma');

const projectModel = {
  /**
   * Get all projects with pagination and filtering
   */
  async getAll(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = {};

    if (filters.client_id) where.client_id = parseInt(filters.client_id);
    if (filters.status) where.status = filters.status;
    if (filters.department) where.department = filters.department;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          client: {
            select: { id: true, name: true, email: true }
          },
          creator: {
            select: { id: true, first_name: true, last_name: true }
          },
          _count: {
            select: {
              invoices: true,
              expenses: true,
              milestones: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.project.count({ where })
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
   * Get project by ID
   */
  async getById(id) {
    return prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: true,
        creator: {
          select: { id: true, first_name: true, last_name: true }
        },
        contracts: true,
        milestones: {
          orderBy: { due_date: 'asc' }
        },
        invoices: {
          orderBy: { created_at: 'desc' }
        },
        expenses: {
          orderBy: { expense_date: 'desc' },
          take: 10
        }
      }
    });
  },

  /**
   * Create a new project
   */
  async create(projectData) {
    const data = {
      name: projectData.name,
      client_id: parseInt(projectData.client_id),
      created_by: parseInt(projectData.created_by),
      description: projectData.description || null,
      status: projectData.status || 'active',
      department: projectData.department || null,
      budget: projectData.budget ? parseFloat(projectData.budget) : null,
      start_date: projectData.start_date ? new Date(projectData.start_date + 'T00:00:00.000Z') : null,
      end_date: projectData.end_date ? new Date(projectData.end_date + 'T00:00:00.000Z') : null
    };

    return prisma.project.create({
      data,
      include: {
        client: true,
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Update project
   */
  async update(id, projectData) {
    const data = {};
    
    if (projectData.name !== undefined) data.name = projectData.name;
    if (projectData.client_id !== undefined) data.client_id = parseInt(projectData.client_id);
    if (projectData.description !== undefined) data.description = projectData.description;
    if (projectData.status !== undefined) data.status = projectData.status;
    if (projectData.department !== undefined) data.department = projectData.department;
    if (projectData.budget !== undefined) data.budget = projectData.budget ? parseFloat(projectData.budget) : null;
    if (projectData.start_date !== undefined) data.start_date = projectData.start_date ? new Date(projectData.start_date + 'T00:00:00.000Z') : null;
    if (projectData.end_date !== undefined) data.end_date = projectData.end_date ? new Date(projectData.end_date + 'T00:00:00.000Z') : null;

    return prisma.project.update({
      where: { id: parseInt(id) },
      data,
      include: {
        client: true,
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Delete project
   */
  async delete(id) {
    return prisma.project.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Get project financial summary
   */
  async getFinancialSummary(id) {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      select: { budget: true }
    });

    const [invoiceStats, expenseStats] = await Promise.all([
      prisma.invoice.aggregate({
        where: { project_id: parseInt(id) },
        _sum: { total_amount: true },
        _count: { id: true }
      }),
      prisma.expense.aggregate({
        where: { project_id: parseInt(id) },
        _sum: { amount: true },
        _count: { id: true }
      })
    ]);

    const totalRevenue = invoiceStats._sum.total_amount || 0;
    const totalExpenses = expenseStats._sum.amount || 0;
    const profit = totalRevenue - totalExpenses;
    const budgetUsed = project?.budget ? (totalExpenses / parseFloat(project.budget)) * 100 : 0;

    return {
      budget: project?.budget || 0,
      totalRevenue,
      totalExpenses,
      profit,
      budgetUsed,
      invoiceCount: invoiceStats._count.id,
      expenseCount: expenseStats._count.id
    };
  },

  /**
   * Get project statistics
   */
  async getStats() {
    const [total, active, completed, onHold] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'active' } }),
      prisma.project.count({ where: { status: 'completed' } }),
      prisma.project.count({ where: { status: 'on_hold' } })
    ]);

    const totalBudget = await prisma.project.aggregate({
      _sum: { budget: true }
    });

    return {
      total,
      active,
      completed,
      onHold,
      totalBudget: totalBudget._sum.budget || 0
    };
  }
};

module.exports = projectModel;