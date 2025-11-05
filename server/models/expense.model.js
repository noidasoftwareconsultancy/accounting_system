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
        tax_amount: parseFloat(expenseData.tax_amount || 0)
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
    return prisma.expense.update({
      where: { id: parseInt(id) },
      data: {
        ...expenseData,
        vendor_id: expenseData.vendor_id ? parseInt(expenseData.vendor_id) : undefined,
        category_id: expenseData.category_id ? parseInt(expenseData.category_id) : undefined,
        project_id: expenseData.project_id ? parseInt(expenseData.project_id) : undefined,
        amount: expenseData.amount ? parseFloat(expenseData.amount) : undefined,
        tax_amount: expenseData.tax_amount ? parseFloat(expenseData.tax_amount) : undefined
      },
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
    const [total, pending, approved, thisMonth] = await Promise.all([
      prisma.expense.count(),
      prisma.expense.count({ where: { status: 'pending' } }),
      prisma.expense.count({ where: { status: 'approved' } }),
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
      totalAmount: totalAmount._sum.amount || 0,
      thisMonthAmount: thisMonth._sum.amount || 0
    };
  }
};

module.exports = expenseModel;