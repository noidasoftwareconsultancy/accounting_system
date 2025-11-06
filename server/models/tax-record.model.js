const prisma = require('../lib/prisma');

const taxRecordModel = {
  /**
   * Get all tax records with pagination and filters
   */
  async getAll(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    if (filters.tax_rate_id) where.tax_rate_id = parseInt(filters.tax_rate_id);
    if (filters.transaction_type) where.transaction_type = filters.transaction_type;
    if (filters.start_date && filters.end_date) {
      where.date = {
        gte: new Date(filters.start_date),
        lte: new Date(filters.end_date)
      };
    }

    const [records, total] = await Promise.all([
      prisma.taxRecord.findMany({
        where,
        include: {
          tax_rate: {
            select: { id: true, name: true, rate: true, type: true }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      prisma.taxRecord.count({ where })
    ]);

    return {
      records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get tax record by ID
   */
  async getById(id) {
    return prisma.taxRecord.findUnique({
      where: { id: parseInt(id) },
      include: {
        tax_rate: true
      }
    });
  },

  /**
   * Create new tax record
   */
  async create(data) {
    return prisma.taxRecord.create({
      data: {
        tax_rate_id: parseInt(data.tax_rate_id),
        transaction_type: data.transaction_type,
        transaction_id: parseInt(data.transaction_id),
        amount: parseFloat(data.amount),
        tax_amount: parseFloat(data.tax_amount),
        date: new Date(data.date)
      },
      include: {
        tax_rate: true
      }
    });
  },

  /**
   * Update tax record
   */
  async update(id, data) {
    const updateData = {};
    
    if (data.tax_rate_id !== undefined) updateData.tax_rate_id = parseInt(data.tax_rate_id);
    if (data.transaction_type !== undefined) updateData.transaction_type = data.transaction_type;
    if (data.transaction_id !== undefined) updateData.transaction_id = parseInt(data.transaction_id);
    if (data.amount !== undefined) updateData.amount = parseFloat(data.amount);
    if (data.tax_amount !== undefined) updateData.tax_amount = parseFloat(data.tax_amount);
    if (data.date !== undefined) updateData.date = new Date(data.date);

    return prisma.taxRecord.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        tax_rate: true
      }
    });
  },

  /**
   * Delete tax record
   */
  async delete(id) {
    return prisma.taxRecord.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Get tax summary by period
   */
  async getTaxSummary(startDate, endDate, groupBy = 'tax_rate') {
    const where = {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    if (groupBy === 'tax_rate') {
      const summary = await prisma.taxRecord.groupBy({
        by: ['tax_rate_id'],
        where,
        _sum: {
          amount: true,
          tax_amount: true
        },
        _count: {
          id: true
        }
      });

      // Get tax rate details
      const summaryWithDetails = await Promise.all(
        summary.map(async (item) => {
          const taxRate = await prisma.taxRate.findUnique({
            where: { id: item.tax_rate_id }
          });
          return {
            ...item,
            tax_rate: taxRate
          };
        })
      );

      return summaryWithDetails;
    } else if (groupBy === 'transaction_type') {
      return prisma.taxRecord.groupBy({
        by: ['transaction_type'],
        where,
        _sum: {
          amount: true,
          tax_amount: true
        },
        _count: {
          id: true
        }
      });
    } else if (groupBy === 'month') {
      // Group by month
      const records = await prisma.taxRecord.findMany({
        where,
        select: {
          date: true,
          amount: true,
          tax_amount: true
        }
      });

      const monthlyData = {};
      records.forEach(record => {
        const monthKey = record.date.toISOString().substring(0, 7); // YYYY-MM
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            totalAmount: 0,
            totalTax: 0,
            count: 0
          };
        }
        monthlyData[monthKey].totalAmount += parseFloat(record.amount);
        monthlyData[monthKey].totalTax += parseFloat(record.tax_amount);
        monthlyData[monthKey].count += 1;
      });

      return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    }
  },

  /**
   * Get tax records by transaction
   */
  async getByTransaction(transactionType, transactionId) {
    return prisma.taxRecord.findMany({
      where: {
        transaction_type: transactionType,
        transaction_id: parseInt(transactionId)
      },
      include: {
        tax_rate: true
      },
      orderBy: { date: 'desc' }
    });
  },

  /**
   * Get tax liability report
   */
  async getTaxLiabilityReport(startDate, endDate) {
    const records = await prisma.taxRecord.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        tax_rate: true
      }
    });

    // Group by tax type and calculate liability
    const liability = {};
    records.forEach(record => {
      const taxType = record.tax_rate.type;
      if (!liability[taxType]) {
        liability[taxType] = {
          type: taxType,
          totalTaxableAmount: 0,
          totalTaxAmount: 0,
          records: []
        };
      }
      liability[taxType].totalTaxableAmount += parseFloat(record.amount);
      liability[taxType].totalTaxAmount += parseFloat(record.tax_amount);
      liability[taxType].records.push(record);
    });

    return {
      period: { startDate, endDate },
      liability: Object.values(liability),
      totals: {
        totalTaxableAmount: records.reduce((sum, r) => sum + parseFloat(r.amount), 0),
        totalTaxAmount: records.reduce((sum, r) => sum + parseFloat(r.tax_amount), 0)
      }
    };
  },

  /**
   * Get tax statistics
   */
  async getStats() {
    const [totalRecords, currentMonthRecords, totalTaxCollected] = await Promise.all([
      prisma.taxRecord.count(),
      prisma.taxRecord.count({
        where: {
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.taxRecord.aggregate({
        _sum: { tax_amount: true }
      })
    ]);

    const taxByType = await prisma.taxRecord.groupBy({
      by: ['transaction_type'],
      _sum: {
        amount: true,
        tax_amount: true
      },
      _count: {
        id: true
      }
    });

    return {
      totalRecords,
      currentMonthRecords,
      totalTaxCollected: totalTaxCollected._sum.tax_amount || 0,
      byTransactionType: taxByType
    };
  }
};

module.exports = taxRecordModel;