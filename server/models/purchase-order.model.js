const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const purchaseOrderModel = {
  /**
   * Get all purchase orders
   */
  async getAll(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = {};

    if (filters.vendor_id) where.vendor_id = parseInt(filters.vendor_id);
    if (filters.status) where.status = filters.status;
    if (filters.start_date && filters.end_date) {
      where.order_date = {
        gte: new Date(filters.start_date),
        lte: new Date(filters.end_date)
      };
    }

    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          vendor: true,
          creator: {
            select: { id: true, username: true, email: true }
          },
          items: {
            include: {
              product: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      prisma.purchaseOrder.count({ where })
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get purchase order by ID
   */
  async getById(id) {
    return await prisma.purchaseOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        vendor: true,
        creator: {
          select: { id: true, username: true, email: true }
        },
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });
  },

  /**
   * Create purchase order
   */
  async create(data) {
    return await prisma.$transaction(async (tx) => {
      const { items, ...orderData } = data;

      // Create purchase order
      const order = await tx.purchaseOrder.create({
        data: orderData,
        include: {
          vendor: true,
          creator: {
            select: { id: true, username: true, email: true }
          }
        }
      });

      // Create purchase order items
      if (items && items.length > 0) {
        await tx.purchaseOrderItem.createMany({
          data: items.map(item => ({
            ...item,
            purchase_order_id: order.id
          }))
        });
      }

      // Fetch complete order with items
      return await tx.purchaseOrder.findUnique({
        where: { id: order.id },
        include: {
          vendor: true,
          creator: {
            select: { id: true, username: true, email: true }
          },
          items: {
            include: {
              product: true
            }
          }
        }
      });
    });
  },

  /**
   * Update purchase order
   */
  async update(id, data) {
    return await prisma.$transaction(async (tx) => {
      const { items, ...orderData } = data;

      // Update purchase order
      const order = await tx.purchaseOrder.update({
        where: { id: parseInt(id) },
        data: orderData
      });

      // Update items if provided
      if (items) {
        // Delete existing items
        await tx.purchaseOrderItem.deleteMany({
          where: { purchase_order_id: parseInt(id) }
        });

        // Create new items
        if (items.length > 0) {
          await tx.purchaseOrderItem.createMany({
            data: items.map(item => ({
              ...item,
              purchase_order_id: order.id
            }))
          });
        }
      }

      // Fetch complete order with items
      return await tx.purchaseOrder.findUnique({
        where: { id: order.id },
        include: {
          vendor: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });
    });
  },

  /**
   * Delete purchase order
   */
  async delete(id) {
    return await prisma.purchaseOrder.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Generate PO number
   */
  async generatePONumber() {
    const lastPO = await prisma.purchaseOrder.findFirst({
      orderBy: { created_at: 'desc' },
      select: { po_number: true }
    });

    if (!lastPO) {
      return 'PO-0001';
    }

    const lastNumber = parseInt(lastPO.po_number.split('-')[1]);
    const newNumber = lastNumber + 1;
    return `PO-${String(newNumber).padStart(4, '0')}`;
  },

  /**
   * Receive purchase order
   */
  async receive(id, receivedItems, warehouseId, userId) {
    return await prisma.$transaction(async (tx) => {
      // Update purchase order status
      const order = await tx.purchaseOrder.update({
        where: { id: parseInt(id) },
        data: {
          status: 'received',
          received_date: new Date()
        }
      });

      // Update received quantities and create stock movements
      for (const item of receivedItems) {
        // Update purchase order item
        await tx.purchaseOrderItem.update({
          where: { id: item.item_id },
          data: {
            quantity_received: { increment: item.quantity_received }
          }
        });

        // Update inventory
        const inventoryItem = await tx.inventoryItem.findUnique({
          where: {
            product_id_warehouse_id: {
              product_id: item.product_id,
              warehouse_id: parseInt(warehouseId)
            }
          }
        });

        if (inventoryItem) {
          await tx.inventoryItem.update({
            where: {
              product_id_warehouse_id: {
                product_id: item.product_id,
                warehouse_id: parseInt(warehouseId)
              }
            },
            data: {
              quantity_on_hand: { increment: item.quantity_received },
              quantity_available: { increment: item.quantity_received },
              last_stock_date: new Date()
            }
          });
        } else {
          await tx.inventoryItem.create({
            data: {
              product_id: item.product_id,
              warehouse_id: parseInt(warehouseId),
              quantity_on_hand: item.quantity_received,
              quantity_reserved: 0,
              quantity_available: item.quantity_received,
              last_stock_date: new Date()
            }
          });
        }

        // Create stock movement
        await tx.stockMovement.create({
          data: {
            product_id: item.product_id,
            warehouse_id: parseInt(warehouseId),
            movement_type: 'purchase',
            reference_type: 'purchase_order',
            reference_id: parseInt(id),
            quantity: item.quantity_received,
            unit_cost: item.unit_cost,
            movement_date: new Date(),
            created_by: userId
          }
        });
      }

      return order;
    });
  },

  /**
   * Get purchase order statistics
   */
  async getStats() {
    const [totalOrders, pendingOrders, totalValue] = await Promise.all([
      prisma.purchaseOrder.count(),
      prisma.purchaseOrder.count({ where: { status: { in: ['draft', 'sent', 'confirmed'] } } }),
      prisma.purchaseOrder.aggregate({
        _sum: { total_amount: true },
        where: { status: { not: 'cancelled' } }
      })
    ]);

    return {
      total_orders: totalOrders,
      pending_orders: pendingOrders,
      total_value: parseFloat(totalValue._sum.total_amount || 0)
    };
  },

  /**
   * Get orders by vendor
   */
  async getByVendor(vendorId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where: { vendor_id: parseInt(vendorId) },
        include: {
          vendor: true,
          items: {
            include: {
              product: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      prisma.purchaseOrder.count({ where: { vendor_id: parseInt(vendorId) } })
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
};

module.exports = purchaseOrderModel;
