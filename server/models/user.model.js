const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

const userModel = {
  /**
   * Get all users with pagination
   */
  async getAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          department: true,
          created_at: true,
          updated_at: true
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count()
    ]);
    
    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get user by ID
   */
  async getById(id) {
    return prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        department: true,
        created_at: true,
        updated_at: true
      }
    });
  },

  /**
   * Get user by email
   */
  async getByEmail(email) {
    return prisma.user.findUnique({
      where: { email }
    });
  },

  /**
   * Get user by username
   */
  async getByUsername(username) {
    return prisma.user.findUnique({
      where: { username }
    });
  },

  /**
   * Create a new user
   */
  async create(userData) {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);
    
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        department: true,
        created_at: true,
        updated_at: true
      }
    });
    
    return user;
  },

  /**
   * Update user
   */
  async update(id, userData) {
    // If password is being updated, hash it
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    
    return prisma.user.update({
      where: { id: parseInt(id) },
      data: userData,
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        department: true,
        created_at: true,
        updated_at: true
      }
    });
  },

  /**
   * Delete user
   */
  async delete(id) {
    return prisma.user.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Validate user password
   */
  async validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
};

module.exports = userModel;