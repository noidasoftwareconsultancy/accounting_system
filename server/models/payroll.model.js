const prisma = require('../lib/prisma');

const payrollModel = {
  /**
   * Get all payroll runs
   */
  async getAllRuns(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [payrollRuns, total] = await Promise.all([
      prisma.payrollRun.findMany({
        include: {
          processor: {
            select: { id: true, first_name: true, last_name: true }
          },
          _count: {
            select: { payslips: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.payrollRun.count()
    ]);

    return {
      payrollRuns,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get payroll run by ID
   */
  async getRunById(id) {
    return prisma.payrollRun.findUnique({
      where: { id: parseInt(id) },
      include: {
        processor: {
          select: { id: true, first_name: true, last_name: true }
        },
        payslips: {
          include: {
            employee: {
              include: {
                user: {
                  select: { first_name: true, last_name: true, email: true }
                }
              }
            }
          }
        }
      }
    });
  },

  /**
   * Create payroll run
   */
  async createRun(runData) {
    return prisma.payrollRun.create({
      data: {
        ...runData,
        processed_by: runData.processed_by ? parseInt(runData.processed_by) : null
      }
    });
  },

  /**
   * Process payroll for employees
   */
  async processPayroll(runId, employeePayslips, processedBy) {
    return prisma.$transaction(async (tx) => {
      // Update payroll run status
      await tx.payrollRun.update({
        where: { id: parseInt(runId) },
        data: {
          status: 'processed',
          processed_by: parseInt(processedBy),
          processed_at: new Date()
        }
      });

      // Create payslips
      const payslips = await Promise.all(
        employeePayslips.map(payslip => 
          tx.payslip.create({
            data: {
              ...payslip,
              payroll_run_id: parseInt(runId),
              employee_id: parseInt(payslip.employee_id),
              basic_salary: parseFloat(payslip.basic_salary),
              hra: parseFloat(payslip.hra || 0),
              conveyance: parseFloat(payslip.conveyance || 0),
              medical_allowance: parseFloat(payslip.medical_allowance || 0),
              special_allowance: parseFloat(payslip.special_allowance || 0),
              overtime: parseFloat(payslip.overtime || 0),
              bonus: parseFloat(payslip.bonus || 0),
              gross_salary: parseFloat(payslip.gross_salary),
              provident_fund: parseFloat(payslip.provident_fund || 0),
              tax_deduction: parseFloat(payslip.tax_deduction || 0),
              other_deductions: parseFloat(payslip.other_deductions || 0),
              total_deductions: parseFloat(payslip.total_deductions),
              net_salary: parseFloat(payslip.net_salary)
            }
          })
        )
      );

      return payslips;
    });
  },

  /**
   * Get payslip by ID
   */
  async getPayslipById(id) {
    return prisma.payslip.findUnique({
      where: { id: parseInt(id) },
      include: {
        employee: {
          include: {
            user: {
              select: { first_name: true, last_name: true, email: true }
            }
          }
        },
        payroll_run: true
      }
    });
  },

  /**
   * Get employee payslips
   */
  async getEmployeePayslips(employeeId, page = 1, limit = 12) {
    const skip = (page - 1) * limit;

    const [payslips, total] = await Promise.all([
      prisma.payslip.findMany({
        where: { employee_id: parseInt(employeeId) },
        include: {
          payroll_run: true
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.payslip.count({
        where: { employee_id: parseInt(employeeId) }
      })
    ]);

    return {
      payslips,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Update payslip payment status
   */
  async updatePaymentStatus(payslipId, status, paymentDate = null) {
    return prisma.payslip.update({
      where: { id: parseInt(payslipId) },
      data: {
        payment_status: status,
        payment_date: paymentDate ? new Date(paymentDate) : null
      }
    });
  },

  /**
   * Get payroll statistics
   */
  async getStats() {
    const [totalRuns, pendingPayments, thisMonthTotal] = await Promise.all([
      prisma.payrollRun.count(),
      prisma.payslip.count({
        where: { payment_status: 'pending' }
      }),
      prisma.payslip.aggregate({
        where: {
          created_at: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { net_salary: true }
      })
    ]);

    return {
      totalRuns,
      pendingPayments,
      thisMonthTotal: thisMonthTotal._sum.net_salary || 0
    };
  }
};

module.exports = payrollModel;