const prisma = require('../lib/prisma');

const reportsModel = {
  /**
   * Get all report templates
   */
  async getAllReportTemplates(page = 1, limit = 20, filters = {}) {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (filters.report_type) where.report_type = filters.report_type;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [templates, total] = await Promise.all([
      prisma.reportTemplate.findMany({
        where,
        include: {
          creator: {
            select: { id: true, first_name: true, last_name: true }
          },
          _count: {
            select: { saved_reports: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.reportTemplate.count({ where })
    ]);

    return {
      templates,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get report template by ID
   */
  async getReportTemplateById(id) {
    return prisma.reportTemplate.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true }
        },
        saved_reports: {
          include: {
            creator: {
              select: { id: true, first_name: true, last_name: true }
            }
          },
          orderBy: { created_at: 'desc' },
          take: 10
        }
      }
    });
  },

  /**
   * Create report template
   */
  async createReportTemplate(templateData) {
    return prisma.reportTemplate.create({
      data: {
        ...templateData,
        created_by: parseInt(templateData.created_by)
      },
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Update report template
   */
  async updateReportTemplate(id, templateData) {
    return prisma.reportTemplate.update({
      where: { id: parseInt(id) },
      data: templateData,
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Delete report template
   */
  async deleteReportTemplate(id) {
    // Check if template has saved reports
    const savedReportsCount = await prisma.savedReport.count({
      where: { template_id: parseInt(id) }
    });

    if (savedReportsCount > 0) {
      throw new Error('Cannot delete template with existing saved reports');
    }

    return prisma.reportTemplate.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Execute report template
   */
  async executeReportTemplate(templateId, parameters = {}, userId) {
    const template = await prisma.reportTemplate.findUnique({
      where: { id: parseInt(templateId) }
    });

    if (!template) {
      throw new Error('Report template not found');
    }

    let reportData = {};

    // Execute different report types
    switch (template.report_type) {
      case 'financial_summary':
        reportData = await this.generateFinancialSummary(parameters);
        break;
      case 'income_statement':
        reportData = await this.generateIncomeStatement(parameters);
        break;
      case 'balance_sheet':
        reportData = await this.generateBalanceSheet(parameters);
        break;
      case 'cash_flow':
        reportData = await this.generateCashFlowStatement(parameters);
        break;
      case 'accounts_receivable':
        reportData = await this.generateAccountsReceivableReport(parameters);
        break;
      case 'accounts_payable':
        reportData = await this.generateAccountsPayableReport(parameters);
        break;
      case 'expense_analysis':
        reportData = await this.generateExpenseAnalysis(parameters);
        break;
      case 'revenue_analysis':
        reportData = await this.generateRevenueAnalysis(parameters);
        break;
      case 'payroll_summary':
        reportData = await this.generatePayrollSummary(parameters);
        break;
      case 'tax_summary':
        reportData = await this.generateTaxSummary(parameters);
        break;
      case 'custom_query':
        reportData = await this.executeCustomQuery(template.query_template, parameters);
        break;
      default:
        throw new Error(`Unsupported report type: ${template.report_type}`);
    }

    return {
      template,
      data: reportData,
      parameters,
      generated_at: new Date(),
      generated_by: userId
    };
  },

  /**
   * Save report execution
   */
  async saveReportExecution(templateId, reportData, parameters, userId) {
    return prisma.savedReport.create({
      data: {
        template_id: parseInt(templateId),
        name: `${reportData.template.name} - ${new Date().toLocaleDateString()}`,
        parameters: parameters || {},
        result_data: reportData,
        created_by: parseInt(userId)
      },
      include: {
        template: true,
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Get saved reports
   */
  async getSavedReports(page = 1, limit = 20, filters = {}) {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (filters.template_id) where.template_id = parseInt(filters.template_id);
    if (filters.created_by) where.created_by = parseInt(filters.created_by);

    const [reports, total] = await Promise.all([
      prisma.savedReport.findMany({
        where,
        include: {
          template: true,
          creator: {
            select: { id: true, first_name: true, last_name: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.savedReport.count({ where })
    ]);

    return {
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get saved report by ID
   */
  async getSavedReportById(id) {
    return prisma.savedReport.findUnique({
      where: { id: parseInt(id) },
      include: {
        template: true,
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Delete saved report
   */
  async deleteSavedReport(id) {
    return prisma.savedReport.delete({
      where: { id: parseInt(id) }
    });
  },

  // Report Generation Methods

  /**
   * Generate Financial Summary Report
   */
  async generateFinancialSummary(parameters) {
    const { start_date, end_date } = parameters;
    
    const [revenue, expenses, assets, liabilities] = await Promise.all([
      // Total Revenue
      prisma.invoice.aggregate({
        where: {
          issue_date: {
            gte: start_date ? new Date(start_date) : undefined,
            lte: end_date ? new Date(end_date) : undefined
          },
          status: 'paid'
        },
        _sum: { total_amount: true }
      }),
      // Total Expenses
      prisma.expense.aggregate({
        where: {
          expense_date: {
            gte: start_date ? new Date(start_date) : undefined,
            lte: end_date ? new Date(end_date) : undefined
          }
        },
        _sum: { amount: true }
      }),
      // Total Assets (from bank accounts)
      prisma.bankAccount.aggregate({
        where: { is_active: true },
        _sum: { current_balance: true }
      }),
      // Total Liabilities (simplified - would need more complex calculation)
      prisma.expense.aggregate({
        where: {
          status: 'pending'
        },
        _sum: { amount: true }
      })
    ]);

    const totalRevenue = revenue._sum.total_amount || 0;
    const totalExpenses = expenses._sum.amount || 0;
    const netIncome = totalRevenue - totalExpenses;

    return {
      summary: {
        total_revenue: totalRevenue,
        total_expenses: totalExpenses,
        net_income: netIncome,
        total_assets: assets._sum.current_balance || 0,
        total_liabilities: liabilities._sum.amount || 0
      },
      period: {
        start_date,
        end_date
      }
    };
  },

  /**
   * Generate Income Statement
   */
  async generateIncomeStatement(parameters) {
    const { start_date, end_date } = parameters;
    
    // Get revenue by category
    const revenueData = await prisma.invoice.groupBy({
      by: ['status'],
      where: {
        issue_date: {
          gte: start_date ? new Date(start_date) : undefined,
          lte: end_date ? new Date(end_date) : undefined
        }
      },
      _sum: { total_amount: true }
    });

    // Get expenses by category
    const expenseData = await prisma.expense.groupBy({
      by: ['category_id'],
      where: {
        expense_date: {
          gte: start_date ? new Date(start_date) : undefined,
          lte: end_date ? new Date(end_date) : undefined
        }
      },
      _sum: { amount: true },
      _count: true
    });

    // Get expense categories
    const categories = await prisma.expenseCategory.findMany({
      where: {
        id: {
          in: expenseData.map(e => e.category_id).filter(Boolean)
        }
      }
    });

    const expensesByCategory = expenseData.map(expense => {
      const category = categories.find(c => c.id === expense.category_id);
      return {
        category: category?.name || 'Uncategorized',
        amount: expense._sum.amount || 0,
        count: expense._count
      };
    });

    const totalRevenue = revenueData.reduce((sum, r) => sum + (r._sum.total_amount || 0), 0);
    const totalExpenses = expenseData.reduce((sum, e) => sum + (e._sum.amount || 0), 0);

    return {
      revenue: {
        total: totalRevenue,
        breakdown: revenueData
      },
      expenses: {
        total: totalExpenses,
        by_category: expensesByCategory
      },
      net_income: totalRevenue - totalExpenses,
      period: { start_date, end_date }
    };
  },

  /**
   * Generate Balance Sheet
   */
  async generateBalanceSheet(parameters) {
    const { as_of_date } = parameters;
    
    // Get accounts by type
    const accounts = await prisma.account.findMany({
      where: { is_active: true },
      include: {
        type: true,
        ledger_entries: {
          where: {
            journal_entry: {
              is_posted: true,
              date: as_of_date ? { lte: new Date(as_of_date) } : undefined
            }
          }
        }
      }
    });

    const balanceSheet = {
      assets: { current: [], fixed: [], total: 0 },
      liabilities: { current: [], long_term: [], total: 0 },
      equity: { items: [], total: 0 }
    };

    accounts.forEach(account => {
      const balance = account.ledger_entries.reduce((sum, entry) => {
        return sum + parseFloat(entry.debit) - parseFloat(entry.credit);
      }, 0);

      const accountData = {
        id: account.id,
        name: account.name,
        account_number: account.account_number,
        balance: Math.abs(balance)
      };

      switch (account.type.name) {
        case 'Asset':
          if (account.account_number.startsWith('1000')) {
            balanceSheet.assets.current.push(accountData);
          } else {
            balanceSheet.assets.fixed.push(accountData);
          }
          balanceSheet.assets.total += accountData.balance;
          break;
        case 'Liability':
          if (account.account_number.startsWith('2000')) {
            balanceSheet.liabilities.current.push(accountData);
          } else {
            balanceSheet.liabilities.long_term.push(accountData);
          }
          balanceSheet.liabilities.total += accountData.balance;
          break;
        case 'Equity':
          balanceSheet.equity.items.push(accountData);
          balanceSheet.equity.total += accountData.balance;
          break;
      }
    });

    return {
      ...balanceSheet,
      as_of_date,
      total_assets: balanceSheet.assets.total,
      total_liabilities_equity: balanceSheet.liabilities.total + balanceSheet.equity.total
    };
  },

  /**
   * Generate Cash Flow Statement
   */
  async generateCashFlowStatement(parameters) {
    const { start_date, end_date } = parameters;
    
    // Operating Activities
    const operatingCashFlow = await prisma.bankTransaction.aggregate({
      where: {
        transaction_date: {
          gte: start_date ? new Date(start_date) : undefined,
          lte: end_date ? new Date(end_date) : undefined
        },
        transaction_type: { in: ['deposit', 'withdrawal'] }
      },
      _sum: { amount: true }
    });

    // Get detailed transactions
    const transactions = await prisma.bankTransaction.findMany({
      where: {
        transaction_date: {
          gte: start_date ? new Date(start_date) : undefined,
          lte: end_date ? new Date(end_date) : undefined
        }
      },
      include: {
        bank_account: {
          select: { account_name: true }
        }
      },
      orderBy: { transaction_date: 'desc' }
    });

    const cashInflows = transactions
      .filter(t => t.transaction_type === 'deposit')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const cashOutflows = transactions
      .filter(t => t.transaction_type === 'withdrawal')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      operating_activities: {
        cash_inflows: cashInflows,
        cash_outflows: cashOutflows,
        net_operating_cash_flow: cashInflows - cashOutflows
      },
      investing_activities: {
        // Would need more detailed categorization
        net_investing_cash_flow: 0
      },
      financing_activities: {
        // Would need more detailed categorization
        net_financing_cash_flow: 0
      },
      net_change_in_cash: cashInflows - cashOutflows,
      period: { start_date, end_date },
      transactions: transactions.slice(0, 50) // Limit for performance
    };
  },

  /**
   * Generate Accounts Receivable Report
   */
  async generateAccountsReceivableReport(parameters) {
    const { as_of_date } = parameters;
    
    const invoices = await prisma.invoice.findMany({
      where: {
        status: { in: ['sent', 'overdue'] },
        due_date: as_of_date ? { lte: new Date(as_of_date) } : undefined
      },
      include: {
        client: {
          select: { id: true, name: true, email: true }
        },
        payments: true
      },
      orderBy: { due_date: 'asc' }
    });

    const receivables = invoices.map(invoice => {
      const totalPaid = invoice.payments.reduce((sum, payment) => 
        sum + parseFloat(payment.amount), 0
      );
      const balance = parseFloat(invoice.total_amount) - totalPaid;
      const daysOverdue = as_of_date ? 
        Math.max(0, Math.floor((new Date(as_of_date) - new Date(invoice.due_date)) / (1000 * 60 * 60 * 24))) : 0;

      return {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        client: invoice.client,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        total_amount: parseFloat(invoice.total_amount),
        amount_paid: totalPaid,
        balance_due: balance,
        days_overdue: daysOverdue,
        status: invoice.status
      };
    });

    const totalReceivables = receivables.reduce((sum, r) => sum + r.balance_due, 0);
    const overdueReceivables = receivables.filter(r => r.days_overdue > 0);
    const totalOverdue = overdueReceivables.reduce((sum, r) => sum + r.balance_due, 0);

    return {
      summary: {
        total_receivables: totalReceivables,
        total_overdue: totalOverdue,
        overdue_count: overdueReceivables.length,
        current_count: receivables.length - overdueReceivables.length
      },
      receivables,
      aging: {
        current: receivables.filter(r => r.days_overdue === 0).reduce((sum, r) => sum + r.balance_due, 0),
        days_1_30: receivables.filter(r => r.days_overdue >= 1 && r.days_overdue <= 30).reduce((sum, r) => sum + r.balance_due, 0),
        days_31_60: receivables.filter(r => r.days_overdue >= 31 && r.days_overdue <= 60).reduce((sum, r) => sum + r.balance_due, 0),
        days_61_90: receivables.filter(r => r.days_overdue >= 61 && r.days_overdue <= 90).reduce((sum, r) => sum + r.balance_due, 0),
        over_90_days: receivables.filter(r => r.days_overdue > 90).reduce((sum, r) => sum + r.balance_due, 0)
      },
      as_of_date
    };
  },

  /**
   * Generate Expense Analysis Report
   */
  async generateExpenseAnalysis(parameters) {
    const { start_date, end_date, category_id } = parameters;
    
    const where = {
      expense_date: {
        gte: start_date ? new Date(start_date) : undefined,
        lte: end_date ? new Date(end_date) : undefined
      }
    };

    if (category_id) {
      where.category_id = parseInt(category_id);
    }

    const [expenses, categoryBreakdown, monthlyTrend] = await Promise.all([
      // Detailed expenses
      prisma.expense.findMany({
        where,
        include: {
          category: true,
          vendor: true,
          project: true
        },
        orderBy: { expense_date: 'desc' }
      }),
      // Category breakdown
      prisma.expense.groupBy({
        by: ['category_id'],
        where,
        _sum: { amount: true },
        _count: true
      }),
      // Monthly trend
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', expense_date) as month,
          SUM(amount) as total_amount,
          COUNT(*) as transaction_count
        FROM expenses 
        WHERE expense_date >= ${start_date ? new Date(start_date) : new Date(new Date().getFullYear(), 0, 1)}
          AND expense_date <= ${end_date ? new Date(end_date) : new Date()}
        GROUP BY DATE_TRUNC('month', expense_date)
        ORDER BY month
      `
    ]);

    // Get category names
    const categories = await prisma.expenseCategory.findMany();
    const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

    const categoryAnalysis = categoryBreakdown.map(item => ({
      category: categoryMap[item.category_id] || 'Uncategorized',
      total_amount: item._sum.amount || 0,
      transaction_count: item._count,
      percentage: ((item._sum.amount || 0) / expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)) * 100
    }));

    return {
      summary: {
        total_expenses: expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0),
        transaction_count: expenses.length,
        average_expense: expenses.length > 0 ? expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0) / expenses.length : 0
      },
      category_analysis: categoryAnalysis,
      monthly_trend: monthlyTrend,
      detailed_expenses: expenses.slice(0, 100), // Limit for performance
      period: { start_date, end_date }
    };
  },

  /**
   * Execute custom query (with safety restrictions)
   */
  async executeCustomQuery(queryTemplate, parameters) {
    // This is a simplified version - in production, you'd want more security
    // Only allow SELECT queries and parameterized queries
    if (!queryTemplate.toLowerCase().trim().startsWith('select')) {
      throw new Error('Only SELECT queries are allowed');
    }

    try {
      // Replace parameters in query template
      let query = queryTemplate;
      Object.entries(parameters).forEach(([key, value]) => {
        query = query.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });

      const result = await prisma.$queryRawUnsafe(query);
      return {
        query,
        result,
        row_count: result.length
      };
    } catch (error) {
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }
};

module.exports = reportsModel;