const prisma = require('../lib/prisma');

const dashboardController = {
  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(req, res) {
    try {
      const currentDate = new Date();
      const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
      const currentYear = currentDate.getFullYear();

      // Get all statistics in parallel
      const [
        // Revenue stats
        totalRevenue,
        monthlyRevenue,
        invoiceStats,
        
        // Expense stats
        totalExpenses,
        monthlyExpenses,
        expenseStats,
        
        // Client and project stats
        clientStats,
        projectStats,
        
        // Employee and payroll stats
        employeeStats,
        payrollStats,
        
        // Recent activities
        recentInvoices,
        recentExpenses,
        recentPayments,
        
        // Charts data
        monthlyRevenueChart,
        monthlyExpenseChart,
        expenseByCategoryChart,

        // Growth calculations
        lastMonthRevenue,
        lastMonthExpenses
      ] = await Promise.all([
        // Revenue calculations
        prisma.invoice.aggregate({
          where: { status: 'paid' },
          _sum: { total_amount: true }
        }),
        
        prisma.invoice.aggregate({
          where: {
            status: 'paid',
            created_at: { gte: currentMonth }
          },
          _sum: { total_amount: true }
        }),
        
        prisma.invoice.groupBy({
          by: ['status'],
          _count: { id: true },
          _sum: { total_amount: true }
        }),
        
        // Expense calculations
        prisma.expense.aggregate({
          _sum: { amount: true }
        }),
        
        prisma.expense.aggregate({
          where: {
            expense_date: { gte: currentMonth }
          },
          _sum: { amount: true }
        }),
        
        prisma.expense.groupBy({
          by: ['status'],
          _count: { id: true },
          _sum: { amount: true }
        }),
        
        // Client stats
        Promise.all([
          prisma.client.count(),
          prisma.client.count({
            where: {
              created_at: { gte: currentMonth }
            }
          })
        ]).then(([total, thisMonth]) => ({ total, thisMonth })),
        
        // Project stats
        Promise.all([
          prisma.project.count(),
          prisma.project.count({ where: { status: 'active' } }),
          prisma.project.count({ where: { status: 'completed' } })
        ]).then(([total, active, completed]) => ({ total, active, completed })),
        
        // Employee stats
        Promise.all([
          prisma.employee.count(),
          prisma.employee.count({ where: { termination_date: null } })
        ]).then(([total, active]) => ({ total, active })),
        
        // Payroll stats
        Promise.all([
          prisma.payslip.count({
            where: {
              created_at: { gte: currentMonth }
            }
          }),
          prisma.payslip.aggregate({
            where: {
              created_at: { gte: currentMonth }
            },
            _sum: { net_salary: true }
          })
        ]).then(([count, sum]) => ({ 
          thisMonthPayslips: count, 
          thisMonthTotal: sum._sum.net_salary || 0 
        })),
        
        // Recent activities
        prisma.invoice.findMany({
          take: 5,
          orderBy: { created_at: 'desc' },
          include: {
            client: { select: { name: true } }
          }
        }),
        
        prisma.expense.findMany({
          take: 5,
          orderBy: { created_at: 'desc' },
          include: {
            category: { select: { name: true } },
            vendor: { select: { name: true } }
          }
        }),
        
        prisma.payment.findMany({
          take: 5,
          orderBy: { created_at: 'desc' },
          include: {
            invoice: {
              include: {
                client: { select: { name: true } }
              }
            }
          }
        }),
        
        // Chart data - Monthly revenue for last 12 months
        prisma.$queryRaw`
          SELECT 
            EXTRACT(MONTH FROM created_at) as month,
            EXTRACT(YEAR FROM created_at) as year,
            SUM(total_amount) as total
          FROM invoices 
          WHERE status = 'paid' 
            AND created_at >= ${new Date(currentYear - 1, currentDate.getMonth(), 1)}
          GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
          ORDER BY year, month
        `,
        
        // Chart data - Monthly expenses for last 12 months
        prisma.$queryRaw`
          SELECT 
            EXTRACT(MONTH FROM expense_date) as month,
            EXTRACT(YEAR FROM expense_date) as year,
            SUM(amount) as total
          FROM expenses 
          WHERE expense_date >= ${new Date(currentYear - 1, currentDate.getMonth(), 1)}
          GROUP BY EXTRACT(YEAR FROM expense_date), EXTRACT(MONTH FROM expense_date)
          ORDER BY year, month
        `,
        
        // Chart data - Expenses by category
        prisma.expense.groupBy({
          by: ['category_id'],
          where: {
            expense_date: { gte: currentMonth }
          },
          _sum: { amount: true },
          _count: { id: true }
        }),

        // Last month revenue for growth calculation
        prisma.invoice.aggregate({
          where: {
            status: 'paid',
            created_at: { 
              gte: lastMonth,
              lt: currentMonth
            }
          },
          _sum: { total_amount: true }
        }),

        // Last month expenses for growth calculation
        prisma.expense.aggregate({
          where: {
            expense_date: { 
              gte: lastMonth,
              lte: lastMonthEnd
            }
          },
          _sum: { amount: true }
        })
      ]);

      // Process expense by category chart data
      const expenseCategories = await Promise.all(
        expenseByCategoryChart.map(async (item) => {
          const category = item.category_id 
            ? await prisma.expenseCategory.findUnique({
                where: { id: item.category_id },
                select: { name: true }
              })
            : { name: 'Uncategorized' };
          
          return {
            category: category?.name || 'Uncategorized',
            amount: item._sum.amount || 0,
            count: item._count.id
          };
        })
      );

      // Calculate profit/loss
      const profit = (monthlyRevenue._sum.total_amount || 0) - (monthlyExpenses._sum.amount || 0);
      const profitMargin = monthlyRevenue._sum.total_amount 
        ? (profit / monthlyRevenue._sum.total_amount) * 100 
        : 0;

      // Calculate additional metrics
      const totalInvoices = await prisma.invoice.count();
      const paidInvoices = await prisma.invoice.count({ where: { status: 'paid' } });
      const collectedInvoicesPercentage = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;
      
      // Monthly target (this could be stored in a settings table)
      const monthlyTarget = 100000; // Default target, should come from settings

      // Calculate growth percentages
      const currentMonthRevenue = monthlyRevenue._sum.total_amount || 0;
      const lastMonthRevenueAmount = lastMonthRevenue._sum.total_amount || 0;
      const revenueGrowth = lastMonthRevenueAmount > 0 
        ? ((currentMonthRevenue - lastMonthRevenueAmount) / lastMonthRevenueAmount) * 100 
        : 0;

      const currentMonthExpenses = monthlyExpenses._sum.amount || 0;
      const lastMonthExpensesAmount = lastMonthExpenses._sum.amount || 0;
      const expenseGrowth = lastMonthExpensesAmount > 0 
        ? ((currentMonthExpenses - lastMonthExpensesAmount) / lastMonthExpensesAmount) * 100 
        : 0;

      const lastMonthProfit = lastMonthRevenueAmount - lastMonthExpensesAmount;
      const profitGrowth = lastMonthProfit !== 0 
        ? ((profit - lastMonthProfit) / Math.abs(lastMonthProfit)) * 100 
        : 0;

      // Prepare dashboard response
      const dashboardData = {
        summary: {
          totalRevenue: totalRevenue._sum.total_amount || 0,
          monthlyRevenue: monthlyRevenue._sum.total_amount || 0,
          totalExpenses: totalExpenses._sum.amount || 0,
          monthlyExpenses: monthlyExpenses._sum.amount || 0,
          profit,
          profitMargin,
          totalClients: clientStats.total,
          newClientsThisMonth: clientStats.thisMonth,
          totalProjects: projectStats.total,
          activeProjects: projectStats.active,
          completedProjects: projectStats.completed,
          totalEmployees: employeeStats.total,
          activeEmployees: employeeStats.active,
          payrollThisMonth: payrollStats.thisMonthTotal,
          totalInvoices,
          paidInvoices,
          collectedInvoicesPercentage,
          monthlyTarget,
          revenueGrowth: Math.round(revenueGrowth * 10) / 10, // Round to 1 decimal
          expenseGrowth: Math.round(expenseGrowth * 10) / 10,
          profitGrowth: Math.round(profitGrowth * 10) / 10
        },
        
        invoiceStats: invoiceStats.reduce((acc, stat) => {
          acc[stat.status] = {
            count: stat._count.id,
            amount: stat._sum.total_amount || 0
          };
          return acc;
        }, {}),
        
        expenseStats: expenseStats.reduce((acc, stat) => {
          acc[stat.status] = {
            count: stat._count.id,
            amount: stat._sum.amount || 0
          };
          return acc;
        }, {}),
        
        recentActivities: {
          invoices: recentInvoices,
          expenses: recentExpenses,
          payments: recentPayments
        },
        
        charts: {
          monthlyRevenue: monthlyRevenueChart,
          monthlyExpenses: monthlyExpenseChart,
          expensesByCategory: expenseCategories
        }
      };

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Dashboard data error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard data'
      });
    }
  },

  /**
   * Get financial overview
   */
  async getFinancialOverview(req, res) {
    try {
      const { period = 'month' } = req.query;
      const currentDate = new Date();
      
      let startDate;
      switch (period) {
        case 'week':
          startDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
          break;
        case 'year':
          startDate = new Date(currentDate.getFullYear(), 0, 1);
          break;
        default: // month
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      }

      const [revenue, expenses, profit] = await Promise.all([
        prisma.invoice.aggregate({
          where: {
            status: 'paid',
            created_at: { gte: startDate }
          },
          _sum: { total_amount: true }
        }),
        
        prisma.expense.aggregate({
          where: {
            expense_date: { gte: startDate }
          },
          _sum: { amount: true }
        }),
        
        // Calculate net profit
        Promise.resolve().then(async () => {
          const rev = await prisma.invoice.aggregate({
            where: { status: 'paid', created_at: { gte: startDate } },
            _sum: { total_amount: true }
          });
          const exp = await prisma.expense.aggregate({
            where: { expense_date: { gte: startDate } },
            _sum: { amount: true }
          });
          return (rev._sum.total_amount || 0) - (exp._sum.amount || 0);
        })
      ]);

      res.json({
        success: true,
        data: {
          period,
          revenue: revenue._sum.total_amount || 0,
          expenses: expenses._sum.amount || 0,
          profit,
          profitMargin: revenue._sum.total_amount 
            ? (profit / revenue._sum.total_amount) * 100 
            : 0
        }
      });
    } catch (error) {
      console.error('Financial overview error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching financial overview'
      });
    }
  },

  /**
   * Get notifications
   */
  async getNotifications(req, res) {
    try {
      const { limit = 10 } = req.query;
      const currentDate = new Date();
      const notifications = [];

      // Get overdue invoices
      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          status: 'sent',
          due_date: { lt: currentDate }
        },
        include: {
          client: { select: { name: true } }
        },
        take: 5
      });

      overdueInvoices.forEach(invoice => {
        const daysPastDue = Math.floor((currentDate - new Date(invoice.due_date)) / (1000 * 60 * 60 * 24));
        notifications.push({
          id: `overdue-${invoice.id}`,
          type: 'warning',
          title: 'Overdue Invoice',
          message: `Invoice ${invoice.invoice_number} is ${daysPastDue} days overdue`,
          time: `${daysPastDue} days ago`,
          action: 'View Invoice',
          actionUrl: `/invoices/${invoice.id}`,
          created_at: invoice.due_date,
          read: false
        });
      });

      // Get recent payments
      const recentPayments = await prisma.payment.findMany({
        where: {
          created_at: { gte: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000) }
        },
        include: {
          invoice: {
            include: {
              client: { select: { name: true } }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 3
      });

      recentPayments.forEach(payment => {
        notifications.push({
          id: `payment-${payment.id}`,
          type: 'success',
          title: 'Payment Received',
          message: `$${payment.amount.toLocaleString()} received from ${payment.invoice.client.name}`,
          time: this.getTimeAgo(payment.created_at),
          action: 'View Payment',
          actionUrl: `/payments/${payment.id}`,
          created_at: payment.created_at,
          read: false
        });
      });

      // Get pending expense approvals
      const pendingExpenses = await prisma.expense.count({
        where: { status: 'pending' }
      });

      if (pendingExpenses > 0) {
        notifications.push({
          id: 'pending-expenses',
          type: 'info',
          title: 'Expense Approval',
          message: `${pendingExpenses} expenses pending your approval`,
          time: 'Today',
          action: 'Review',
          actionUrl: '/expenses?status=pending',
          created_at: currentDate,
          read: false
        });
      }

      // Get low cash flow warnings
      const currentMonthExpenses = await prisma.expense.aggregate({
        where: {
          expense_date: { 
            gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) 
          }
        },
        _sum: { amount: true }
      });

      const currentMonthRevenue = await prisma.invoice.aggregate({
        where: {
          status: 'paid',
          created_at: { 
            gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) 
          }
        },
        _sum: { total_amount: true }
      });

      const monthlyProfit = (currentMonthRevenue._sum.total_amount || 0) - (currentMonthExpenses._sum.amount || 0);
      
      if (monthlyProfit < 0) {
        notifications.push({
          id: 'negative-cashflow',
          type: 'error',
          title: 'Cash Flow Alert',
          message: `Monthly expenses exceed revenue by $${Math.abs(monthlyProfit).toLocaleString()}`,
          time: 'Today',
          action: 'View Report',
          actionUrl: '/reports/financial',
          created_at: currentDate,
          read: false
        });
      }

      // Sort notifications by date (newest first) and limit
      const sortedNotifications = notifications
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, parseInt(limit));

      res.json({
        success: true,
        data: sortedNotifications
      });
    } catch (error) {
      console.error('Notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching notifications'
      });
    }
  },

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      
      // For now, just return success since we're generating notifications dynamically
      // In a real implementation, you'd store notification read status in the database
      
      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Mark notification read error:', error);
      res.status(500).json({
        success: false,
        message: 'Error marking notification as read'
      });
    }
  },

  /**
   * Delete notification
   */
  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      
      // For now, just return success since we're generating notifications dynamically
      // In a real implementation, you'd delete the notification from the database
      
      res.json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting notification'
      });
    }
  },

  /**
   * Helper function to get time ago string
   */
  getTimeAgo(date) {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }
};

module.exports = dashboardController;