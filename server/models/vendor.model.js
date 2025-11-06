const prisma = require('../lib/prisma');

const vendorModel = {
  /**
   * Get all vendors
   */
  async getAll() {
    return prisma.vendor.findMany({
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
   * Get vendor by ID
   */
  async getById(id) {
    return prisma.vendor.findUnique({
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
            category: {
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
   * Create vendor
   */
  async create(vendorData) {
    return prisma.vendor.create({
      data: {
        ...vendorData,
        created_by: parseInt(vendorData.created_by),
        payment_terms: parseInt(vendorData.payment_terms || 30)
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
   * Update vendor
   */
  async update(id, vendorData) {
    const updateData = { ...vendorData };
    if (updateData.payment_terms) {
      updateData.payment_terms = parseInt(updateData.payment_terms);
    }

    return prisma.vendor.update({
      where: { id: parseInt(id) },
      data: updateData,
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
   * Delete vendor
   */
  async delete(id) {
    // First check if vendor has expenses
    const vendorWithExpenses = await prisma.vendor.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { expenses: true }
        }
      }
    });

    if (vendorWithExpenses && vendorWithExpenses._count.expenses > 0) {
      throw new Error('Cannot delete vendor with existing expenses. Please reassign or delete expenses first.');
    }

    return prisma.vendor.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Get vendor statistics
   */
  async getStats() {
    const [total, withExpenses, totalExpenses, totalAmount] = await Promise.all([
      prisma.vendor.count(),
      prisma.vendor.count({
        where: {
          expenses: {
            some: {}
          }
        }
      }),
      prisma.expense.count({
        where: {
          vendor_id: { not: null }
        }
      }),
      prisma.expense.aggregate({
        where: {
          vendor_id: { not: null }
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
   * Get vendor expense summary
   */
  async getExpenseSummary(id, startDate, endDate) {
    const where = {
      vendor_id: parseInt(id)
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
          category: {
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
   * Get vendors with expense trends
   */
  async getVendorsWithTrends(period = 'month') {
    const vendors = await this.getAll();
    
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

    const vendorsWithTrends = await Promise.all(
      vendors.map(async (vendor) => {
        const currentPeriod = await prisma.expense.aggregate({
          where: {
            vendor_id: vendor.id,
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
            vendor_id: vendor.id,
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
          ...vendor,
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

    return vendorsWithTrends.sort((a, b) => b.currentPeriod.amount - a.currentPeriod.amount);
  },

  /**
   * Search vendors
   */
  async search(query) {
    return prisma.vendor.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
          { tax_id: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        _count: {
          select: { expenses: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  },

  /**
   * Get vendor payment analysis
   */
  async getPaymentAnalysis(id) {
    const vendor = await this.getById(id);
    if (!vendor) return null;

    const expenses = await prisma.expense.findMany({
      where: { vendor_id: parseInt(id) },
      select: {
        amount: true,
        expense_date: true,
        status: true,
        payment_method: true
      },
      orderBy: { expense_date: 'desc' }
    });

    const analysis = {
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0),
      statusBreakdown: {},
      paymentMethodBreakdown: {},
      monthlyTrend: {},
      averageAmount: 0,
      paymentTermsCompliance: 0
    };

    // Status breakdown
    expenses.forEach(expense => {
      analysis.statusBreakdown[expense.status] = (analysis.statusBreakdown[expense.status] || 0) + 1;
    });

    // Payment method breakdown
    expenses.forEach(expense => {
      if (expense.payment_method) {
        analysis.paymentMethodBreakdown[expense.payment_method] = 
          (analysis.paymentMethodBreakdown[expense.payment_method] || 0) + 1;
      }
    });

    // Monthly trend
    expenses.forEach(expense => {
      const monthKey = expense.expense_date.toISOString().substring(0, 7); // YYYY-MM
      if (!analysis.monthlyTrend[monthKey]) {
        analysis.monthlyTrend[monthKey] = { count: 0, amount: 0 };
      }
      analysis.monthlyTrend[monthKey].count++;
      analysis.monthlyTrend[monthKey].amount += parseFloat(expense.amount);
    });

    analysis.averageAmount = analysis.totalAmount / (analysis.totalExpenses || 1);

    return {
      vendor,
      analysis
    };
  }
};

module.exports = vendorModel;