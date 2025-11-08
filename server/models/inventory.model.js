const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const inventoryModel = {
  /**
   * Get all inventory items with filters
   */
  async getAll(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = {};

    if (filters.product_id) where.product_id = parseInt(filters.product_id);
    if (filters.warehouse_id) where.warehouse_id = parseInt(filters.warehouse_id);
    if (filters.low_stock === 'true') {
      where.product = {
        reorder_level: { gt: 0 }
      };
      where.quantity_available = { lte: prisma.raw('products.reorder_level') };
    }

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        include: {
          product: {
            include: {
              category: true
            }
          },
          warehouse: true
        },
        skip,
        take: limit,
        orderBy: { updated_at: 'desc' }
      }),
      prisma.inventoryItem.count({ where })
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get inventory by product and warehouse
   */
  async getByProductAndWarehouse(productId, warehouseId) {
    return await prisma.inventoryItem.findUnique({
      where: {
        product_id_warehouse_id: {
          product_id: parseInt(productId),
          warehouse_id: parseInt(warehouseId)
        }
      },
      include: {
        product: {
          include: {
            category: true
          }
        },
        warehouse: true
      }
    });
  },

  /**
   * Get inventory by product across all warehouses
   */
  async getByProduct(productId) {
    return await prisma.inventoryItem.findMany({
      where: { product_id: parseInt(productId) },
      include: {
        warehouse: true
      }
    });
  },

  /**
   * Get inventory by warehouse
   */
  async getByWarehouse(warehouseId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where: { warehouse_id: parseInt(warehouseId) },
        include: {
          product: {
            include: {
              category: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { product: { name: 'asc' } }
      }),
      prisma.inventoryItem.count({ where: { warehouse_id: parseInt(warehouseId) } })
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Update inventory quantity
   */
  async updateQuantity(productId, warehouseId, quantityChange, movementType, referenceType = null, referenceId = null, userId) {
    return await prisma.$transaction(async (tx) => {
      // Get or create inventory item
      let inventoryItem = await tx.inventoryItem.findUnique({
        where: {
          product_id_warehouse_id: {
            product_id: parseInt(productId),
            warehouse_id: parseInt(warehouseId)
          }
        }
      });

      if (!inventoryItem) {
        inventoryItem = await tx.inventoryItem.create({
          data: {
            product_id: parseInt(productId),
            warehouse_id: parseInt(warehouseId),
            quantity_on_hand: 0,
            quantity_reserved: 0,
            quantity_available: 0
          }
        });
      }

      // Update quantities
      const newQuantityOnHand = inventoryItem.quantity_on_hand + quantityChange;
      const newQuantityAvailable = newQuantityOnHand - inventoryItem.quantity_reserved;

      const updatedItem = await tx.inventoryItem.update({
        where: {
          product_id_warehouse_id: {
            product_id: parseInt(productId),
            warehouse_id: parseInt(warehouseId)
          }
        },
        data: {
          quantity_on_hand: newQuantityOnHand,
          quantity_available: newQuantityAvailable,
          last_stock_date: new Date()
        },
        include: {
          product: true,
          warehouse: true
        }
      });

      // Record stock movement
      await tx.stockMovement.create({
        data: {
          product_id: parseInt(productId),
          warehouse_id: parseInt(warehouseId),
          movement_type: movementType,
          reference_type: referenceType,
          reference_id: referenceId,
          quantity: quantityChange,
          movement_date: new Date(),
          created_by: userId
        }
      });

      return updatedItem;
    });
  },

  /**
   * Reserve inventory
   */
  async reserveInventory(productId, warehouseId, quantity) {
    return await prisma.inventoryItem.update({
      where: {
        product_id_warehouse_id: {
          product_id: parseInt(productId),
          warehouse_id: parseInt(warehouseId)
        }
      },
      data: {
        quantity_reserved: { increment: quantity },
        quantity_available: { decrement: quantity }
      }
    });
  },

  /**
   * Release reserved inventory
   */
  async releaseReservedInventory(productId, warehouseId, quantity) {
    return await prisma.inventoryItem.update({
      where: {
        product_id_warehouse_id: {
          product_id: parseInt(productId),
          warehouse_id: parseInt(warehouseId)
        }
      },
      data: {
        quantity_reserved: { decrement: quantity },
        quantity_available: { increment: quantity }
      }
    });
  },

  /**
   * Get low stock items
   */
  async getLowStockItems() {
    const items = await prisma.$queryRaw`
      SELECT 
        ii.*,
        p.name as product_name,
        p.sku,
        p.reorder_level,
        p.reorder_quantity,
        w.name as warehouse_name
      FROM inventory_items ii
      JOIN products p ON ii.product_id = p.id
      JOIN warehouses w ON ii.warehouse_id = w.id
      WHERE ii.quantity_available <= p.reorder_level
        AND p.reorder_level > 0
        AND p.is_active = true
      ORDER BY ii.quantity_available ASC
    `;

    return items;
  },

  /**
   * Get inventory valuation
   */
  async getInventoryValuation(warehouseId = null) {
    const where = warehouseId ? { warehouse_id: parseInt(warehouseId) } : {};

    const items = await prisma.inventoryItem.findMany({
      where,
      include: {
        product: true,
        warehouse: true
      }
    });

    const valuation = items.map(item => ({
      product_id: item.product_id,
      product_name: item.product.name,
      sku: item.product.sku,
      warehouse_id: item.warehouse_id,
      warehouse_name: item.warehouse.name,
      quantity: item.quantity_on_hand,
      cost_price: item.product.cost_price,
      total_value: item.quantity_on_hand * parseFloat(item.product.cost_price)
    }));

    const totalValue = valuation.reduce((sum, item) => sum + item.total_value, 0);

    return {
      items: valuation,
      total_value: totalValue
    };
  },

  /**
   * Get inventory statistics
   */
  async getStats() {
    const [totalProducts, totalWarehouses, lowStockCount, totalValue] = await Promise.all([
      prisma.product.count({ where: { is_active: true } }),
      prisma.warehouse.count({ where: { is_active: true } }),
      prisma.$queryRaw`
        SELECT COUNT(DISTINCT ii.product_id) as count
        FROM inventory_items ii
        JOIN products p ON ii.product_id = p.id
        WHERE ii.quantity_available <= p.reorder_level
          AND p.reorder_level > 0
          AND p.is_active = true
      `,
      prisma.$queryRaw`
        SELECT SUM(ii.quantity_on_hand * p.cost_price) as total
        FROM inventory_items ii
        JOIN products p ON ii.product_id = p.id
        WHERE p.is_active = true
      `
    ]);

    return {
      total_products: totalProducts,
      total_warehouses: totalWarehouses,
      low_stock_items: parseInt(lowStockCount[0]?.count || 0),
      total_inventory_value: parseFloat(totalValue[0]?.total || 0)
    };
  }
};

module.exports = inventoryModel;
