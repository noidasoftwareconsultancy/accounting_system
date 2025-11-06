const prisma = require('../lib/prisma');

const accountTypeModel = {
  /**
   * Get all account types
   */
  async getAll() {
    return prisma.accountType.findMany({
      include: {
        _count: {
          select: { accounts: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  },

  /**
   * Get account type by ID
   */
  async getById(id) {
    return prisma.accountType.findUnique({
      where: { id: parseInt(id) },
      include: {
        accounts: {
          include: {
            _count: {
              select: { ledger_entries: true }
            }
          }
        }
      }
    });
  },

  /**
   * Create new account type
   */
  async create(data) {
    return prisma.accountType.create({
      data: {
        name: data.name,
        description: data.description
      }
    });
  },

  /**
   * Update account type
   */
  async update(id, data) {
    return prisma.accountType.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        description: data.description
      }
    });
  },

  /**
   * Delete account type
   */
  async delete(id) {
    // Check if account type has associated accounts
    const accountCount = await prisma.account.count({
      where: { type_id: parseInt(id) }
    });

    if (accountCount > 0) {
      throw new Error('Cannot delete account type with associated accounts');
    }

    return prisma.accountType.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Get account type statistics
   */
  async getStats() {
    const [totalTypes, totalAccounts] = await Promise.all([
      prisma.accountType.count(),
      prisma.account.count()
    ]);

    const typeDistribution = await prisma.accountType.findMany({
      include: {
        _count: {
          select: { accounts: true }
        }
      }
    });

    return {
      totalTypes,
      totalAccounts,
      distribution: typeDistribution.map(type => ({
        name: type.name,
        accountCount: type._count.accounts
      }))
    };
  }
};

module.exports = accountTypeModel;