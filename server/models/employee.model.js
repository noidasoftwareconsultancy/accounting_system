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
    
    // Handle status filter
    if (filters.status === 'active') {
      where.termination_date = null;
    } else if (filters.status === 'terminated') {
      where.termination_date = { not: null };
    }

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
    return prisma.$transaction(async (tx) => {
      let userId = employeeData.user_id ? parseInt(employeeData.user_id) : null;

      // Create user if user_data is provided
      if (employeeData.user_data) {
        const user = await tx.user.create({
          data: {
            ...employeeData.user_data,
            password: 'temp123', // Temporary password - should be changed on first login
            role: employeeData.user_data.role || 'employee'
          }
        });
        userId = user.id;
      }

      // Create employee
      const employee = await tx.employee.create({
        data: {
          employee_id: employeeData.employee_id,
          user_id: userId,
          department: employeeData.department,
          designation: employeeData.designation,
          join_date: new Date(employeeData.join_date + 'T00:00:00.000Z'),
          termination_date: employeeData.termination_date ? new Date(employeeData.termination_date + 'T00:00:00.000Z') : null,
          bank_account: employeeData.bank_account,
          bank_name: employeeData.bank_name,
          tax_id: employeeData.tax_id,
          created_by: parseInt(employeeData.created_by)
        },
        include: {
          user: {
            select: { id: true, first_name: true, last_name: true, email: true, username: true }
          },
          creator: {
            select: { id: true, first_name: true, last_name: true }
          }
        }
      });

      return employee;
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
   * Get attendance for employee
   */
  async getAttendance(employeeId, startDate, endDate) {
    const where = {
      employee_id: parseInt(employeeId)
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    return prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Bulk record attendance
   */
  async bulkRecordAttendance(attendanceRecords, createdBy) {
    return prisma.attendance.createMany({
      data: attendanceRecords.map(record => ({
        ...record,
        employee_id: parseInt(record.employee_id),
        created_by: parseInt(createdBy),
        hours_worked: record.hours_worked ? parseFloat(record.hours_worked) : null,
        date: new Date(record.date + 'T00:00:00.000Z')
      }))
    });
  },

  /**
   * Get attendance summary
   */
  async getAttendanceSummary(employeeId, month, year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await prisma.attendance.findMany({
      where: {
        employee_id: parseInt(employeeId),
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const summary = {
      totalDays: endDate.getDate(),
      present: 0,
      absent: 0,
      halfDay: 0,
      leave: 0,
      totalHours: 0
    };

    attendance.forEach(record => {
      switch (record.status) {
        case 'present':
          summary.present++;
          break;
        case 'absent':
          summary.absent++;
          break;
        case 'half-day':
          summary.halfDay++;
          break;
        case 'leave':
          summary.leave++;
          break;
      }
      if (record.hours_worked) {
        summary.totalHours += parseFloat(record.hours_worked);
      }
    });

    return summary;
  },

  /**
   * Get salary structure history
   */
  async getSalaryHistory(employeeId) {
    return prisma.salaryStructure.findMany({
      where: { employee_id: parseInt(employeeId) },
      orderBy: { effective_from: 'desc' },
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Update salary structure (end current and create new)
   */
  async updateSalaryStructure(employeeId, newSalaryData, createdBy) {
    return prisma.$transaction(async (tx) => {
      // End current salary structure
      await tx.salaryStructure.updateMany({
        where: {
          employee_id: parseInt(employeeId),
          effective_to: null
        },
        data: {
          effective_to: new Date(newSalaryData.effective_from)
        }
      });

      // Create new salary structure
      return tx.salaryStructure.create({
        data: {
          ...newSalaryData,
          employee_id: parseInt(employeeId),
          created_by: parseInt(createdBy),
          basic_salary: parseFloat(newSalaryData.basic_salary),
          hra: parseFloat(newSalaryData.hra || 0),
          conveyance: parseFloat(newSalaryData.conveyance || 0),
          medical_allowance: parseFloat(newSalaryData.medical_allowance || 0),
          special_allowance: parseFloat(newSalaryData.special_allowance || 0),
          provident_fund: parseFloat(newSalaryData.provident_fund || 0),
          tax_deduction: parseFloat(newSalaryData.tax_deduction || 0),
          other_deductions: parseFloat(newSalaryData.other_deductions || 0),
          effective_from: new Date(newSalaryData.effective_from + 'T00:00:00.000Z'),
          effective_to: newSalaryData.effective_to ? new Date(newSalaryData.effective_to + 'T00:00:00.000Z') : null
        }
      });
    });
  },

  /**
   * Get employees by department
   */
  async getByDepartment(department) {
    return prisma.employee.findMany({
      where: { department },
      include: {
        user: {
          select: { id: true, first_name: true, last_name: true, email: true }
        },
        salary_structures: {
          where: { effective_to: null },
          orderBy: { effective_from: 'desc' },
          take: 1
        }
      },
      orderBy: { created_at: 'desc' }
    });
  },

  /**
   * Search employees
   */
  async search(query) {
    return prisma.employee.findMany({
      where: {
        OR: [
          { employee_id: { contains: query, mode: 'insensitive' } },
          { department: { contains: query, mode: 'insensitive' } },
          { designation: { contains: query, mode: 'insensitive' } },
          {
            user: {
              OR: [
                { first_name: { contains: query, mode: 'insensitive' } },
                { last_name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
              ]
            }
          }
        ]
      },
      include: {
        user: {
          select: { id: true, first_name: true, last_name: true, email: true }
        },
        salary_structures: {
          where: { effective_to: null },
          take: 1
        }
      },
      take: 20
    });
  },

  /**
   * Get employee statistics
   */
  async getStats() {
    const [total, active, departments, designations, recentJoins] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({
        where: { termination_date: null }
      }),
      prisma.employee.groupBy({
        by: ['department'],
        _count: { id: true },
        where: { department: { not: null } }
      }),
      prisma.employee.groupBy({
        by: ['designation'],
        _count: { id: true },
        where: { designation: { not: null } }
      }),
      prisma.employee.count({
        where: {
          join_date: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 3))
          }
        }
      })
    ]);

    return {
      total,
      active,
      terminated: total - active,
      recentJoins,
      departments: departments.map(d => ({
        department: d.department,
        count: d._count.id
      })),
      designations: designations.map(d => ({
        designation: d.designation,
        count: d._count.id
      }))
    };
  },

  /**
   * Get department analytics
   */
  async getDepartmentAnalytics() {
    const departments = await prisma.employee.groupBy({
      by: ['department'],
      _count: { id: true },
      where: { 
        department: { not: null },
        termination_date: null
      }
    });

    return Promise.all(
      departments.map(async (dept) => {
        const avgSalary = await prisma.salaryStructure.aggregate({
          where: {
            employee: {
              department: dept.department,
              termination_date: null
            },
            effective_to: null
          },
          _avg: { basic_salary: true }
        });

        return {
          department: dept.department,
          employeeCount: dept._count.id,
          averageSalary: avgSalary._avg.basic_salary || 0
        };
      })
    );
  }
};

module.exports = employeeModel;