const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const warehouseModel = {
  /**
   * Get all warehouses
   */
  async getAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [warehouses, total] = await Promise.all([
      prisma.warehouse.findMany({
        where: { is_active: true },
        include: {
          creator: {
            select: { id: true, username: true, email: true }
          }
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.warehouse.count({ where: { is_active: true } })
    ]);

    return {
      warehouses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get warehouse by ID
   */
  async getById(id) {
    return await prisma.warehouse.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: { id: true, username: true, email: true }
        }
      }
    });
  },

  /**
   * Get warehouse by code
   */
  async getByCode(code) {
    return await prisma.warehouse.findUnique({
      where: { code }
    });
  },

  /**
   * Create warehouse
   */
  async create(data) {
    return await prisma.warehouse.create({
      data,
      include: {
        creator: {
          select: { id: true, username: true, email: true }
        }
      }
    });
  },

  /**
   * Update warehouse
   */
  async update(id, data) {
    return await prisma.warehouse.update({
      where: { id: parseInt(id) },
      data
    });
  },

  /**
   * Delete warehouse (soft delete)
   */
  async delete(id) {
    return await prisma.warehouse.update({
      where: { id: parseInt(id) },
      data: { is_active: false }
    });
  },

  /**
   * Get warehouse inventory summary
   */
  async getInventorySummary(id) {
    const items = await prisma.inventoryItem.findMany({
      where: { warehouse_id: parseInt(id) },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });

    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity_on_hand, 0);
    const totalValue = items.reduce((sum, item) => 
      sum + (item.quantity_on_hand * parseFloat(item.product.cost_price)), 0
    );

    return {
      warehouse_id: parseInt(id),
      total_products: totalItems,
      total_quantity: totalQuantity,
      total_value: totalValue,
      items: items.map(item => ({
        product_id: item.product_id,
        product_name: item.product.name,
        sku: item.product.sku,
        category: item.product.category?.name,
        quantity_on_hand: item.quantity_on_hand,
        quantity_reserved: item.quantity_reserved,
        quantity_available: item.quantity_available,
        unit_value: parseFloat(item.product.cost_price),
        total_value: item.quantity_on_hand * parseFloat(item.product.cost_price)
      }))
    };
  }
};

module.exports = warehouseModel;
