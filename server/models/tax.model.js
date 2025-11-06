const prisma = require('../lib/prisma');

const taxModel = {
  /**
   * Get all tax rates
   */
  async getAllTaxRates(page = 1, limit = 20, filters = {}) {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (filters.type) where.type = filters.type;
    if (filters.is_active !== undefined) where.is_active = filters.is_active;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { type: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [taxRates, total] = await Promise.all([
      prisma.taxRate.findMany({
        where,
        include: {
          creator: {
            select: { id: true, first_name: true, last_name: true }
          },
          _count: {
            select: { tax_records: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.taxRate.count({ where })
    ]);

    return {
      taxRates,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get tax rate by ID
   */
  async getTaxRateById(id) {
    return prisma.taxRate.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true }
        },
        tax_records: {
          take: 10,
          orderBy: { created_at: 'desc' }
        }
      }
    });
  },

  /**
   * Create tax rate
   */
  async createTaxRate(taxRateData) {
    return prisma.taxRate.create({
      data: taxRateData,
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Update tax rate
   */
  async updateTaxRate(id, taxRateData) {
    return prisma.taxRate.update({
      where: { id: parseInt(id) },
      data: taxRateData,
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Delete tax rate
   */
  async deleteTaxRate(id) {
    return prisma.taxRate.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Get tax records with filters
   */
  async getTaxRecords(page = 1, limit = 20, filters = {}) {
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

    const [taxRecords, total] = await Promise.all([
      prisma.taxRecord.findMany({
        where,
        include: {
          tax_rate: true
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      prisma.taxRecord.count({ where })
    ]);

    return {
      taxRecords,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Create tax record
   */
  async createTaxRecord(taxRecordData) {
    return prisma.taxRecord.create({
      data: taxRecordData,
      include: {
        tax_rate: true
      }
    });
  },

  /**
   * Get tax summary report
   */
  async getTaxSummaryReport(filters = {}) {
    const where = {};
    if (filters.start_date && filters.end_date) {
      where.date = {
        gte: new Date(filters.start_date),
        lte: new Date(filters.end_date)
      };
    }
    if (filters.transaction_type) {
      where.transaction_type = filters.transaction_type;
    }

    // Get tax summary by tax rate
    const taxSummary = await prisma.taxRecord.groupBy({
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
    const taxRateIds = taxSummary.map(item => item.tax_rate_id);
    const taxRates = await prisma.taxRate.findMany({
      where: { id: { in: taxRateIds } }
    });

    // Combine data
    const result = taxSummary.map(item => {
      const taxRate = taxRates.find(rate => rate.id === item.tax_rate_id);
      return {
        tax_rate: taxRate,
        total_amount: item._sum.amount || 0,
        total_tax: item._sum.tax_amount || 0,
        transaction_count: item._count.id
      };
    });

    return result;
  },

  /**
   * Get tax collection report by period
   */
  async getTaxCollectionReport(filters = {}) {
    const { start_date, end_date, group_by = 'month' } = filters;
    
    let dateFormat;
    switch (group_by) {
      case 'day':
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        dateFormat = 'YYYY-"W"WW';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        break;
      case 'quarter':
        dateFormat = 'YYYY-"Q"Q';
        break;
      case 'year':
        dateFormat = 'YYYY';
        break;
      default:
        dateFormat = 'YYYY-MM';
    }

    const query = `
      SELECT 
        TO_CHAR(date, '${dateFormat}') as period,
        transaction_type,
        SUM(amount) as total_amount,
        SUM(tax_amount) as total_tax,
        COUNT(*) as transaction_count
      FROM tax_records 
      WHERE date >= $1 AND date <= $2
      GROUP BY TO_CHAR(date, '${dateFormat}'), transaction_type
      ORDER BY period DESC, transaction_type
    `;

    const result = await prisma.$queryRawUnsafe(query, 
      new Date(start_date), 
      new Date(end_date)
    );

    return result;
  },

  /**
   * Get tax liability report
   */
  async getTaxLiabilityReport(filters = {}) {
    const where = {};
    if (filters.start_date && filters.end_date) {
      where.date = {
        gte: new Date(filters.start_date),
        lte: new Date(filters.end_date)
      };
    }

    // Get tax collected (from invoices)
    const taxCollected = await prisma.taxRecord.aggregate({
      where: {
        ...where,
        transaction_type: 'invoice'
      },
      _sum: {
        tax_amount: true
      }
    });

    // Get tax paid (from expenses)
    const taxPaid = await prisma.taxRecord.aggregate({
      where: {
        ...where,
        transaction_type: 'expense'
      },
      _sum: {
        tax_amount: true
      }
    });

    // Get payroll tax
    const payrollTax = await prisma.taxRecord.aggregate({
      where: {
        ...where,
        transaction_type: 'payroll'
      },
      _sum: {
        tax_amount: true
      }
    });

    return {
      tax_collected: taxCollected._sum.tax_amount || 0,
      tax_paid: taxPaid._sum.tax_amount || 0,
      payroll_tax: payrollTax._sum.tax_amount || 0,
      net_tax_liability: (taxCollected._sum.tax_amount || 0) - (taxPaid._sum.tax_amount || 0)
    };
  },

  /**
   * Get tax compliance report
   */
  async getTaxComplianceReport(filters = {}) {
    const { start_date, end_date } = filters;
    
    // Get monthly tax summary for compliance tracking
    const monthlyTax = await prisma.$queryRawUnsafe(`
      SELECT 
        TO_CHAR(date, 'YYYY-MM') as month,
        transaction_type,
        tr.tax_rate_id,
        t.name as tax_name,
        t.type as tax_type,
        t.rate as tax_rate,
        SUM(tr.amount) as total_amount,
        SUM(tr.tax_amount) as total_tax,
        COUNT(*) as transaction_count
      FROM tax_records tr
      JOIN tax_rates t ON tr.tax_rate_id = t.id
      WHERE tr.date >= $1 AND tr.date <= $2
      GROUP BY TO_CHAR(date, 'YYYY-MM'), transaction_type, tr.tax_rate_id, t.name, t.type, t.rate
      ORDER BY month DESC, tax_type, transaction_type
    `, new Date(start_date), new Date(end_date));

    return monthlyTax;
  }
};

module.exports = taxModel;