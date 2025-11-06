const prisma = require('../lib/prisma');

const reportTemplateModel = {
  /**
   * Get all report templates with pagination
   */
  async getAll(page = 1, limit = 10, filters = {}) {
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
  async getById(id) {
    return prisma.reportTemplate.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true }
        },
        saved_reports: {
          orderBy: { created_at: 'desc' },
          take: 10,
          include: {
            creator: {
              select: { id: true, first_name: true, last_name: true }
            }
          }
        }
      }
    });
  },

  /**
   * Create new report template
   */
  async create(data) {
    return prisma.reportTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        report_type: data.report_type,
        query_template: data.query_template,
        parameters: data.parameters || {},
        created_by: parseInt(data.created_by)
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
  async update(id, data) {
    const updateData = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.report_type !== undefined) updateData.report_type = data.report_type;
    if (data.query_template !== undefined) updateData.query_template = data.query_template;
    if (data.parameters !== undefined) updateData.parameters = data.parameters;

    return prisma.reportTemplate.update({
      where: { id: parseInt(id) },
      data: updateData,
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
  async delete(id) {
    // Check if template has saved reports
    const savedReportsCount = await prisma.savedReport.count({
      where: { template_id: parseInt(id) }
    });

    if (savedReportsCount > 0) {
      throw new Error('Cannot delete template with saved reports. Delete saved reports first.');
    }

    return prisma.reportTemplate.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Get templates by type
   */
  async getByType(reportType) {
    return prisma.reportTemplate.findMany({
      where: { report_type: reportType },
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true }
        },
        _count: {
          select: { saved_reports: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  },

  /**
   * Execute report template
   */
  async executeTemplate(id, parameters = {}) {
    const template = await this.getById(id);
    if (!template) {
      throw new Error('Report template not found');
    }

    // This is a simplified execution - in a real system, you'd have a proper query engine
    let query = template.query_template;
    
    // Replace parameters in query
    Object.keys(parameters).forEach(key => {
      const placeholder = `{{${key}}}`;
      query = query.replace(new RegExp(placeholder, 'g'), parameters[key]);
    });

    try {
      // Execute the query using Prisma raw query
      const result = await prisma.$queryRawUnsafe(query);
      
      return {
        template,
        parameters,
        data: result,
        executedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Query execution failed: ${error.message}`);
    }
  },

  /**
   * Get predefined templates
   */
  async getPredefinedTemplates() {
    const templates = [
      {
        name: 'Monthly Revenue Report',
        description: 'Monthly revenue breakdown by client and project',
        report_type: 'financial',
        query_template: `
          SELECT 
            c.name as client_name,
            p.name as project_name,
            SUM(i.total_amount) as revenue,
            COUNT(i.id) as invoice_count
          FROM invoices i
          LEFT JOIN clients c ON i.client_id = c.id
          LEFT JOIN projects p ON i.project_id = p.id
          WHERE i.status = 'paid'
            AND i.issue_date >= '{{start_date}}'
            AND i.issue_date <= '{{end_date}}'
          GROUP BY c.id, p.id
          ORDER BY revenue DESC
        `,
        parameters: {
          start_date: { type: 'date', required: true, label: 'Start Date' },
          end_date: { type: 'date', required: true, label: 'End Date' }
        }
      },
      {
        name: 'Expense Analysis',
        description: 'Expense breakdown by category and vendor',
        report_type: 'expense',
        query_template: `
          SELECT 
            ec.name as category_name,
            v.name as vendor_name,
            SUM(e.amount) as total_amount,
            COUNT(e.id) as expense_count
          FROM expenses e
          LEFT JOIN expense_categories ec ON e.category_id = ec.id
          LEFT JOIN vendors v ON e.vendor_id = v.id
          WHERE e.expense_date >= '{{start_date}}'
            AND e.expense_date <= '{{end_date}}'
          GROUP BY ec.id, v.id
          ORDER BY total_amount DESC
        `,
        parameters: {
          start_date: { type: 'date', required: true, label: 'Start Date' },
          end_date: { type: 'date', required: true, label: 'End Date' }
        }
      },
      {
        name: 'Payroll Summary',
        description: 'Monthly payroll summary by department',
        report_type: 'payroll',
        query_template: `
          SELECT 
            e.department,
            COUNT(p.id) as employee_count,
            SUM(p.gross_salary) as total_gross,
            SUM(p.total_deductions) as total_deductions,
            SUM(p.net_salary) as total_net
          FROM payslips p
          JOIN employees e ON p.employee_id = e.id
          JOIN payroll_runs pr ON p.payroll_run_id = pr.id
          WHERE pr.month = {{month}} AND pr.year = {{year}}
          GROUP BY e.department
          ORDER BY total_net DESC
        `,
        parameters: {
          month: { type: 'number', required: true, label: 'Month (1-12)' },
          year: { type: 'number', required: true, label: 'Year' }
        }
      },
      {
        name: 'Account Balance Sheet',
        description: 'Balance sheet with account balances',
        report_type: 'accounting',
        query_template: `
          SELECT 
            at.name as account_type,
            a.account_number,
            a.name as account_name,
            COALESCE(SUM(le.debit), 0) as total_debits,
            COALESCE(SUM(le.credit), 0) as total_credits,
            COALESCE(SUM(le.debit), 0) - COALESCE(SUM(le.credit), 0) as balance
          FROM accounts a
          JOIN account_types at ON a.type_id = at.id
          LEFT JOIN ledger_entries le ON a.id = le.account_id
          LEFT JOIN journal_entries je ON le.journal_entry_id = je.id
          WHERE a.is_active = true
            AND (je.date <= '{{as_of_date}}' OR je.date IS NULL)
            AND (je.is_posted = true OR je.is_posted IS NULL)
          GROUP BY a.id, at.name
          ORDER BY at.name, a.account_number
        `,
        parameters: {
          as_of_date: { type: 'date', required: true, label: 'As of Date' }
        }
      }
    ];

    return templates;
  },

  /**
   * Get report template statistics
   */
  async getStats() {
    const [totalTemplates, totalSavedReports] = await Promise.all([
      prisma.reportTemplate.count(),
      prisma.savedReport.count()
    ]);

    const templatesByType = await prisma.reportTemplate.groupBy({
      by: ['report_type'],
      _count: {
        id: true
      }
    });

    const mostUsedTemplates = await prisma.reportTemplate.findMany({
      include: {
        _count: {
          select: { saved_reports: true }
        }
      },
      orderBy: {
        saved_reports: {
          _count: 'desc'
        }
      },
      take: 5
    });

    return {
      totalTemplates,
      totalSavedReports,
      byType: templatesByType,
      mostUsed: mostUsedTemplates
    };
  }
};

module.exports = reportTemplateModel;