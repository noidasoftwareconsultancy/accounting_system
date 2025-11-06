const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const contractModel = {
  /**
   * Get all contracts with pagination and filters
   */
  async getAll(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const where = {};
    
    if (filters.client_id) {
      where.client_id = parseInt(filters.client_id);
    }
    
    if (filters.project_id) {
      where.project_id = parseInt(filters.project_id);
    }
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          client: {
            select: { id: true, name: true, email: true }
          },
          project: {
            select: { id: true, name: true, status: true }
          },
          creator: {
            select: { id: true, username: true, first_name: true, last_name: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.contract.count({ where })
    ]);

    return {
      contracts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get contract by ID
   */
  async getById(id) {
    return await prisma.contract.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: {
          select: { id: true, name: true, email: true, phone: true, address: true }
        },
        project: {
          select: { id: true, name: true, status: true, budget: true }
        },
        creator: {
          select: { id: true, username: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Create new contract
   */
  async create(contractData) {
    return await prisma.contract.create({
      data: contractData,
      include: {
        client: {
          select: { id: true, name: true, email: true }
        },
        project: {
          select: { id: true, name: true, status: true }
        }
      }
    });
  },

  /**
   * Update contract
   */
  async update(id, updateData) {
    try {
      return await prisma.contract.update({
        where: { id: parseInt(id) },
        data: {
          ...updateData,
          updated_at: new Date()
        },
        include: {
          client: {
            select: { id: true, name: true, email: true }
          },
          project: {
            select: { id: true, name: true, status: true }
          }
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return null; // Contract not found
      }
      throw error;
    }
  },

  /**
   * Delete contract
   */
  async delete(id) {
    try {
      await prisma.contract.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false; // Contract not found
      }
      throw error;
    }
  },

  /**
   * Get contracts by client
   */
  async getByClient(clientId) {
    return await prisma.contract.findMany({
      where: { client_id: parseInt(clientId) },
      include: {
        project: {
          select: { id: true, name: true, status: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  },

  /**
   * Get contracts by project
   */
  async getByProject(projectId) {
    return await prisma.contract.findMany({
      where: { project_id: parseInt(projectId) },
      include: {
        client: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  },

  /**
   * Get contract statistics
   */
  async getStats() {
    const [
      totalContracts,
      activeContracts,
      completedContracts,
      totalValue,
      activeValue,
      expiringContracts
    ] = await Promise.all([
      prisma.contract.count(),
      prisma.contract.count({ where: { status: 'active' } }),
      prisma.contract.count({ where: { status: 'completed' } }),
      prisma.contract.aggregate({
        _sum: { value: true }
      }),
      prisma.contract.aggregate({
        where: { status: 'active' },
        _sum: { value: true }
      }),
      prisma.contract.count({
        where: {
          status: 'active',
          end_date: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          }
        }
      })
    ]);

    return {
      totalContracts,
      activeContracts,
      completedContracts,
      totalValue: totalValue._sum.value || 0,
      activeValue: activeValue._sum.value || 0,
      expiringContracts
    };
  },

  /**
   * Get expiring contracts
   */
  async getExpiringContracts(days = 30) {
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    
    return await prisma.contract.findMany({
      where: {
        status: 'active',
        end_date: {
          lte: futureDate,
          gte: new Date()
        }
      },
      include: {
        client: {
          select: { id: true, name: true, email: true }
        },
        project: {
          select: { id: true, name: true }
        }
      },
      orderBy: { end_date: 'asc' }
    });
  },

  /**
   * Update contract status
   */
  async updateStatus(id, status) {
    try {
      return await prisma.contract.update({
        where: { id: parseInt(id) },
        data: { 
          status,
          updated_at: new Date()
        },
        include: {
          client: {
            select: { id: true, name: true, email: true }
          },
          project: {
            select: { id: true, name: true }
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
   * Update contract document path
   */
  async updateDocument(id, documentPath) {
    try {
      return await prisma.contract.update({
        where: { id: parseInt(id) },
        data: { 
          document_path: documentPath,
          updated_at: new Date()
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }
};

module.exports = contractModel;