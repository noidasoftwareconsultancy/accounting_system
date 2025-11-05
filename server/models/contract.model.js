const prisma = require('../lib/prisma');

const contractModel = {
  /**
   * Get all contracts with pagination and filtering
   */
  async getAll(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = {};

    if (filters.client_id) where.client_id = parseInt(filters.client_id);
    if (filters.project_id) where.project_id = parseInt(filters.project_id);
    if (filters.status) where.status = filters.status;

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          client: {
            select: { id: true, name: true, email: true }
          },
          project: {
            select: { id: true, name: true }
          },
          creator: {
            select: { id: true, first_name: true, last_name: true }
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
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get contract by ID
   */
  async getById(id) {
    return prisma.contract.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: true,
        project: true,
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Create a new contract
   */
  async create(contractData) {
    return prisma.contract.create({
      data: {
        ...contractData,
        client_id: parseInt(contractData.client_id),
        project_id: contractData.project_id ? parseInt(contractData.project_id) : null,
        created_by: parseInt(contractData.created_by),
        value: contractData.value ? parseFloat(contractData.value) : null
      },
      include: {
        client: true,
        project: true,
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Update contract
   */
  async update(id, contractData) {
    return prisma.contract.update({
      where: { id: parseInt(id) },
      data: {
        ...contractData,
        client_id: contractData.client_id ? parseInt(contractData.client_id) : undefined,
        project_id: contractData.project_id ? parseInt(contractData.project_id) : undefined,
        value: contractData.value ? parseFloat(contractData.value) : undefined
      },
      include: {
        client: true,
        project: true,
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Delete contract
   */
  async delete(id) {
    return prisma.contract.delete({
      where: { id: parseInt(id) }
    });
  }
};

module.exports = contractModel;