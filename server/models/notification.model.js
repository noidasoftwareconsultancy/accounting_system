const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const notificationModel = {
  /**
   * Get all notifications with pagination and filters
   */
  async getAll(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const where = {};
    
    if (filters.user_id) {
      where.user_id = parseInt(filters.user_id);
    }
    
    if (filters.notification_type) {
      where.notification_type = filters.notification_type;
    }
    
    if (filters.is_read !== undefined) {
      where.is_read = filters.is_read === 'true';
    }
    
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { message: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
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
      prisma.notification.count({ where })
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get notification by ID
   */
  async getById(id) {
    return await prisma.notification.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, username: true, first_name: true, last_name: true, email: true }
        }
      }
    });
  },

  /**
   * Get unread notifications by user
   */
  async getUnreadByUser(userId) {
    return await prisma.notification.findMany({
      where: { 
        user_id: parseInt(userId),
        is_read: false
      },
      orderBy: { created_at: 'desc' },
      take: 50 // Limit to recent 50 unread notifications
    });
  },

  /**
   * Create new notification
   */
  async create(notificationData) {
    return await prisma.notification.create({
      data: notificationData,
      include: {
        user: {
          select: { id: true, username: true, first_name: true, last_name: true, email: true }
        }
      }
    });
  },

  /**
   * Create bulk notifications
   */
  async createBulk(data) {
    const { user_ids, title, message, notification_type, reference_type, reference_id } = data;
    
    const notificationData = user_ids.map(user_id => ({
      user_id: parseInt(user_id),
      title,
      message,
      notification_type,
      reference_type,
      reference_id: reference_id ? parseInt(reference_id) : null
    }));

    const result = await prisma.notification.createMany({
      data: notificationData
    });

    // Return the created notifications
    return await prisma.notification.findMany({
      where: {
        user_id: { in: user_ids.map(id => parseInt(id)) },
        title,
        message,
        created_at: { gte: new Date(Date.now() - 5000) } // Created in last 5 seconds
      },
      include: {
        user: {
          select: { id: true, username: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id, userId) {
    try {
      return await prisma.notification.update({
        where: { 
          id: parseInt(id),
          user_id: parseInt(userId) // Ensure user can only mark their own notifications
        },
        data: { is_read: true },
        include: {
          user: {
            select: { id: true, username: true, first_name: true, last_name: true }
          }
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return null; // Notification not found or access denied
      }
      throw error;
    }
  },

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId) {
    const result = await prisma.notification.updateMany({
      where: { 
        user_id: parseInt(userId),
        is_read: false
      },
      data: { is_read: true }
    });

    return result.count;
  },

  /**
   * Delete notification
   */
  async delete(id, userId, userRole) {
    try {
      const where = { id: parseInt(id) };
      
      // Non-admin users can only delete their own notifications
      if (!['admin', 'manager'].includes(userRole)) {
        where.user_id = parseInt(userId);
      }

      await prisma.notification.delete({ where });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false; // Notification not found or access denied
      }
      throw error;
    }
  },

  /**
   * Delete multiple notifications
   */
  async deleteBulk(notificationIds, userId, userRole) {
    const where = { id: { in: notificationIds.map(id => parseInt(id)) } };
    
    // Non-admin users can only delete their own notifications
    if (!['admin', 'manager'].includes(userRole)) {
      where.user_id = parseInt(userId);
    }

    const result = await prisma.notification.deleteMany({ where });
    return result.count;
  },

  /**
   * Get notification statistics
   */
  async getStats(userId, userRole) {
    const isAdmin = ['admin', 'manager'].includes(userRole);
    
    if (isAdmin) {
      // Admin stats - system wide
      const [
        totalNotifications,
        unreadNotifications,
        todayNotifications,
        notificationsByType
      ] = await Promise.all([
        prisma.notification.count(),
        prisma.notification.count({ where: { is_read: false } }),
        prisma.notification.count({
          where: {
            created_at: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        prisma.notification.groupBy({
          by: ['notification_type'],
          _count: { id: true }
        })
      ]);

      return {
        totalNotifications,
        unreadNotifications,
        todayNotifications,
        notificationsByType: notificationsByType.reduce((acc, item) => {
          acc[item.notification_type || 'general'] = item._count.id;
          return acc;
        }, {})
      };
    } else {
      // User stats - personal only
      const [
        totalNotifications,
        unreadNotifications,
        todayNotifications
      ] = await Promise.all([
        prisma.notification.count({ where: { user_id: parseInt(userId) } }),
        prisma.notification.count({ 
          where: { 
            user_id: parseInt(userId),
            is_read: false 
          } 
        }),
        prisma.notification.count({
          where: {
            user_id: parseInt(userId),
            created_at: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        })
      ]);

      return {
        totalNotifications,
        unreadNotifications,
        todayNotifications
      };
    }
  },

  /**
   * Broadcast notification to all users
   */
  async broadcastToAll(data) {
    // Get all active users
    const users = await prisma.user.findMany({
      select: { id: true }
    });

    const notificationData = users.map(user => ({
      user_id: user.id,
      title: data.title,
      message: data.message,
      notification_type: data.notification_type || 'system'
    }));

    await prisma.notification.createMany({
      data: notificationData
    });

    return notificationData;
  },

  /**
   * Broadcast notification to department
   */
  async broadcastToDepartment(department, data) {
    // Get users in the department
    const users = await prisma.user.findMany({
      where: { department },
      select: { id: true }
    });

    if (users.length === 0) {
      return [];
    }

    const notificationData = users.map(user => ({
      user_id: user.id,
      title: data.title,
      message: data.message,
      notification_type: data.notification_type || 'department'
    }));

    await prisma.notification.createMany({
      data: notificationData
    });

    return notificationData;
  }
};

module.exports = notificationModel;