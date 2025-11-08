const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const stockAdjustmentModel = {
  async getAll(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = {};

    if (filters.warehouse_id) where.warehouse_id = parseInt(filters.warehouse_id);
    if (filters.status) where.status = filters.status;

    const [adjustments, total] = await Promise.all([
      prisma.stockAdjustment.findMany({
        where,
        include: {
          creator: {
            select: { id: true, username: true, email: true }
          },
          items: true
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      prisma.stockAdjustment.count({ where })
    ]);

    return {
      adjustments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  async getById(id) {
    return await prisma.stockAdjustment.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: { id: true, username: true, email: true }
        },
        items: true
      }
    });
  },

  async create(data) {
    return await prisma.$transaction(async (tx) => {
      const { items, ...adjustmentData } = data;

      const adjustment = await tx.stockAdjustment.create({
        data: adjustmentData,
        include: {
          creator: {
            select: { id: true, username: true, email: true }
          }
        }
      });

      if (items && items.length > 0) {
        await tx.stockAdjustmentItem.createMany({
          data: items.map(item => ({
            ...item,
            adjustment_id: adjustment.id
          }))
        });
      }

      return await tx.stockAdjustment.findUnique({
        where: { id: adjustment.id },
        include: {
          creator: {
            select: { id: true, username: true, email: true }
          },
          items: true
        }
      });
    });
  },

  async approve(id, warehouseId, userId) {
    return await prisma.$transaction(async (tx) => {
      const adjustment = await tx.stockAdjustment.findUnique({
        where: { id: parseInt(id) },
        include: { items: true }
      });

      if (!adjustment) {
        throw new Error('Adjustment not found');
      }

      if (adjustment.status !== 'draft') {
        throw new Error('Adjustment already processed');
      }

      await tx.stockAdjustment.update({
        where: { id: parseInt(id) },
        data: { status: 'approved' }
      });

      for (const item of adjustment.items) {
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
              quantity_on_hand: item.quantity_after,
              quantity_available: item.quantity_after - inventoryItem.quantity_reserved,
              last_stock_date: new Date()
            }
          });
        }

        await tx.stockMovement.create({
          data: {
            product_id: item.product_id,
            warehouse_id: parseInt(warehouseId),
            movement_type: 'adjustment',
            reference_type: 'stock_adjustment',
            reference_id: parseInt(id),
            quantity: item.quantity_change,
            movement_date: new Date(),
            created_by: userId
          }
        });
      }

      return adjustment;
    });
  },

  async cancel(id) {
    return await prisma.stockAdjustment.update({
      where: { id: parseInt(id) },
      data: { status: 'cancelled' }
    });
  },

  async generateAdjustmentNumber() {
    const lastAdjustment = await prisma.stockAdjustment.findFirst({
      orderBy: { created_at: 'desc' },
      select: { adjustment_number: true }
    });

    if (!lastAdjustment) {
      return 'ADJ-0001';
    }

    const lastNumber = parseInt(lastAdjustment.adjustment_number.split('-')[1]);
    const newNumber = lastNumber + 1;
    return `ADJ-${String(newNumber).padStart(4, '0')}`;
  }
};

module.exports = stockAdjustmentModel;
