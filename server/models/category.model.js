const prisma = require('../lib/prisma');

const categoryModel = {
  /**
   * Get all expense categories
   */
  async getAll() {
    return prisma.expenseCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { expenses: true }
        },
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Get category by ID
   */
  async getById(id) {
    return prisma.expenseCategory.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { expenses: true }
        },
        creator: {
          select: { id: true, first_name: true, last_name: true }
        },
        expenses: {
          take: 10,
          orderBy: { expense_date: 'desc' },
          include: {
            vendor: {
              select: { id: true, name: true }
            },
            project: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });
  },

  /**
   * Create expense category
   */
  async create(categoryData) {
    return prisma.expenseCategory.create({
      data: {
        ...categoryData,
        created_by: parseInt(categoryData.created_by)
      },
      include: {
        _count: {
          select: { expenses: true }
        },
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Update expense category
   */
  async update(id, categoryData) {
    return prisma.expenseCategory.update({
      where: { id: parseInt(id) },
      data: categoryData,
      include: {
        _count: {
          select: { expenses: true }
        },
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Delete expense category
   */
  async delete(id) {
    // First check if category has expenses
    const categoryWithExpenses = await prisma.expenseCategory.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { expenses: true }
        }
      }
    });

    if (categoryWithExpenses && categoryWithExpenses._count.expenses > 0) {
      throw new Error('Cannot delete category with existing expenses. Please reassign or delete expenses first.');
    }

    return prisma.expenseCategory.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Get category statistics
   */
  async getStats() {
    const [total, withExpenses, totalExpenses, totalAmount] = await Promise.all([
      prisma.expenseCategory.count(),
      prisma.expenseCategory.count({
        where: {
          expenses: {
            some: {}
          }
        }
      }),
      prisma.expense.count({
        where: {
          category_id: { not: null }
        }
      }),
      prisma.expense.aggregate({
        where: {
          category_id: { not: null }
        },
        _sum: { amount: true }
      })
    ]);

    return {
      total,
      withExpenses,
      totalExpenses,
      totalAmount: totalAmount._sum.amount || 0
    };
  },

  /**
   * Get category expense summary
   */
  async getExpenseSummary(id, startDate, endDate) {
    const where = {
      category_id: parseInt(id)
    };

    if (startDate && endDate) {
      where.expense_date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const [expenses, summary] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          vendor: {
            select: { id: true, name: true }
          },
          project: {
            select: { id: true, name: true }
          }
        },
        orderBy: { expense_date: 'desc' },
        take: 20
      }),
      prisma.expense.aggregate({
        where,
        _sum: { amount: true, tax_amount: true },
        _count: true,
        _avg: { amount: true }
      })
    ]);

    return {
      expenses,
      summary: {
        totalAmount: summary._sum.amount || 0,
        totalTax: summary._sum.tax_amount || 0,
        count: summary._count,
        averageAmount: summary._avg.amount || 0
      }
    };
  },

  /**
   * Get categories with expense trends
   */
  async getCategoriesWithTrends(period = 'month') {
    const categories = await this.getAll();
    
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

    const categoriesWithTrends = await Promise.all(
      categories.map(async (category) => {
        const currentPeriod = await prisma.expense.aggregate({
          where: {
            category_id: category.id,
            expense_date: { gte: startDate, lte: endDate }
          },
          _sum: { amount: true },
          _count: true
        });

        // Previous period for comparison
        const previousStartDate = new Date(startDate);
        const previousEndDate = new Date(endDate);
        const periodDiff = endDate.getTime() - startDate.getTime();
        previousStartDate.setTime(startDate.getTime() - periodDiff);
        previousEndDate.setTime(endDate.getTime() - periodDiff);

        const previousPeriod = await prisma.expense.aggregate({
          where: {
            category_id: category.id,
            expense_date: { gte: previousStartDate, lte: previousEndDate }
          },
          _sum: { amount: true },
          _count: true
        });

        const currentAmount = currentPeriod._sum.amount || 0;
        const previousAmount = previousPeriod._sum.amount || 0;
        const trend = previousAmount > 0 
          ? ((currentAmount - previousAmount) / previousAmount) * 100 
          : currentAmount > 0 ? 100 : 0;

        return {
          ...category,
          currentPeriod: {
            amount: currentAmount,
            count: currentPeriod._count
          },
          previousPeriod: {
            amount: previousAmount,
            count: previousPeriod._count
          },
          trend: Math.round(trend * 100) / 100
        };
      })
    );

    return categoriesWithTrends.sort((a, b) => b.currentPeriod.amount - a.currentPeriod.amount);
  },

  /**
   * Search categories
   */
  async search(query) {
    return prisma.expenseCategory.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        _count: {
          select: { expenses: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }
};

module.exports = categoryModel;