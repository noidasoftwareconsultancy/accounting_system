const prisma = require('../lib/prisma');

const employeeModel = {
  /**
   * Get all employees with pagination and filtering
   */
  async getAll(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = {};

    if (filters.department) where.department = filters.department;
    if (filters.designation) where.designation = { contains: filters.designation, mode: 'insensitive' };

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          user: {
            select: { id: true, first_name: true, last_name: true, email: true }
          },
          creator: {
            select: { id: true, first_name: true, last_name: true }
          },
          salary_structures: {
            where: { effective_to: null },
            orderBy: { effective_from: 'desc' },
            take: 1
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.employee.count({ where })
    ]);

    return {
      employees,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get employee by ID
   */
  async getById(id) {
    return prisma.employee.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, first_name: true, last_name: true, email: true, username: true }
        },
        creator: {
          select: { id: true, first_name: true, last_name: true }
        },
        salary_structures: {
          orderBy: { effective_from: 'desc' }
        },
        attendance: {
          orderBy: { date: 'desc' },
          take: 30
        },
        payslips: {
          orderBy: { created_at: 'desc' },
          take: 12,
          include: {
            payroll_run: true
          }
        }
      }
    });
  },

  /**
   * Create a new employee
   */
  async create(employeeData) {
    return prisma.employee.create({
      data: {
        ...employeeData,
        user_id: employeeData.user_id ? parseInt(employeeData.user_id) : null,
        created_by: parseInt(employeeData.created_by)
      },
      include: {
        user: {
          select: { id: true, first_name: true, last_name: true, email: true }
        },
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Update employee
   */
  async update(id, employeeData) {
    return prisma.employee.update({
      where: { id: parseInt(id) },
      data: {
        ...employeeData,
        user_id: employeeData.user_id ? parseInt(employeeData.user_id) : undefined
      },
      include: {
        user: {
          select: { id: true, first_name: true, last_name: true, email: true }
        },
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Delete employee
   */
  async delete(id) {
    return prisma.employee.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Create salary structure
   */
  async createSalaryStructure(salaryData) {
    return prisma.salaryStructure.create({
      data: {
        ...salaryData,
        employee_id: parseInt(salaryData.employee_id),
        created_by: parseInt(salaryData.created_by),
        basic_salary: parseFloat(salaryData.basic_salary),
        hra: parseFloat(salaryData.hra || 0),
        conveyance: parseFloat(salaryData.conveyance || 0),
        medical_allowance: parseFloat(salaryData.medical_allowance || 0),
        special_allowance: parseFloat(salaryData.special_allowance || 0),
        provident_fund: parseFloat(salaryData.provident_fund || 0),
        tax_deduction: parseFloat(salaryData.tax_deduction || 0),
        other_deductions: parseFloat(salaryData.other_deductions || 0)
      }
    });
  },

  /**
   * Record attendance
   */
  async recordAttendance(attendanceData) {
    return prisma.attendance.create({
      data: {
        ...attendanceData,
        employee_id: parseInt(attendanceData.employee_id),
        created_by: parseInt(attendanceData.created_by),
        hours_worked: attendanceData.hours_worked ? parseFloat(attendanceData.hours_worked) : null
      }
    });
  },

  /**
   * Get employee statistics
   */
  async getStats() {
    const [total, active, departments] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({
        where: { termination_date: null }
      }),
      prisma.employee.groupBy({
        by: ['department'],
        _count: { id: true },
        where: { department: { not: null } }
      })
    ]);

    return {
      total,
      active,
      departments: departments.map(d => ({
        department: d.department,
        count: d._count.id
      }))
    };
  }
};

module.exports = employeeModel;