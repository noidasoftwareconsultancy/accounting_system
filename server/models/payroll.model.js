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
   * Generate payroll for employees
   */
  async generatePayrollData(runId, employeeIds = null) {
    const payrollRun = await prisma.payrollRun.findUnique({
      where: { id: parseInt(runId) }
    });

    if (!payrollRun) {
      throw new Error('Payroll run not found');
    }

    const where = {
      termination_date: null
    };

    if (employeeIds && employeeIds.length > 0) {
      where.id = { in: employeeIds.map(id => parseInt(id)) };
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        user: {
          select: { first_name: true, last_name: true, email: true }
        },
        salary_structures: {
          where: {
            effective_from: { lte: payrollRun.end_date },
            OR: [
              { effective_to: null },
              { effective_to: { gte: payrollRun.start_date } }
            ]
          },
          orderBy: { effective_from: 'desc' },
          take: 1
        },
        attendance: {
          where: {
            date: {
              gte: payrollRun.start_date,
              lte: payrollRun.end_date
            }
          }
        }
      }
    });

    return employees.map(employee => {
      const salaryStructure = employee.salary_structures[0];
      if (!salaryStructure) {
        throw new Error(`No salary structure found for employee ${employee.employee_id}`);
      }

      // Calculate attendance-based salary
      const workingDays = this.getWorkingDays(payrollRun.start_date, payrollRun.end_date);
      const presentDays = employee.attendance.filter(a => a.status === 'present').length;
      const halfDays = employee.attendance.filter(a => a.status === 'half-day').length;
      const effectiveDays = presentDays + (halfDays * 0.5);

      const dailySalary = parseFloat(salaryStructure.basic_salary) / workingDays;
      const adjustedBasicSalary = dailySalary * effectiveDays;

      // Calculate allowances (proportional to attendance)
      const attendanceRatio = effectiveDays / workingDays;
      const hra = parseFloat(salaryStructure.hra) * attendanceRatio;
      const conveyance = parseFloat(salaryStructure.conveyance) * attendanceRatio;
      const medicalAllowance = parseFloat(salaryStructure.medical_allowance) * attendanceRatio;
      const specialAllowance = parseFloat(salaryStructure.special_allowance) * attendanceRatio;

      const grossSalary = adjustedBasicSalary + hra + conveyance + medicalAllowance + specialAllowance;

      // Calculate deductions
      const providentFund = parseFloat(salaryStructure.provident_fund) * attendanceRatio;
      const taxDeduction = parseFloat(salaryStructure.tax_deduction) * attendanceRatio;
      const otherDeductions = parseFloat(salaryStructure.other_deductions) * attendanceRatio;
      const totalDeductions = providentFund + taxDeduction + otherDeductions;

      const netSalary = grossSalary - totalDeductions;

      return {
        employee_id: employee.id,
        basic_salary: adjustedBasicSalary,
        hra,
        conveyance,
        medical_allowance: medicalAllowance,
        special_allowance: specialAllowance,
        overtime: 0, // Can be calculated based on extra hours
        bonus: 0, // Can be added manually
        gross_salary: grossSalary,
        provident_fund: providentFund,
        tax_deduction: taxDeduction,
        other_deductions: otherDeductions,
        total_deductions: totalDeductions,
        net_salary: netSalary,
        working_days: workingDays,
        present_days: presentDays,
        half_days: halfDays,
        effective_days: effectiveDays
      };
    });
  },

  /**
   * Get working days between two dates (excluding weekends)
   */
  getWorkingDays(startDate, endDate) {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  },

  /**
   * Get payroll analytics
   */
  async getAnalytics(period = 'year') {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
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
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
    }

    const [
      totalPayroll,
      departmentWise,
      monthlyTrend,
      paymentStatus
    ] = await Promise.all([
      prisma.payslip.aggregate({
        where: {
          created_at: { gte: startDate, lte: endDate }
        },
        _sum: { net_salary: true, gross_salary: true, total_deductions: true },
        _count: true,
        _avg: { net_salary: true }
      }),
      prisma.payslip.groupBy({
        by: ['employee_id'],
        where: {
          created_at: { gte: startDate, lte: endDate }
        },
        _sum: { net_salary: true },
        _count: true
      }),
      this.getMonthlyPayrollTrend(now.getFullYear()),
      prisma.payslip.groupBy({
        by: ['payment_status'],
        where: {
          created_at: { gte: startDate, lte: endDate }
        },
        _sum: { net_salary: true },
        _count: true
      })
    ]);

    return {
      period,
      dateRange: { startDate, endDate },
      summary: {
        totalAmount: totalPayroll._sum.net_salary || 0,
        totalGross: totalPayroll._sum.gross_salary || 0,
        totalDeductions: totalPayroll._sum.total_deductions || 0,
        totalPayslips: totalPayroll._count,
        averageSalary: totalPayroll._avg.net_salary || 0
      },
      departmentWise,
      monthlyTrend,
      paymentStatus: paymentStatus.map(status => ({
        status: status.payment_status,
        count: status._count,
        amount: status._sum.net_salary || 0
      }))
    };
  },

  /**
   * Get monthly payroll trend
   */
  async getMonthlyPayrollTrend(year) {
    const payslips = await prisma.payslip.findMany({
      where: {
        created_at: {
          gte: new Date(year, 0, 1),
          lte: new Date(year, 11, 31)
        }
      },
      select: {
        created_at: true,
        net_salary: true,
        gross_salary: true
      }
    });

    const monthlyData = {};
    
    payslips.forEach(payslip => {
      const month = payslip.created_at.getMonth() + 1;
      if (!monthlyData[month]) {
        monthlyData[month] = {
          totalNet: 0,
          totalGross: 0,
          count: 0
        };
      }
      monthlyData[month].totalNet += parseFloat(payslip.net_salary);
      monthlyData[month].totalGross += parseFloat(payslip.gross_salary);
      monthlyData[month].count++;
    });

    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      totalNet: monthlyData[i + 1]?.totalNet || 0,
      totalGross: monthlyData[i + 1]?.totalGross || 0,
      count: monthlyData[i + 1]?.count || 0
    }));
  },

  /**
   * Bulk update payment status
   */
  async bulkUpdatePaymentStatus(payslipIds, status, paymentDate = null) {
    return prisma.payslip.updateMany({
      where: {
        id: { in: payslipIds.map(id => parseInt(id)) }
      },
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
    const [totalRuns, pendingPayments, thisMonthTotal, lastMonthTotal] = await Promise.all([
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
      }),
      prisma.payslip.aggregate({
        where: {
          created_at: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { net_salary: true }
      })
    ]);

    const thisMonth = thisMonthTotal._sum.net_salary || 0;
    const lastMonth = lastMonthTotal._sum.net_salary || 0;
    const trend = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    return {
      totalRuns,
      pendingPayments,
      thisMonthTotal: thisMonth,
      lastMonthTotal: lastMonth,
      trend: Math.round(trend * 100) / 100
    };
  }
};

module.exports = payrollModel;