const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const inventoryReportsModel = {
  /**
   * Get stock movement report
   */
  async getStockMovementReport(filters = {}) {
    const where = {};

    if (filters.product_id) where.product_id = parseInt(filters.product_id);
    if (filters.warehouse_id) where.warehouse_id = parseInt(filters.warehouse_id);
    if (filters.movement_type) where.movement_type = filters.movement_type;
    if (filters.start_date && filters.end_date) {
      where.movement_date = {
        gte: new Date(filters.start_date),
        lte: new Date(filters.end_date)
      };
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          include: {
            category: true
          }
        },
        warehouse: true,
        creator: {
          select: { id: true, username: true, email: true }
        }
      },
      orderBy: { movement_date: 'desc' }
    });

    // Calculate summary
    const summary = {
      total_movements: movements.length,
      by_type: {},
      total_value: 0
    };

    movements.forEach(movement => {
      // Count by type
      if (!summary.by_type[movement.movement_type]) {
        summary.by_type[movement.movement_type] = 0;
      }
      summary.by_type[movement.movement_type]++;

      // Calculate value
      if (movement.unit_cost) {
        summary.total_value += Math.abs(movement.quantity) * parseFloat(movement.unit_cost);
      }
    });

    return {
      movements,
      summary
    };
  },

  /**
   * Get inventory aging report
   */
  async getInventoryAgingReport(warehouseId = null) {
    const where = warehouseId ? { warehouse_id: parseInt(warehouseId) } : {};

    const items = await prisma.inventoryItem.findMany({
      where,
      include: {
        product: {
          include: {
            category: true
          }
        },
        warehouse: true
      }
    });

    const now = new Date();
    const agingBuckets = {
      '0-30': [],
      '31-60': [],
      '61-90': [],
      '90+': []
    };

    items.forEach(item => {
      if (item.last_stock_date) {
        const daysSinceLastMovement = Math.floor((now - new Date(item.last_stock_date)) / (1000 * 60 * 60 * 24));
        const value = item.quantity_on_hand * parseFloat(item.product.cost_price);

        const agingItem = {
          product_id: item.product_id,
          product_name: item.product.name,
          sku: item.product.sku,
          warehouse: item.warehouse.name,
          quantity: item.quantity_on_hand,
          cost_price: parseFloat(item.product.cost_price),
          total_value: value,
          days_since_movement: daysSinceLastMovement,
          last_stock_date: item.last_stock_date
        };

        if (daysSinceLastMovement <= 30) {
          agingBuckets['0-30'].push(agingItem);
        } else if (daysSinceLastMovement <= 60) {
          agingBuckets['31-60'].push(agingItem);
        } else if (daysSinceLastMovement <= 90) {
          agingBuckets['61-90'].push(agingItem);
        } else {
          agingBuckets['90+'].push(agingItem);
        }
      }
    });

    // Calculate summary
    const summary = {
      '0-30': {
        count: agingBuckets['0-30'].length,
        value: agingBuckets['0-30'].reduce((sum, item) => sum + item.total_value, 0)
      },
      '31-60': {
        count: agingBuckets['31-60'].length,
        value: agingBuckets['31-60'].reduce((sum, item) => sum + item.total_value, 0)
      },
      '61-90': {
        count: agingBuckets['61-90'].length,
        value: agingBuckets['61-90'].reduce((sum, item) => sum + item.total_value, 0)
      },
      '90+': {
        count: agingBuckets['90+'].length,
        value: agingBuckets['90+'].reduce((sum, item) => sum + item.total_value, 0)
      }
    };

    return {
      aging_buckets: agingBuckets,
      summary
    };
  },

  /**
   * Get stock turnover report
   */
  async getStockTurnoverReport(startDate, endDate, warehouseId = null) {
    const where = {
      movement_date: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    if (warehouseId) {
      where.warehouse_id = parseInt(warehouseId);
    }

    // Get all movements in the period
    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          include: {
            category: true,
            inventory_items: {
              where: warehouseId ? { warehouse_id: parseInt(warehouseId) } : {}
            }
          }
        }
      }
    });

    // Group by product
    const productTurnover = {};

    movements.forEach(movement => {
      if (!productTurnover[movement.product_id]) {
        productTurnover[movement.product_id] = {
          product_id: movement.product_id,
          product_name: movement.product.name,
          sku: movement.product.sku,
          category: movement.product.category?.name,
          sales: 0,
          purchases: 0,
          adjustments: 0,
          current_stock: movement.product.inventory_items.reduce((sum, item) => sum + item.quantity_on_hand, 0),
          cost_price: parseFloat(movement.product.cost_price)
        };
      }

      if (movement.movement_type === 'sale') {
        productTurnover[movement.product_id].sales += Math.abs(movement.quantity);
      } else if (movement.movement_type === 'purchase') {
        productTurnover[movement.product_id].purchases += Math.abs(movement.quantity);
      } else if (movement.movement_type === 'adjustment') {
        productTurnover[movement.product_id].adjustments += movement.quantity;
      }
    });

    // Calculate turnover ratio
    const turnoverData = Object.values(productTurnover).map(item => {
      const avgInventory = (item.current_stock + item.purchases - item.sales) / 2;
      const turnoverRatio = avgInventory > 0 ? item.sales / avgInventory : 0;

      return {
        ...item,
        average_inventory: avgInventory,
        turnover_ratio: turnoverRatio.toFixed(2),
        days_to_sell: avgInventory > 0 ? (365 / turnoverRatio).toFixed(0) : 0
      };
    });

    // Sort by turnover ratio
    turnoverData.sort((a, b) => parseFloat(b.turnover_ratio) - parseFloat(a.turnover_ratio));

    return {
      period: { start_date: startDate, end_date: endDate },
      products: turnoverData,
      summary: {
        total_products: turnoverData.length,
        average_turnover: (turnoverData.reduce((sum, item) => sum + parseFloat(item.turnover_ratio), 0) / turnoverData.length).toFixed(2)
      }
    };
  },

  /**
   * Get reorder report
   */
  async getReorderReport() {
    const products = await prisma.product.findMany({
      where: {
        is_active: true,
        reorder_level: { gt: 0 }
      },
      include: {
        category: true,
        inventory_items: {
          include: {
            warehouse: true
          }
        },
        product_suppliers: {
          where: { is_preferred: true },
          include: {
            vendor: true
          }
        }
      }
    });

    const reorderItems = [];

    products.forEach(product => {
      product.inventory_items.forEach(inventory => {
        if (inventory.quantity_available <= product.reorder_level) {
          reorderItems.push({
            product_id: product.id,
            product_name: product.name,
            sku: product.sku,
            category: product.category?.name,
            warehouse_id: inventory.warehouse_id,
            warehouse_name: inventory.warehouse.name,
            current_stock: inventory.quantity_available,
            reorder_level: product.reorder_level,
            reorder_quantity: product.reorder_quantity,
            shortage: product.reorder_level - inventory.quantity_available,
            preferred_supplier: product.product_suppliers[0] ? {
              vendor_id: product.product_suppliers[0].vendor_id,
              vendor_name: product.product_suppliers[0].vendor.name,
              unit_price: parseFloat(product.product_suppliers[0].unit_price),
              lead_time_days: product.product_suppliers[0].lead_time_days,
              estimated_cost: product.reorder_quantity * parseFloat(product.product_suppliers[0].unit_price)
            } : null
          });
        }
      });
    });

    // Sort by shortage (most critical first)
    reorderItems.sort((a, b) => b.shortage - a.shortage);

    const summary = {
      total_items_to_reorder: reorderItems.length,
      total_estimated_cost: reorderItems.reduce((sum, item) => 
        sum + (item.preferred_supplier?.estimated_cost || 0), 0
      )
    };

    return {
      items: reorderItems,
      summary
    };
  },

  /**
   * Get dead stock report
   */
  async getDeadStockReport(daysThreshold = 180, warehouseId = null) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

    const where = {
      last_stock_date: {
        lt: thresholdDate
      },
      quantity_on_hand: { gt: 0 }
    };

    if (warehouseId) {
      where.warehouse_id = parseInt(warehouseId);
    }

    const deadStock = await prisma.inventoryItem.findMany({
      where,
      include: {
        product: {
          include: {
            category: true
          }
        },
        warehouse: true
      }
    });

    const items = deadStock.map(item => {
      const daysSinceMovement = Math.floor((new Date() - new Date(item.last_stock_date)) / (1000 * 60 * 60 * 24));
      const value = item.quantity_on_hand * parseFloat(item.product.cost_price);

      return {
        product_id: item.product_id,
        product_name: item.product.name,
        sku: item.product.sku,
        category: item.product.category?.name,
        warehouse: item.warehouse.name,
        quantity: item.quantity_on_hand,
        cost_price: parseFloat(item.product.cost_price),
        total_value: value,
        days_since_movement: daysSinceMovement,
        last_stock_date: item.last_stock_date
      };
    });

    const summary = {
      total_items: items.length,
      total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      total_value: items.reduce((sum, item) => sum + item.total_value, 0)
    };

    return {
      threshold_days: daysThreshold,
      items,
      summary
    };
  },

  /**
   * Get inventory variance report
   */
  async getInventoryVarianceReport(startDate, endDate) {
    const adjustments = await prisma.stockAdjustment.findMany({
      where: {
        adjustment_date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        status: 'approved'
      },
      include: {
        items: true,
        creator: {
          select: { id: true, username: true }
        }
      }
    });

    const variances = [];
    let totalVarianceValue = 0;

    for (const adjustment of adjustments) {
      for (const item of adjustment.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.product_id },
          include: { category: true }
        });

        const varianceValue = Math.abs(item.quantity_change) * parseFloat(product.cost_price);
        totalVarianceValue += varianceValue;

        variances.push({
          adjustment_number: adjustment.adjustment_number,
          adjustment_date: adjustment.adjustment_date,
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          category: product.category?.name,
          quantity_before: item.quantity_before,
          quantity_after: item.quantity_after,
          variance: item.quantity_change,
          cost_price: parseFloat(product.cost_price),
          variance_value: varianceValue,
          reason: adjustment.reason,
          adjusted_by: adjustment.creator.username
        });
      }
    }

    return {
      period: { start_date: startDate, end_date: endDate },
      variances,
      summary: {
        total_adjustments: adjustments.length,
        total_variance_items: variances.length,
        total_variance_value: totalVarianceValue
      }
    };
  }
};

module.exports = inventoryReportsModel;
