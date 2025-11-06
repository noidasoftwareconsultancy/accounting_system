const prisma = require('../lib/prisma');

const scheduledTaskModel = {
  /**
   * Get all scheduled tasks with pagination
   */
  async getAll(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    if (filters.task_type) where.task_type = filters.task_type;
    if (filters.is_active !== undefined) where.is_active = filters.is_active;
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    const [tasks, total] = await Promise.all([
      prisma.scheduledTask.findMany({
        where,
        include: {
          creator: {
            select: { id: true, first_name: true, last_name: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.scheduledTask.count({ where })
    ]);

    return {
      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get scheduled task by ID
   */
  async getById(id) {
    return prisma.scheduledTask.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Create new scheduled task
   */
  async create(data) {
    const nextRun = this.calculateNextRun(data.frequency, data.cron_expression);
    
    return prisma.scheduledTask.create({
      data: {
        name: data.name,
        task_type: data.task_type,
        frequency: data.frequency,
        cron_expression: data.cron_expression,
        parameters: data.parameters || {},
        next_run: nextRun,
        is_active: data.is_active !== undefined ? data.is_active : true,
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
   * Update scheduled task
   */
  async update(id, data) {
    const updateData = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.task_type !== undefined) updateData.task_type = data.task_type;
    if (data.frequency !== undefined) updateData.frequency = data.frequency;
    if (data.cron_expression !== undefined) updateData.cron_expression = data.cron_expression;
    if (data.parameters !== undefined) updateData.parameters = data.parameters;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    // Recalculate next run if frequency or cron changed
    if (data.frequency !== undefined || data.cron_expression !== undefined) {
      const task = await this.getById(id);
      updateData.next_run = this.calculateNextRun(
        data.frequency || task.frequency,
        data.cron_expression || task.cron_expression
      );
    }

    return prisma.scheduledTask.update({
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
   * Delete scheduled task
   */
  async delete(id) {
    return prisma.scheduledTask.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Get tasks due for execution
   */
  async getTasksDue() {
    return prisma.scheduledTask.findMany({
      where: {
        is_active: true,
        next_run: {
          lte: new Date()
        }
      },
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      },
      orderBy: { next_run: 'asc' }
    });
  },

  /**
   * Mark task as executed and calculate next run
   */
  async markAsExecuted(id, executionResult = null) {
    const task = await this.getById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    const now = new Date();
    const nextRun = this.calculateNextRun(task.frequency, task.cron_expression, now);

    const updateData = {
      last_run: now,
      next_run: nextRun
    };

    // Store execution result in parameters if provided
    if (executionResult !== null) {
      updateData.parameters = {
        ...task.parameters,
        lastExecutionResult: executionResult,
        lastExecutionTime: now.toISOString()
      };
    }

    return prisma.scheduledTask.update({
      where: { id: parseInt(id) },
      data: updateData
    });
  },

  /**
   * Calculate next run time based on frequency
   */
  calculateNextRun(frequency, cronExpression = null, fromDate = null) {
    const baseDate = fromDate || new Date();
    
    if (cronExpression) {
      // For cron expressions, you'd typically use a library like node-cron
      // For now, we'll implement basic frequency-based scheduling
      return this.calculateNextRunByFrequency(frequency, baseDate);
    }
    
    return this.calculateNextRunByFrequency(frequency, baseDate);
  },

  /**
   * Calculate next run by frequency
   */
  calculateNextRunByFrequency(frequency, baseDate) {
    const nextRun = new Date(baseDate);
    
    switch (frequency.toLowerCase()) {
      case 'hourly':
        nextRun.setHours(nextRun.getHours() + 1);
        break;
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
      case 'quarterly':
        nextRun.setMonth(nextRun.getMonth() + 3);
        break;
      case 'yearly':
        nextRun.setFullYear(nextRun.getFullYear() + 1);
        break;
      default:
        // Default to daily if frequency is not recognized
        nextRun.setDate(nextRun.getDate() + 1);
    }
    
    return nextRun;
  },

  /**
   * Execute task based on type
   */
  async executeTask(taskId) {
    const task = await this.getById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    if (!task.is_active) {
      throw new Error('Task is not active');
    }

    let result = { success: false, message: 'Unknown task type' };

    try {
      switch (task.task_type) {
        case 'invoice_reminder':
          result = await this.executeInvoiceReminder(task);
          break;
        case 'expense_report':
          result = await this.executeExpenseReport(task);
          break;
        case 'payroll_processing':
          result = await this.executePayrollProcessing(task);
          break;
        case 'backup_data':
          result = await this.executeDataBackup(task);
          break;
        case 'generate_report':
          result = await this.executeReportGeneration(task);
          break;
        default:
          result = { success: false, message: `Unknown task type: ${task.task_type}` };
      }

      // Mark task as executed
      await this.markAsExecuted(taskId, result);
      
      return result;
    } catch (error) {
      const errorResult = { success: false, message: error.message, error: error.stack };
      await this.markAsExecuted(taskId, errorResult);
      throw error;
    }
  },

  /**
   * Execute invoice reminder task
   */
  async executeInvoiceReminder(task) {
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: { not: 'paid' },
        due_date: { lt: new Date() }
      },
      include: {
        client: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Here you would send reminder emails
    // For now, we'll just return the count
    return {
      success: true,
      message: `Processed ${overdueInvoices.length} overdue invoices`,
      data: { overdueCount: overdueInvoices.length }
    };
  },

  /**
   * Execute expense report task
   */
  async executeExpenseReport(task) {
    const parameters = task.parameters || {};
    const startDate = parameters.startDate || new Date(new Date().setDate(1)); // First day of month
    const endDate = parameters.endDate || new Date();

    const expenses = await prisma.expense.findMany({
      where: {
        expense_date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        category: true,
        vendor: true
      }
    });

    const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    return {
      success: true,
      message: `Generated expense report for ${expenses.length} expenses`,
      data: { expenseCount: expenses.length, totalAmount }
    };
  },

  /**
   * Execute payroll processing task
   */
  async executePayrollProcessing(task) {
    // This would integrate with payroll processing logic
    return {
      success: true,
      message: 'Payroll processing task executed',
      data: { message: 'Payroll processing not implemented yet' }
    };
  },

  /**
   * Execute data backup task
   */
  async executeDataBackup(task) {
    // This would integrate with backup systems
    return {
      success: true,
      message: 'Data backup task executed',
      data: { message: 'Data backup not implemented yet' }
    };
  },

  /**
   * Execute report generation task
   */
  async executeReportGeneration(task) {
    const parameters = task.parameters || {};
    const templateId = parameters.templateId;

    if (!templateId) {
      throw new Error('Template ID required for report generation task');
    }

    const reportTemplateModel = require('./report-template.model');
    const savedReportModel = require('./saved-report.model');

    try {
      const reportName = `Scheduled Report - ${task.name} - ${new Date().toISOString()}`;
      const savedReport = await savedReportModel.executeAndSave(
        templateId,
        parameters.reportParameters || {},
        reportName,
        task.created_by
      );

      return {
        success: true,
        message: 'Report generated successfully',
        data: { reportId: savedReport.id, reportName }
      };
    } catch (error) {
      throw new Error(`Report generation failed: ${error.message}`);
    }
  },

  /**
   * Get task execution history
   */
  async getExecutionHistory(taskId, limit = 10) {
    const task = await this.getById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Extract execution history from parameters
    const executions = [];
    if (task.parameters?.lastExecutionResult) {
      executions.push({
        executedAt: task.last_run,
        result: task.parameters.lastExecutionResult
      });
    }

    return {
      task,
      executions,
      nextRun: task.next_run
    };
  },

  /**
   * Get scheduled task statistics
   */
  async getStats() {
    const [totalTasks, activeTasks, tasksDue] = await Promise.all([
      prisma.scheduledTask.count(),
      prisma.scheduledTask.count({ where: { is_active: true } }),
      prisma.scheduledTask.count({
        where: {
          is_active: true,
          next_run: { lte: new Date() }
        }
      })
    ]);

    const tasksByType = await prisma.scheduledTask.groupBy({
      by: ['task_type'],
      _count: {
        id: true
      }
    });

    const tasksByFrequency = await prisma.scheduledTask.groupBy({
      by: ['frequency'],
      _count: {
        id: true
      }
    });

    return {
      totalTasks,
      activeTasks,
      tasksDue,
      byType: tasksByType,
      byFrequency: tasksByFrequency
    };
  }
};

module.exports = scheduledTaskModel;