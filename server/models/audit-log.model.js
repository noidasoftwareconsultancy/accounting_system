const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const auditLogModel = {
  /**
   * Get all audit logs with pagination and filters
   */
  async getAll(filters = {}, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    
    const where = {};
    
    if (filters.user_id) {
      where.user_id = parseInt(filters.user_id);
    }
    
    if (filters.action) {
      where.action = filters.action;
    }
    
    if (filters.entity_type) {
      where.entity_type = filters.entity_type;
    }
    
    if (filters.entity_id) {
      where.entity_id = parseInt(filters.entity_id);
    }
    
    if (filters.start_date && filters.end_date) {
      where.created_at = {
        gte: new Date(filters.start_date),
        lte: new Date(filters.end_date)
      };
    } else if (filters.start_date) {
      where.created_at = {
        gte: new Date(filters.start_date)
      };
    } else if (filters.end_date) {
      where.created_at = {
        lte: new Date(filters.end_date)
      };
    }
    
    if (filters.search) {
      where.OR = [
        { action: { contains: filters.search, mode: 'insensitive' } },
        { entity_type: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, first_name: true, last_name: true, email: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      auditLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get audit log by ID
   */
  async getById(id) {
    return await prisma.auditLog.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, username: true, first_name: true, last_name: true, email: true }
        }
      }
    });
  },

  /**
   * Get audit logs by entity
   */
  async getByEntity(entityType, entityId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const where = {
      entity_type: entityType,
      entity_id: parseInt(entityId)
    };

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, first_name: true, last_name: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      auditLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get audit logs by user
   */
  async getByUser(userId, filters = {}, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    
    const where = {
      user_id: parseInt(userId)
    };
    
    if (filters.action) {
      where.action = filters.action;
    }
    
    if (filters.entity_type) {
      where.entity_type = filters.entity_type;
    }
    
    if (filters.start_date && filters.end_date) {
      where.created_at = {
        gte: new Date(filters.start_date),
        lte: new Date(filters.end_date)
      };
    }

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, first_name: true, last_name: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      auditLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Create new audit log entry
   */
  async create(logData) {
    return await prisma.auditLog.create({
      data: logData,
      include: {
        user: {
          select: { id: true, username: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Get audit log statistics
   */
  async getStats(timeframe = '30d') {
    let startDate;
    const endDate = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      totalLogs,
      logsInTimeframe,
      logsByAction,
      logsByEntityType,
      topUsers,
      dailyActivity
    ] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({
        where: {
          created_at: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where: {
          created_at: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),
      prisma.auditLog.groupBy({
        by: ['entity_type'],
        where: {
          created_at: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),
      prisma.auditLog.groupBy({
        by: ['user_id'],
        where: {
          created_at: {
            gte: startDate,
            lte: endDate
          },
          user_id: { not: null }
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),
      this.getDailyActivity(startDate, endDate)
    ]);

    // Get user details for top users
    const userIds = topUsers.map(u => u.user_id).filter(id => id !== null);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, first_name: true, last_name: true }
    });

    const topUsersWithDetails = topUsers.map(userStat => {
      const user = users.find(u => u.id === userStat.user_id);
      return {
        ...userStat,
        user: user || { id: userStat.user_id, username: 'Unknown' }
      };
    });

    return {
      totalLogs,
      logsInTimeframe,
      timeframe,
      logsByAction: logsByAction.reduce((acc, item) => {
        acc[item.action] = item._count.id;
        return acc;
      }, {}),
      logsByEntityType: logsByEntityType.reduce((acc, item) => {
        acc[item.entity_type] = item._count.id;
        return acc;
      }, {}),
      topUsers: topUsersWithDetails,
      dailyActivity
    };
  },

  /**
   * Get daily activity for chart
   */
  async getDailyActivity(startDate, endDate) {
    const logs = await prisma.auditLog.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        created_at: true,
        action: true
      }
    });

    // Group by date
    const dailyStats = {};
    logs.forEach(log => {
      const date = log.created_at.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = 0;
      }
      dailyStats[date]++;
    });

    // Fill in missing dates with 0
    const result = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        count: dailyStats[dateStr] || 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  },

  /**
   * Cleanup old audit logs
   */
  async cleanup(days = 365) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const result = await prisma.auditLog.deleteMany({
      where: {
        created_at: {
          lt: cutoffDate
        }
      }
    });

    return {
      deletedCount: result.count,
      cutoffDate: cutoffDate.toISOString()
    };
  },

  /**
   * Export audit logs
   */
  async exportLogs(filters = {}, format = 'json') {
    const where = {};
    
    if (filters.user_id) {
      where.user_id = parseInt(filters.user_id);
    }
    
    if (filters.action) {
      where.action = filters.action;
    }
    
    if (filters.entity_type) {
      where.entity_type = filters.entity_type;
    }
    
    if (filters.start_date && filters.end_date) {
      where.created_at = {
        gte: new Date(filters.start_date),
        lte: new Date(filters.end_date)
      };
    }

    const auditLogs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, username: true, first_name: true, last_name: true, email: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 10000 // Limit export to 10k records
    });

    if (format === 'csv') {
      return this.convertToCSV(auditLogs);
    }

    return JSON.stringify(auditLogs, null, 2);
  },

  /**
   * Convert audit logs to CSV format
   */
  convertToCSV(auditLogs) {
    const headers = [
      'ID',
      'User ID',
      'Username',
      'Action',
      'Entity Type',
      'Entity ID',
      'IP Address',
      'User Agent',
      'Created At'
    ];

    const rows = auditLogs.map(log => [
      log.id,
      log.user_id || '',
      log.user ? log.user.username : '',
      log.action,
      log.entity_type || '',
      log.entity_id || '',
      log.ip_address || '',
      log.user_agent || '',
      log.created_at.toISOString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  },

  /**
   * Log user action (helper method for other controllers)
   */
  async logAction(userId, action, entityType, entityId, oldValues = null, newValues = null, ipAddress = null, userAgent = null) {
    try {
      return await this.create({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: ipAddress,
        user_agent: userAgent
      });
    } catch (error) {
      console.error('Error logging audit action:', error);
      // Don't throw error to avoid breaking main functionality
      return null;
    }
  }
};

module.exports = auditLogModel;