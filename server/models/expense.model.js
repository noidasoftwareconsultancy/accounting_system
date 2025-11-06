const prisma = require('../lib/prisma');

const expenseModel = {
  /**
   * Get all expenses with pagination and filtering
   */
  async getAll(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = {};
    
    // Apply filters
    if (filters.category_id) where.category_id = parseInt(filters.category_id);
    if (filters.vendor_id) where.vendor_id = parseInt(filters.vendor_id);
    if (filters.project_id) where.project_id = parseInt(filters.project_id);
    if (filters.status) where.status = filters.status;
    
    if (filters.start_date && filters.end_date) {
      where.expense_date = {
        gte: new Date(filters.start_date),
        lte: new Date(filters.end_date)
      };
    }
    
    if (filters.min_amount && filters.max_amount) {
      where.amount = {
        gte: parseFloat(filters.min_amount),
        lte: parseFloat(filters.max_amount)
      };
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, description: true }
          },
          vendor: {
            select: { id: true, name: true, email: true }
          },
          project: {
            select: { id: true, name: true }
          },
          creator: {
            select: { id: true, first_name: true, last_name: true }
          }
        },
        orderBy: { expense_date: 'desc' },
        skip,
        take: limit
      }),
      prisma.expense.count({ where })
    ]);
    
    return {
      expenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get expense by ID
   */
  async getById(id) {
    return prisma.expense.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        vendor: true,
        project: true,
        creator: {
          select: { id: true, first_name: true, last_name: true }
        },
        recurring_expenses: true
      }
    });
  },

  /**
   * Create a new expense
   */
  async create(expenseData) {
    return prisma.expense.create({
      data: {
        ...expenseData,
        vendor_id: expenseData.vendor_id ? parseInt(expenseData.vendor_id) : null,
        category_id: expenseData.category_id ? parseInt(expenseData.category_id) : null,
        project_id: expenseData.project_id ? parseInt(expenseData.project_id) : null,
        created_by: parseInt(expenseData.created_by),
        amount: parseFloat(expenseData.amount),
        tax_amount: parseFloat(expenseData.tax_amount || 0),
        expense_date: new Date(expenseData.expense_date + 'T00:00:00.000Z')
      },
      include: {
        category: true,
        vendor: true,
        project: true
      }
    });
  },

  /**
   * Update expense
   */
  async update(id, expenseData) {
    const updateData = { ...expenseData };
    
    // Handle numeric fields
    if (updateData.vendor_id !== undefined) {
      updateData.vendor_id = updateData.vendor_id ? parseInt(updateData.vendor_id) : null;
    }
    if (updateData.category_id !== undefined) {
      updateData.category_id = updateData.category_id ? parseInt(updateData.category_id) : null;
    }
    if (updateData.project_id !== undefined) {
      updateData.project_id = updateData.project_id ? parseInt(updateData.project_id) : null;
    }
    if (updateData.amount !== undefined) {
      updateData.amount = parseFloat(updateData.amount);
    }
    if (updateData.tax_amount !== undefined) {
      updateData.tax_amount = parseFloat(updateData.tax_amount || 0);
    }
    
    // Handle date field - ensure proper ISO format
    if (updateData.expense_date) {
      updateData.expense_date = new Date(updateData.expense_date + 'T00:00:00.000Z');
    }

    return prisma.expense.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: true,
        vendor: true,
        project: true
      }
    });
  },

  /**
   * Delete expense
   */
  async delete(id) {
    return prisma.expense.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Get expense categories
   */
  async getCategories() {
    return prisma.expenseCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { expenses: true }
        }
      }
    });
  },

  /**
   * Create expense category
   */
  async createCategory(categoryData) {
    return prisma.expenseCategory.create({
      data: {
        ...categoryData,
        created_by: parseInt(categoryData.created_by)
      }
    });
  },

  /**
   * Update expense category
   */
  async updateCategory(id, categoryData) {
    return prisma.expenseCategory.update({
      where: { id: parseInt(id) },
      data: categoryData
    });
  },

  /**
   * Delete expense category
   */
  async deleteCategory(id) {
    return prisma.expenseCategory.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Get vendors
   */
  async getVendors() {
    return prisma.vendor.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { expenses: true }
        }
      }
    });
  },

  /**
   * Create vendor
   */
  async createVendor(vendorData) {
    return prisma.vendor.create({
      data: {
        ...vendorData,
        created_by: parseInt(vendorData.created_by)
      }
    });
  },

  /**
   * Update vendor
   */
  async updateVendor(id, vendorData) {
    return prisma.vendor.update({
      where: { id: parseInt(id) },
      data: vendorData
    });
  },

  /**
   * Delete vendor
   */
  async deleteVendor(id) {
    return prisma.vendor.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Get expense summary by category
   */
  async getSummaryByCategory(startDate, endDate) {
    const result = await prisma.expense.groupBy({
      by: ['category_id'],
      where: {
        expense_date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    // Get category names
    const categoriesWithSummary = await Promise.all(
      result.map(async (item) => {
        const category = item.category_id 
          ? await prisma.expenseCategory.findUnique({
              where: { id: item.category_id },
              select: { name: true }
            })
          : { name: 'Uncategorized' };
        
        return {
          category: category?.name || 'Uncategorized',
          total: item._sum.amount || 0,
          count: item._count.id
        };
      })
    );

    return categoriesWithSummary.sort((a, b) => b.total - a.total);
  },

  /**
   * Get expense summary by month
   */
  async getSummaryByMonth(year) {
    const expenses = await prisma.expense.findMany({
      where: {
        expense_date: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`)
        }
      },
      select: {
        expense_date: true,
        amount: true
      }
    });

    // Group by month
    const monthlyData = {};
    expenses.forEach(expense => {
      const month = expense.expense_date.getMonth() + 1;
      if (!monthlyData[month]) {
        monthlyData[month] = 0;
      }
      monthlyData[month] += parseFloat(expense.amount);
    });

    // Convert to array format
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: monthlyData[i + 1] || 0
    }));
  },

  /**
   * Get expense statistics
   */
  async getStats() {
    const [total, pending, approved, rejected, paid, thisMonth] = await Promise.all([
      prisma.expense.count(),
      prisma.expense.count({ where: { status: 'pending' } }),
      prisma.expense.count({ where: { status: 'approved' } }),
      prisma.expense.count({ where: { status: 'rejected' } }),
      prisma.expense.count({ where: { status: 'paid' } }),
      prisma.expense.aggregate({
        where: {
          expense_date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { amount: true }
      })
    ]);

    const totalAmount = await prisma.expense.aggregate({
      _sum: { amount: true }
    });

    return {
      total,
      pending,
      approved,
      rejected,
      paid,
      totalAmount: totalAmount._sum.amount || 0,
      thisMonthAmount: thisMonth._sum.amount || 0
    };
  },

  /**
   * Get expenses by category
   */
  async getByCategory(categoryId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where: { category_id: parseInt(categoryId) },
        include: {
          category: true,
          vendor: true,
          project: true,
          creator: {
            select: { id: true, first_name: true, last_name: true }
          }
        },
        orderBy: { expense_date: 'desc' },
        skip,
        take: limit
      }),
      prisma.expense.count({ where: { category_id: parseInt(categoryId) } })
    ]);

    return {
      expenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get expenses by vendor
   */
  async getByVendor(vendorId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where: { vendor_id: parseInt(vendorId) },
        include: {
          category: true,
          vendor: true,
          project: true,
          creator: {
            select: { id: true, first_name: true, last_name: true }
          }
        },
        orderBy: { expense_date: 'desc' },
        skip,
        take: limit
      }),
      prisma.expense.count({ where: { vendor_id: parseInt(vendorId) } })
    ]);

    return {
      expenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get expenses by project
   */
  async getByProject(projectId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where: { project_id: parseInt(projectId) },
        include: {
          category: true,
          vendor: true,
          project: true,
          creator: {
            select: { id: true, first_name: true, last_name: true }
          }
        },
        orderBy: { expense_date: 'desc' },
        skip,
        take: limit
      }),
      prisma.expense.count({ where: { project_id: parseInt(projectId) } })
    ]);

    return {
      expenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Approve expense
   */
  async approve(id) {
    return prisma.expense.update({
      where: { id: parseInt(id) },
      data: { status: 'approved' },
      include: {
        category: true,
        vendor: true,
        project: true
      }
    });
  },

  /**
   * Reject expense
   */
  async reject(id, reason = '') {
    return prisma.expense.update({
      where: { id: parseInt(id) },
      data: { 
        status: 'rejected',
        notes: reason ? `Rejected: ${reason}` : 'Rejected'
      },
      include: {
        category: true,
        vendor: true,
        project: true
      }
    });
  },

  /**
   * Mark expense as paid
   */
  async markAsPaid(id) {
    return prisma.expense.update({
      where: { id: parseInt(id) },
      data: { status: 'paid' },
      include: {
        category: true,
        vendor: true,
        project: true
      }
    });
  },

  /**
   * Get recurring expenses
   */
  async getRecurringExpenses() {
    return prisma.recurringExpense.findMany({
      include: {
        expense: {
          include: {
            category: true,
            vendor: true,
            project: true
          }
        },
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      },
      orderBy: { next_date: 'asc' }
    });
  },

  /**
   * Create recurring expense
   */
  async createRecurringExpense(recurringData) {
    return prisma.recurringExpense.create({
      data: {
        ...recurringData,
        expense_id: parseInt(recurringData.expense_id),
        created_by: parseInt(recurringData.created_by),
        start_date: new Date(recurringData.start_date + 'T00:00:00.000Z'),
        end_date: recurringData.end_date ? new Date(recurringData.end_date + 'T00:00:00.000Z') : null,
        next_date: new Date(recurringData.next_date + 'T00:00:00.000Z')
      },
      include: {
        expense: {
          include: {
            category: true,
            vendor: true,
            project: true
          }
        }
      }
    });
  },

  /**
   * Get expense analytics
   */
  async getAnalytics(period = 'month') {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const [
      totalExpenses,
      expensesByCategory,
      expensesByStatus,
      expensesByVendor,
      expensesByProject,
      trendData
    ] = await Promise.all([
      prisma.expense.aggregate({
        where: {
          expense_date: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true },
        _count: true
      }),
      prisma.expense.groupBy({
        by: ['category_id'],
        where: {
          expense_date: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true },
        _count: true
      }),
      prisma.expense.groupBy({
        by: ['status'],
        where: {
          expense_date: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true },
        _count: true
      }),
      prisma.expense.groupBy({
        by: ['vendor_id'],
        where: {
          expense_date: { gte: startDate, lte: endDate },
          vendor_id: { not: null }
        },
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: 'desc' } },
        take: 10
      }),
      prisma.expense.groupBy({
        by: ['project_id'],
        where: {
          expense_date: { gte: startDate, lte: endDate },
          project_id: { not: null }
        },
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: 'desc' } },
        take: 10
      }),
      this.getSummaryByMonth(now.getFullYear())
    ]);

    return {
      period,
      dateRange: { startDate, endDate },
      summary: {
        totalAmount: totalExpenses._sum.amount || 0,
        totalCount: totalExpenses._count
      },
      byCategory: expensesByCategory,
      byStatus: expensesByStatus,
      byVendor: expensesByVendor,
      byProject: expensesByProject,
      trend: trendData
    };
  }
};

module.exports = expenseModel;