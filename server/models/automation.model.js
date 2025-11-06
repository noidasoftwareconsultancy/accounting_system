const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const automationModel = {
  // ============================================================================
  // AUTOMATION RULES
  // ============================================================================

  /**
   * Get all automation rules with pagination and filters
   */
  async getAllRules(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const where = {};
    
    if (filters.trigger_event) {
      where.trigger_event = filters.trigger_event;
    }
    
    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active === 'true';
    }
    
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [rules, total] = await Promise.all([
      prisma.automationRule.findMany({
        where,
        include: {
          creator: {
            select: { id: true, username: true, first_name: true, last_name: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.automationRule.count({ where })
    ]);

    return {
      rules,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get automation rule by ID
   */
  async getRuleById(id) {
    return await prisma.automationRule.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: { id: true, username: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Create new automation rule
   */
  async createRule(ruleData) {
    return await prisma.automationRule.create({
      data: ruleData,
      include: {
        creator: {
          select: { id: true, username: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Update automation rule
   */
  async updateRule(id, updateData) {
    try {
      return await prisma.automationRule.update({
        where: { id: parseInt(id) },
        data: {
          ...updateData,
          updated_at: new Date()
        },
        include: {
          creator: {
            select: { id: true, username: true, first_name: true, last_name: true }
          }
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  },

  /**
   * Toggle automation rule active status
   */
  async toggleRule(id) {
    try {
      const rule = await prisma.automationRule.findUnique({
        where: { id: parseInt(id) }
      });

      if (!rule) return null;

      return await prisma.automationRule.update({
        where: { id: parseInt(id) },
        data: { 
          is_active: !rule.is_active,
          updated_at: new Date()
        },
        include: {
          creator: {
            select: { id: true, username: true, first_name: true, last_name: true }
          }
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  },

  /**
   * Delete automation rule
   */
  async deleteRule(id) {
    try {
      await prisma.automationRule.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  },

  /**
   * Get active automation rules
   */
  async getActiveRules() {
    return await prisma.automationRule.findMany({
      where: { is_active: true },
      include: {
        creator: {
          select: { id: true, username: true, first_name: true, last_name: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  },

  /**
   * Get automation rules statistics
   */
  async getRulesStats() {
    const [
      totalRules,
      activeRules,
      rulesByEvent
    ] = await Promise.all([
      prisma.automationRule.count(),
      prisma.automationRule.count({ where: { is_active: true } }),
      prisma.automationRule.groupBy({
        by: ['trigger_event'],
        _count: { id: true }
      })
    ]);

    return {
      totalRules,
      activeRules,
      inactiveRules: totalRules - activeRules,
      rulesByEvent: rulesByEvent.reduce((acc, item) => {
        acc[item.trigger_event] = item._count.id;
        return acc;
      }, {})
    };
  },

  // ============================================================================
  // SCHEDULED TASKS
  // ============================================================================

  /**
   * Get all scheduled tasks with pagination and filters
   */
  async getAllTasks(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const where = {};
    
    if (filters.task_type) {
      where.task_type = filters.task_type;
    }
    
    if (filters.frequency) {
      where.frequency = filters.frequency;
    }
    
    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active === 'true';
    }
    
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.scheduledTask.findMany({
        where,
        include: {
          creator: {
            select: { id: true, username: true, first_name: true, last_name: true }
          }
        },
        orderBy: { next_run: 'asc' },
        skip,
        take: limit
      }),
      prisma.scheduledTask.count({ where })
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get scheduled task by ID
   */
  async getTaskById(id) {
    return await prisma.scheduledTask.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: { id: true, username: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Create new scheduled task
   */
  async createTask(taskData) {
    // Calculate next run time based on frequency
    if (!taskData.next_run) {
      taskData.next_run = this.calculateNextRun(taskData.frequency, taskData.cron_expression);
    }

    return await prisma.scheduledTask.create({
      data: taskData,
      include: {
        creator: {
          select: { id: true, username: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Update scheduled task
   */
  async updateTask(id, updateData) {
    try {
      // Recalculate next run if frequency changed
      if (updateData.frequency || updateData.cron_expression) {
        updateData.next_run = this.calculateNextRun(
          updateData.frequency || undefined, 
          updateData.cron_expression || undefined
        );
      }

      return await prisma.scheduledTask.update({
        where: { id: parseInt(id) },
        data: {
          ...updateData,
          updated_at: new Date()
        },
        include: {
          creator: {
            select: { id: true, username: true, first_name: true, last_name: true }
          }
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  },

  /**
   * Toggle scheduled task active status
   */
  async toggleTask(id) {
    try {
      const task = await prisma.scheduledTask.findUnique({
        where: { id: parseInt(id) }
      });

      if (!task) return null;

      return await prisma.scheduledTask.update({
        where: { id: parseInt(id) },
        data: { 
          is_active: !task.is_active,
          updated_at: new Date()
        },
        include: {
          creator: {
            select: { id: true, username: true, first_name: true, last_name: true }
          }
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  },

  /**
   * Run scheduled task manually
   */
  async runTask(id) {
    try {
      const task = await prisma.scheduledTask.findUnique({
        where: { id: parseInt(id) }
      });

      if (!task) {
        return { success: false, message: 'Task not found' };
      }

      // Update last run and calculate next run
      const nextRun = this.calculateNextRun(task.frequency, task.cron_expression);
      
      const updatedTask = await prisma.scheduledTask.update({
        where: { id: parseInt(id) },
        data: {
          last_run: new Date(),
          next_run: nextRun,
          updated_at: new Date()
        },
        include: {
          creator: {
            select: { id: true, username: true, first_name: true, last_name: true }
          }
        }
      });

      // TODO: Implement actual task execution logic based on task_type
      // This would involve calling appropriate services/functions

      return { success: true, task: updatedTask };
    } catch (error) {
      console.error('Run task error:', error);
      return { success: false, message: 'Error running task' };
    }
  },

  /**
   * Delete scheduled task
   */
  async deleteTask(id) {
    try {
      await prisma.scheduledTask.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  },

  /**
   * Get upcoming scheduled tasks
   */
  async getUpcomingTasks(hours = 24) {
    const futureTime = new Date(Date.now() + hours * 60 * 60 * 1000);
    
    return await prisma.scheduledTask.findMany({
      where: {
        is_active: true,
        next_run: {
          gte: new Date(),
          lte: futureTime
        }
      },
      include: {
        creator: {
          select: { id: true, username: true, first_name: true, last_name: true }
        }
      },
      orderBy: { next_run: 'asc' }
    });
  },

  /**
   * Get scheduled tasks statistics
   */
  async getTasksStats() {
    const [
      totalTasks,
      activeTasks,
      tasksByType,
      tasksByFrequency
    ] = await Promise.all([
      prisma.scheduledTask.count(),
      prisma.scheduledTask.count({ where: { is_active: true } }),
      prisma.scheduledTask.groupBy({
        by: ['task_type'],
        _count: { id: true }
      }),
      prisma.scheduledTask.groupBy({
        by: ['frequency'],
        _count: { id: true }
      })
    ]);

    return {
      totalTasks,
      activeTasks,
      inactiveTasks: totalTasks - activeTasks,
      tasksByType: tasksByType.reduce((acc, item) => {
        acc[item.task_type] = item._count.id;
        return acc;
      }, {}),
      tasksByFrequency: tasksByFrequency.reduce((acc, item) => {
        acc[item.frequency] = item._count.id;
        return acc;
      }, {})
    };
  },

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Calculate next run time based on frequency
   */
  calculateNextRun(frequency, cronExpression) {
    const now = new Date();
    
    switch (frequency) {
      case 'once':
        return null; // One-time tasks don't have next run
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      case 'custom':
        // TODO: Implement cron expression parsing
        // For now, default to daily
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  },

  /**
   * Get available trigger events
   */
  getAvailableEvents() {
    return [
      {
        event: 'invoice.created',
        description: 'When a new invoice is created',
        parameters: ['invoice_id', 'client_id', 'amount']
      },
      {
        event: 'invoice.paid',
        description: 'When an invoice is marked as paid',
        parameters: ['invoice_id', 'payment_amount', 'payment_date']
      },
      {
        event: 'invoice.overdue',
        description: 'When an invoice becomes overdue',
        parameters: ['invoice_id', 'days_overdue', 'amount']
      },
      {
        event: 'expense.created',
        description: 'When a new expense is created',
        parameters: ['expense_id', 'amount', 'category_id']
      },
      {
        event: 'expense.approved',
        description: 'When an expense is approved',
        parameters: ['expense_id', 'approved_by', 'amount']
      },
      {
        event: 'contract.expiring',
        description: 'When a contract is about to expire',
        parameters: ['contract_id', 'days_until_expiry', 'client_id']
      },
      {
        event: 'milestone.completed',
        description: 'When a project milestone is completed',
        parameters: ['milestone_id', 'project_id', 'amount']
      },
      {
        event: 'payroll.processed',
        description: 'When payroll is processed',
        parameters: ['payroll_run_id', 'employee_count', 'total_amount']
      }
    ];
  },

  /**
   * Get available actions
   */
  getAvailableActions() {
    return [
      {
        type: 'send_notification',
        description: 'Send notification to user(s)',
        parameters: {
          user_ids: 'array',
          title: 'string',
          message: 'string',
          notification_type: 'string'
        }
      },
      {
        type: 'send_email',
        description: 'Send email notification',
        parameters: {
          to: 'string',
          subject: 'string',
          body: 'string',
          template: 'string'
        }
      },
      {
        type: 'create_task',
        description: 'Create a scheduled task',
        parameters: {
          name: 'string',
          task_type: 'string',
          frequency: 'string',
          parameters: 'object'
        }
      },
      {
        type: 'update_status',
        description: 'Update entity status',
        parameters: {
          entity_type: 'string',
          entity_id: 'number',
          status: 'string'
        }
      },
      {
        type: 'generate_report',
        description: 'Generate and save report',
        parameters: {
          template_id: 'number',
          parameters: 'object',
          save_as: 'string'
        }
      }
    ];
  },

  /**
   * Test automation rule
   */
  async testRule(ruleId, testData = {}) {
    try {
      const rule = await this.getRuleById(ruleId);
      
      if (!rule) {
        return { success: false, message: 'Rule not found' };
      }

      // TODO: Implement rule testing logic
      // This would involve:
      // 1. Checking if trigger conditions match test data
      // 2. Simulating action execution
      // 3. Returning results without actually executing actions

      return {
        success: true,
        rule: rule,
        testData: testData,
        result: {
          conditionsMet: true,
          actionsToExecute: rule.actions,
          message: 'Rule test simulation completed'
        }
      };
    } catch (error) {
      console.error('Test rule error:', error);
      return { success: false, message: 'Error testing rule' };
    }
  }
};

module.exports = automationModel;