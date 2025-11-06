const prisma = require('../lib/prisma');

const hrReportsModel = {
  /**
   * Get Employee Summary Report
   */
  async getEmployeeSummary(filters = {}) {
    const { department, status = 'active' } = filters;
    
    const where = {};
    if (department) where.department = department;
    if (status === 'active') {
      where.termination_date = null;
    } else if (status === 'terminated') {
      where.termination_date = { not: null };
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        user: {
          select: { first_name: true, last_name: true, email: true, role: true }
        },
        salary_structures: {
          where: { effective_to: null },
          orderBy: { effective_from: 'desc' },
          take: 1
        },
        _count: {
          select: { 
            attendance: true,
            payslips: true
          }
        }
      }
    });

    const summary = {
      total_employees: employees.length,
      by_department: {},
      total_salary_cost: 0
    };

    employees.forEach(emp => {
      // Department breakdown
      const dept = emp.department || 'Unassigned';
      if (!summary.by_department[dept]) {
        summary.by_department[dept] = { count: 0, salary_cost: 0 };
      }
      summary.by_department[dept].count += 1;

      // Salary cost calculation
      if (emp.salary_structures.length > 0) {
        const salary = parseFloat(emp.salary_structures[0].basic_salary || 0);
        summary.by_department[dept].salary_cost += salary;
        summary.total_salary_cost += salary;
      }
    });

    return {
      summary,
      employees: employees.map(emp => ({
        ...emp,
        current_salary: emp.salary_structures[0] || null
      }))
    };
  },

  /**
   * Get Payroll Summary Report
   */
  async getPayrollSummary(filters = {}) {
    const { start_date, end_date, month, year } = filters;
    
    let where = {};
    if (month && year) {
      where = { month: parseInt(month), year: parseInt(year) };
    } else if (start_date && end_date) {
      where.processed_at = {
        gte: new Date(start_date),
        lte: new Date(end_date)
      };
    }

    const payrollRuns = await prisma.payrollRun.findMany({
      where,
      include: {
        payslips: {
          include: {
            employee: {
              include: {
                user: {
                  select: { first_name: true, last_name: true }
                }
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const summary = {
      total_runs: payrollRuns.length,
      total_employees: 0,
      total_gross_salary: 0,
      total_deductions: 0,
      total_net_salary: 0,
      total_tax_deductions: 0
    };

    const detailedPayslips = [];

    payrollRuns.forEach(run => {
      run.payslips.forEach(payslip => {
        summary.total_employees += 1;
        summary.total_gross_salary += parseFloat(payslip.gross_salary);
        summary.total_deductions += parseFloat(payslip.total_deductions);
        summary.total_net_salary += parseFloat(payslip.net_salary);
        summary.total_tax_deductions += parseFloat(payslip.tax_deduction);

        detailedPayslips.push({
          ...payslip,
          employee_name: `${payslip.employee.user?.first_name} ${payslip.employee.user?.last_name}`,
          payroll_period: `${run.month}/${run.year}`
        });
      });
    });

    return {
      summary,
      payroll_runs: payrollRuns,
      detailed_payslips: detailedPayslips
    };
  },

  /**
   * Get Attendance Report
   */
  async getAttendanceReport(filters = {}) {
    const { start_date, end_date, employee_id, department } = filters;
    
    const where = {};
    if (start_date && end_date) {
      where.date = {
        gte: new Date(start_date),
        lte: new Date(end_date)
      };
    }
    if (employee_id) where.employee_id = parseInt(employee_id);

    let employeeWhere = {};
    if (department) employeeWhere.department = department;

    const attendance = await prisma.attendance.findMany({
      where: {
        ...where,
        employee: employeeWhere
      },
      include: {
        employee: {
          include: {
            user: {
              select: { first_name: true, last_name: true }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    // Calculate summary statistics
    const summary = {
      total_records: attendance.length,
      present_days: attendance.filter(a => a.status === 'present').length,
      absent_days: attendance.filter(a => a.status === 'absent').length,
      half_days: attendance.filter(a => a.status === 'half-day').length,
      leave_days: attendance.filter(a => a.status === 'leave').length,
      total_hours: attendance.reduce((sum, a) => sum + parseFloat(a.hours_worked || 0), 0)
    };

    // Group by employee
    const byEmployee = attendance.reduce((acc, record) => {
      const empId = record.employee_id;
      if (!acc[empId]) {
        acc[empId] = {
          employee: record.employee,
          present: 0,
          absent: 0,
          half_day: 0,
          leave: 0,
          total_hours: 0
        };
      }
      acc[empId][record.status.replace('-', '_')] += 1;
      acc[empId].total_hours += parseFloat(record.hours_worked || 0);
      return acc;
    }, {});

    return {
      summary,
      attendance_records: attendance,
      by_employee: Object.values(byEmployee)
    };
  },

  /**
   * Get Department Performance Report
   */
  async getDepartmentPerformance(filters = {}) {
    const { start_date, end_date } = filters;
    
    const departments = await prisma.employee.groupBy({
      by: ['department'],
      where: {
        termination_date: null // Only active employees
      },
      _count: {
        id: true
      }
    });

    const departmentData = await Promise.all(
      departments.map(async (dept) => {
        const deptName = dept.department || 'Unassigned';
        
        // Get salary cost for department
        const salaryData = await prisma.salaryStructure.aggregate({
          where: {
            employee: {
              department: dept.department,
              termination_date: null
            },
            effective_to: null
          },
          _sum: {
            basic_salary: true,
            hra: true,
            conveyance: true,
            medical_allowance: true,
            special_allowance: true
          }
        });

        // Get attendance data for department
        const attendanceWhere = {
          employee: {
            department: dept.department,
            termination_date: null
          }
        };
        if (start_date && end_date) {
          attendanceWhere.date = {
            gte: new Date(start_date),
            lte: new Date(end_date)
          };
        }

        const attendanceStats = await prisma.attendance.groupBy({
          by: ['status'],
          where: attendanceWhere,
          _count: {
            id: true
          }
        });

        const totalSalary = Object.values(salaryData._sum).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        
        return {
          department: deptName,
          employee_count: dept._count.id,
          total_salary_cost: totalSalary,
          average_salary: dept._count.id > 0 ? totalSalary / dept._count.id : 0,
          attendance_stats: attendanceStats.reduce((acc, stat) => {
            acc[stat.status] = stat._count.id;
            return acc;
          }, {})
        };
      })
    );

    return departmentData.sort((a, b) => b.employee_count - a.employee_count);
  },

  /**
   * Get Employee Lifecycle Report
   */
  async getEmployeeLifecycleReport(filters = {}) {
    const { year = new Date().getFullYear() } = filters;
    
    // Get hiring trends
    const hiringTrends = await prisma.$queryRawUnsafe(`
      SELECT 
        EXTRACT(MONTH FROM join_date) as month,
        COUNT(*) as hires
      FROM employees 
      WHERE EXTRACT(YEAR FROM join_date) = $1
      GROUP BY EXTRACT(MONTH FROM join_date)
      ORDER BY month
    `, parseInt(year));

    // Get termination trends
    const terminationTrends = await prisma.$queryRawUnsafe(`
      SELECT 
        EXTRACT(MONTH FROM termination_date) as month,
        COUNT(*) as terminations
      FROM employees 
      WHERE EXTRACT(YEAR FROM termination_date) = $1
      GROUP BY EXTRACT(MONTH FROM termination_date)
      ORDER BY month
    `, parseInt(year));

    // Calculate monthly net change
    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const hires = hiringTrends.find(h => parseInt(h.month) === month)?.hires || 0;
      const terminations = terminationTrends.find(t => parseInt(t.month) === month)?.terminations || 0;
      
      monthlyData.push({
        month,
        month_name: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
        hires: parseInt(hires),
        terminations: parseInt(terminations),
        net_change: parseInt(hires) - parseInt(terminations)
      });
    }

    return {
      year: parseInt(year),
      monthly_data: monthlyData,
      yearly_summary: {
        total_hires: hiringTrends.reduce((sum, h) => sum + parseInt(h.hires), 0),
        total_terminations: terminationTrends.reduce((sum, t) => sum + parseInt(t.terminations), 0)
      }
    };
  }
};

module.exports = hrReportsModel;