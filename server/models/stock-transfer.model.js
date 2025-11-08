const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const stockTransferModel = {
  /**
   * Get all stock transfers
   */
  async getAll(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = {};

    if (filters.from_warehouse_id) where.from_warehouse_id = parseInt(filters.from_warehouse_id);
    if (filters.to_warehouse_id) where.to_warehouse_id = parseInt(filters.to_warehouse_id);
    if (filters.status) where.status = filters.status;

    const [transfers, total] = await Promise.all([
      prisma.stockTransfer.findMany({
        where,
        include: {
          from_warehouse: true,
          to_warehouse: true,
          creator: {
            select: { id: true, username: true, email: true }
          },
          items: true
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      prisma.stockTransfer.count({ where })
    ]);

    return {
      transfers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get stock transfer by ID
   */
  async getById(id) {
    return await prisma.stockTransfer.findUnique({
      where: { id: parseInt(id) },
      include: {
        from_warehouse: true,
        to_warehouse: true,
        creator: {
          select: { id: true, username: true, email: true }
        },
        items: true
      }
    });
  },

  /**
   * Create stock transfer
   */
  async create(data) {
    return await prisma.$transaction(async (tx) => {
      const { items, ...transferData } = data;

      // Create stock transfer
      const transfer = await tx.stockTransfer.create({
        data: transferData,
        include: {
          from_warehouse: true,
          to_warehouse: true,
          creator: {
            select: { id: true, username: true, email: true }
          }
        }
      });

      // Create stock transfer items
      if (items && items.length > 0) {
        await tx.stockTransferItem.createMany({
          data: items.map(item => ({
            ...item,
            transfer_id: transfer.id
          }))
        });
      }

      // Fetch complete transfer with items
      return await tx.stockTransfer.findUnique({
        where: { id: transfer.id },
        include: {
          from_warehouse: true,
          to_warehouse: true,
          creator: {
            select: { id: true, username: true, email: true }
          },
          items: true
        }
      });
    });
  },

  /**
   * Update stock transfer
   */
  async update(id, data) {
    return await prisma.$transaction(async (tx) => {
      const { items, ...transferData } = data;

      // Update stock transfer
      const transfer = await tx.stockTransfer.update({
        where: { id: parseInt(id) },
        data: transferData
      });

      // Update items if provided
      if (items) {
        // Delete existing items
        await tx.stockTransferItem.deleteMany({
          where: { transfer_id: parseInt(id) }
        });

        // Create new items
        if (items.length > 0) {
          await tx.stockTransferItem.createMany({
            data: items.map(item => ({
              ...item,
              transfer_id: transfer.id
            }))
          });
        }
      }

      // Fetch complete transfer with items
      return await tx.stockTransfer.findUnique({
        where: { id: transfer.id },
        include: {
          from_warehouse: true,
          to_warehouse: true,
          items: true
        }
      });
    });
  },

  /**
   * Delete stock transfer
   */
  async delete(id) {
    return await prisma.stockTransfer.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Generate transfer number
   */
  async generateTransferNumber() {
    const lastTransfer = await prisma.stockTransfer.findFirst({
      orderBy: { created_at: 'desc' },
      select: { transfer_number: true }
    });

    if (!lastTransfer) {
      return 'ST-0001';
    }

    const lastNumber = parseInt(lastTransfer.transfer_number.split('-')[1]);
    const newNumber = lastNumber + 1;
    return `ST-${String(newNumber).padStart(4, '0')}`;
  },

  /**
   * Process stock transfer (move inventory)
   */
  async process(id, userId) {
    return await prisma.$transaction(async (tx) => {
      const transfer = await tx.stockTransfer.findUnique({
        where: { id: parseInt(id) },
        include: { items: true }
      });

      if (!transfer) {
        throw new Error('Transfer not found');
      }

      if (transfer.status !== 'pending') {
        throw new Error('Transfer already processed');
      }

      // Update transfer status
      await tx.stockTransfer.update({
        where: { id: parseInt(id) },
        data: { status: 'in_transit' }
      });

      // Deduct from source warehouse
      for (const item of transfer.items) {
        await tx.inventoryItem.update({
          where: {
            product_id_warehouse_id: {
              product_id: item.product_id,
              warehouse_id: transfer.from_warehouse_id
            }
          },
          data: {
            quantity_on_hand: { decrement: item.quantity },
            quantity_available: { decrement: item.quantity },
            last_stock_date: new Date()
          }
        });

        // Create stock movement for source
        await tx.stockMovement.create({
          data: {
            product_id: item.product_id,
            warehouse_id: transfer.from_warehouse_id,
            movement_type: 'transfer',
            reference_type: 'stock_transfer',
            reference_id: parseInt(id),
            quantity: -item.quantity,
            movement_date: new Date(),
            created_by: userId
          }
        });
      }

      return transfer;
    });
  },

  /**
   * Complete stock transfer (receive at destination)
   */
  async complete(id, receivedItems, userId) {
    return await prisma.$transaction(async (tx) => {
      const transfer = await tx.stockTransfer.findUnique({
        where: { id: parseInt(id) },
        include: { items: true }
      });

      if (!transfer) {
        throw new Error('Transfer not found');
      }

      if (transfer.status !== 'in_transit') {
        throw new Error('Transfer not in transit');
      }

      // Update transfer status
      await tx.stockTransfer.update({
        where: { id: parseInt(id) },
        data: { status: 'completed' }
      });

      // Add to destination warehouse
      for (const receivedItem of receivedItems) {
        // Update transfer item
        await tx.stockTransferItem.update({
          where: { id: receivedItem.item_id },
          data: { quantity_received: receivedItem.quantity_received }
        });

        // Update or create inventory at destination
        const inventoryItem = await tx.inventoryItem.findUnique({
          where: {
            product_id_warehouse_id: {
              product_id: receivedItem.product_id,
              warehouse_id: transfer.to_warehouse_id
            }
          }
        });

        if (inventoryItem) {
          await tx.inventoryItem.update({
            where: {
              product_id_warehouse_id: {
                product_id: receivedItem.product_id,
                warehouse_id: transfer.to_warehouse_id
              }
            },
            data: {
              quantity_on_hand: { increment: receivedItem.quantity_received },
              quantity_available: { increment: receivedItem.quantity_received },
              last_stock_date: new Date()
            }
          });
        } else {
          await tx.inventoryItem.create({
            data: {
              product_id: receivedItem.product_id,
              warehouse_id: transfer.to_warehouse_id,
              quantity_on_hand: receivedItem.quantity_received,
              quantity_reserved: 0,
              quantity_available: receivedItem.quantity_received,
              last_stock_date: new Date()
            }
          });
        }

        // Create stock movement for destination
        await tx.stockMovement.create({
          data: {
            product_id: receivedItem.product_id,
            warehouse_id: transfer.to_warehouse_id,
            movement_type: 'transfer',
            reference_type: 'stock_transfer',
            reference_id: parseInt(id),
            quantity: receivedItem.quantity_received,
            movement_date: new Date(),
            created_by: userId
          }
        });
      }

      return transfer;
    });
  },

  /**
   * Cancel stock transfer
   */
  async cancel(id) {
    return await prisma.stockTransfer.update({
      where: { id: parseInt(id) },
      data: { status: 'cancelled' }
    });
  }
};

module.exports = stockTransferModel;
