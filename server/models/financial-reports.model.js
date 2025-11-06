const prisma = require('../lib/prisma');

const financialReportsModel = {
  /**
   * Get Revenue Summary Report
   */
  async getRevenueSummary(filters = {}) {
    const { start_date, end_date, client_id, project_id } = filters;
    
    const where = {};
    if (start_date && end_date) {
      where.issue_date = {
        gte: new Date(start_date),
        lte: new Date(end_date)
      };
    }
    if (client_id) where.client_id = parseInt(client_id);
    if (project_id) where.project_id = parseInt(project_id);

    const [invoices, payments] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          client: { select: { name: true } },
          project: { select: { name: true } },
          items: true
        }
      }),
      prisma.payment.findMany({
        where: {
          invoice: where
        },
        include: {
          invoice: {
            include: {
              client: { select: { name: true } }
            }
          }
        }
      })
    ]);

    const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);
    const totalPaid = payments.reduce((sum, pay) => sum + parseFloat(pay.amount), 0);
    const totalOutstanding = totalRevenue - totalPaid;

    return {
      summary: {
        total_revenue: totalRevenue,
        total_paid: totalPaid,
        total_outstanding: totalOutstanding,
        invoice_count: invoices.length,
        payment_count: payments.length
      },
      invoices,
      payments
    };
  },

  /**
   * Get Expense Summary Report
   */
  async getExpenseSummary(filters = {}) {
    const { start_date, end_date, category_id, vendor_id } = filters;
    
    const where = {};
    if (start_date && end_date) {
      where.expense_date = {
        gte: new Date(start_date),
        lte: new Date(end_date)
      };
    }
    if (category_id) where.category_id = parseInt(category_id);
    if (vendor_id) where.vendor_id = parseInt(vendor_id);

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        vendor: { select: { name: true } },
        category: { select: { name: true } },
        project: { select: { name: true } }
      }
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const totalTax = expenses.reduce((sum, exp) => sum + parseFloat(exp.tax_amount), 0);

    // Group by category
    const byCategory = expenses.reduce((acc, exp) => {
      const category = exp.category?.name || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { amount: 0, count: 0 };
      }
      acc[category].amount += parseFloat(exp.amount);
      acc[category].count += 1;
      return acc;
    }, {});

    return {
      summary: {
        total_expenses: totalExpenses,
        total_tax: totalTax,
        expense_count: expenses.length
      },
      expenses,
      by_category: Object.entries(byCategory).map(([name, data]) => ({
        category: name,
        ...data
      }))
    };
  },

  /**
   * Get Profit & Loss Report
   */
  async getProfitLossReport(filters = {}) {
    const { start_date, end_date } = filters;
    
    const [revenueData, expenseData] = await Promise.all([
      this.getRevenueSummary(filters),
      this.getExpenseSummary(filters)
    ]);

    const revenue = revenueData.summary.total_revenue;
    const expenses = expenseData.summary.total_expenses;
    const grossProfit = revenue - expenses;
    const netProfit = grossProfit; // Simplified - could include other adjustments

    return {
      period: { start_date, end_date },
      revenue: {
        total_revenue: revenue,
        invoice_count: revenueData.summary.invoice_count
      },
      expenses: {
        total_expenses: expenses,
        expense_count: expenseData.summary.expense_count,
        by_category: expenseData.by_category
      },
      profit: {
        gross_profit: grossProfit,
        net_profit: netProfit,
        profit_margin: revenue > 0 ? (netProfit / revenue) * 100 : 0
      }
    };
  },

  /**
   * Get Cash Flow Report
   */
  async getCashFlowReport(filters = {}) {
    const { start_date, end_date } = filters;
    
    const where = {};
    if (start_date && end_date) {
      where.created_at = {
        gte: new Date(start_date),
        lte: new Date(end_date)
      };
    }

    const [payments, expenses, bankTransactions] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          payment_date: where.created_at
        },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: {
          expense_date: where.created_at
        },
        _sum: { amount: true }
      }),
      prisma.bankTransaction.findMany({
        where: {
          transaction_date: where.created_at
        },
        include: {
          bank_account: { select: { account_name: true } }
        }
      })
    ]);

    const cashInflows = payments._sum.amount || 0;
    const cashOutflows = expenses._sum.amount || 0;
    const netCashFlow = parseFloat(cashInflows) - parseFloat(cashOutflows);

    return {
      period: { start_date, end_date },
      cash_inflows: parseFloat(cashInflows),
      cash_outflows: parseFloat(cashOutflows),
      net_cash_flow: netCashFlow,
      bank_transactions: bankTransactions
    };
  },

  /**
   * Get Client Performance Report
   */
  async getClientPerformanceReport(filters = {}) {
    const { start_date, end_date } = filters;
    
    const clients = await prisma.client.findMany({
      include: {
        invoices: {
          where: start_date && end_date ? {
            issue_date: {
              gte: new Date(start_date),
              lte: new Date(end_date)
            }
          } : undefined,
          include: {
            payments: true
          }
        },
        projects: {
          include: {
            _count: {
              select: { invoices: true }
            }
          }
        }
      }
    });

    const clientPerformance = clients.map(client => {
      const totalRevenue = client.invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);
      const totalPaid = client.invoices.reduce((sum, inv) => {
        return sum + inv.payments.reduce((paySum, pay) => paySum + parseFloat(pay.amount), 0);
      }, 0);
      const totalOutstanding = totalRevenue - totalPaid;

      return {
        client_id: client.id,
        client_name: client.name,
        total_revenue: totalRevenue,
        total_paid: totalPaid,
        total_outstanding: totalOutstanding,
        invoice_count: client.invoices.length,
        project_count: client.projects.length
      };
    });

    return clientPerformance.sort((a, b) => b.total_revenue - a.total_revenue);
  },

  /**
   * Get Monthly Trends Report
   */
  async getMonthlyTrendsReport(filters = {}) {
    const { year = new Date().getFullYear() } = filters;
    
    const monthlyData = await prisma.$queryRawUnsafe(`
      SELECT 
        EXTRACT(MONTH FROM issue_date) as month,
        COUNT(*) as invoice_count,
        SUM(total_amount) as total_revenue,
        SUM(tax_amount) as total_tax
      FROM invoices 
      WHERE EXTRACT(YEAR FROM issue_date) = $1
      GROUP BY EXTRACT(MONTH FROM issue_date)
      ORDER BY month
    `, parseInt(year));

    const monthlyExpenses = await prisma.$queryRawUnsafe(`
      SELECT 
        EXTRACT(MONTH FROM expense_date) as month,
        COUNT(*) as expense_count,
        SUM(amount) as total_expenses
      FROM expenses 
      WHERE EXTRACT(YEAR FROM expense_date) = $1
      GROUP BY EXTRACT(MONTH FROM expense_date)
      ORDER BY month
    `, parseInt(year));

    // Merge revenue and expense data
    const trends = [];
    for (let month = 1; month <= 12; month++) {
      const revenueData = monthlyData.find(d => parseInt(d.month) === month) || {};
      const expenseData = monthlyExpenses.find(d => parseInt(d.month) === month) || {};
      
      const revenue = parseFloat(revenueData.total_revenue || 0);
      const expenses = parseFloat(expenseData.total_expenses || 0);
      
      trends.push({
        month,
        month_name: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
        revenue,
        expenses,
        profit: revenue - expenses,
        invoice_count: parseInt(revenueData.invoice_count || 0),
        expense_count: parseInt(expenseData.expense_count || 0)
      });
    }

    return trends;
  }
};

module.exports = financialReportsModel;