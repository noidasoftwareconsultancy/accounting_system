const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Invoice-Inventory Integration Model
 * Handles automatic inventory deduction when invoices are paid
 */
const invoiceInventoryModel = {
    /**
     * Process invoice payment and update inventory
     */
    async processInvoicePayment(invoiceId, warehouseId, userId) {
        return await prisma.$transaction(async (tx) => {
            // Get invoice with items
            const invoice = await tx.invoice.findUnique({
                where: { id: parseInt(invoiceId) },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });

            if (!invoice) {
                throw new Error('Invoice not found');
            }

            if (invoice.status === 'paid') {
                throw new Error('Invoice already paid');
            }

            // Process each invoice item that has a product
            for (const item of invoice.items) {
                if (item.product_id) {
                    // Check inventory availability
                    const inventoryItem = await tx.inventoryItem.findUnique({
                        where: {
                            product_id_warehouse_id: {
                                product_id: item.product_id,
                                warehouse_id: parseInt(warehouseId)
                            }
                        }
                    });

                    if (!inventoryItem) {
                        throw new Error(`Product ${item.product?.name || item.product_id} not available in warehouse`);
                    }

                    const quantityNeeded = parseInt(item.quantity);
                    if (inventoryItem.quantity_available < quantityNeeded) {
                        throw new Error(`Insufficient stock for product ${item.product?.name || item.product_id}. Available: ${inventoryItem.quantity_available}, Required: ${quantityNeeded}`);
                    }

                    // Deduct from inventory
                    await tx.inventoryItem.update({
                        where: {
                            product_id_warehouse_id: {
                                product_id: item.product_id,
                                warehouse_id: parseInt(warehouseId)
                            }
                        },
                        data: {
                            quantity_on_hand: { decrement: quantityNeeded },
                            quantity_available: { decrement: quantityNeeded },
                            last_stock_date: new Date()
                        }
                    });

                    // Create stock movement record
                    await tx.stockMovement.create({
                        data: {
                            product_id: item.product_id,
                            warehouse_id: parseInt(warehouseId),
                            movement_type: 'sale',
                            reference_type: 'invoice',
                            reference_id: parseInt(invoiceId),
                            quantity: -quantityNeeded,
                            unit_cost: item.product?.cost_price || 0,
                            notes: `Invoice ${invoice.invoice_number}`,
                            movement_date: new Date(),
                            created_by: userId
                        }
                    });
                }
            }

            // Update invoice status
            await tx.invoice.update({
                where: { id: parseInt(invoiceId) },
                data: { status: 'paid' }
            });

            return invoice;
        });
    },

    /**
     * Reserve inventory for pending invoice
     */
    async reserveInventoryForInvoice(invoiceId, warehouseId) {
        return await prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.findUnique({
                where: { id: parseInt(invoiceId) },
                include: {
                    items: {
                        where: {
                            product_id: { not: null }
                        }
                    }
                }
            });

            if (!invoice) {
                throw new Error('Invoice not found');
            }

            for (const item of invoice.items) {
                if (item.product_id) {
                    const quantityNeeded = parseInt(item.quantity);

                    // Check if inventory exists
                    const inventoryItem = await tx.inventoryItem.findUnique({
                        where: {
                            product_id_warehouse_id: {
                                product_id: item.product_id,
                                warehouse_id: parseInt(warehouseId)
                            }
                        }
                    });

                    if (!inventoryItem) {
                        throw new Error(`Product ${item.product_id} not available in warehouse`);
                    }

                    if (inventoryItem.quantity_available < quantityNeeded) {
                        throw new Error(`Insufficient stock for product ${item.product_id}`);
                    }

                    // Reserve inventory
                    await tx.inventoryItem.update({
                        where: {
                            product_id_warehouse_id: {
                                product_id: item.product_id,
                                warehouse_id: parseInt(warehouseId)
                            }
                        },
                        data: {
                            quantity_reserved: { increment: quantityNeeded },
                            quantity_available: { decrement: quantityNeeded }
                        }
                    });
                }
            }

            return invoice;
        });
    },

    /**
     * Release reserved inventory (e.g., when invoice is cancelled)
     */
    async releaseReservedInventoryForInvoice(invoiceId, warehouseId) {
        return await prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.findUnique({
                where: { id: parseInt(invoiceId) },
                include: {
                    items: {
                        where: {
                            product_id: { not: null }
                        }
                    }
                }
            });

            if (!invoice) {
                throw new Error('Invoice not found');
            }

            for (const item of invoice.items) {
                if (item.product_id) {
                    const quantityToRelease = parseInt(item.quantity);

                    await tx.inventoryItem.update({
                        where: {
                            product_id_warehouse_id: {
                                product_id: item.product_id,
                                warehouse_id: parseInt(warehouseId)
                            }
                        },
                        data: {
                            quantity_reserved: { decrement: quantityToRelease },
                            quantity_available: { increment: quantityToRelease }
                        }
                    });
                }
            }

            return invoice;
        });
    },

    /**
     * Check inventory availability for invoice
     */
    async checkInventoryAvailability(invoiceId, warehouseId) {
        const invoice = await prisma.invoice.findUnique({
            where: { id: parseInt(invoiceId) },
            include: {
                items: {
                    where: {
                        product_id: { not: null }
                    },
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        const availability = [];

        for (const item of invoice.items) {
            if (item.product_id) {
                const inventoryItem = await prisma.inventoryItem.findUnique({
                    where: {
                        product_id_warehouse_id: {
                            product_id: item.product_id,
                            warehouse_id: parseInt(warehouseId)
                        }
                    }
                });

                const quantityNeeded = parseInt(item.quantity);
                const available = inventoryItem?.quantity_available || 0;

                availability.push({
                    product_id: item.product_id,
                    product_name: item.product?.name,
                    sku: item.product?.sku,
                    quantity_needed: quantityNeeded,
                    quantity_available: available,
                    is_available: available >= quantityNeeded
                });
            }
        }

        return {
            invoice_id: invoiceId,
            warehouse_id: warehouseId,
            all_available: availability.every(item => item.is_available),
            items: availability
        };
    },

    /**
     * Get invoice items with inventory status
     */
    async getInvoiceWithInventoryStatus(invoiceId, warehouseId) {
        const invoice = await prisma.invoice.findUnique({
            where: { id: parseInt(invoiceId) },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                inventory_items: {
                                    where: {
                                        warehouse_id: parseInt(warehouseId)
                                    }
                                }
                            }
                        }
                    }
                },
                client: true
            }
        });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        // Enhance items with inventory status
        const enhancedItems = invoice.items.map(item => ({
            ...item,
            inventory_status: item.product_id ? {
                quantity_on_hand: item.product?.inventory_items[0]?.quantity_on_hand || 0,
                quantity_available: item.product?.inventory_items[0]?.quantity_available || 0,
                quantity_reserved: item.product?.inventory_items[0]?.quantity_reserved || 0,
                is_sufficient: (item.product?.inventory_items[0]?.quantity_available || 0) >= parseInt(item.quantity)
            } : null
        }));

        return {
            ...invoice,
            items: enhancedItems
        };
    }
};

module.exports = invoiceInventoryModel;
