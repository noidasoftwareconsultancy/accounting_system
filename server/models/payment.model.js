const prisma = require('../lib/prisma');

const Payment = {
    /**
     * Get all payments with pagination and filters
     */
    async getAll(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        const where = {};

        // Apply filters
        if (filters.search) {
            where.OR = [
                { reference_number: { contains: filters.search, mode: 'insensitive' } },
                { notes: { contains: filters.search, mode: 'insensitive' } },
                { invoice: { invoice_number: { contains: filters.search, mode: 'insensitive' } } },
                { invoice: { client: { name: { contains: filters.search, mode: 'insensitive' } } } }
            ];
        }

        if (filters.payment_method) {
            where.payment_method = filters.payment_method;
        }

        if (filters.start_date) {
            where.payment_date = { ...where.payment_date, gte: new Date(filters.start_date) };
        }

        if (filters.end_date) {
            where.payment_date = { ...where.payment_date, lte: new Date(filters.end_date) };
        }

        if (filters.invoice_id) {
            where.invoice_id = parseInt(filters.invoice_id);
        }

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                include: {
                    invoice: {
                        include: {
                            client: {
                                select: { id: true, name: true }
                            }
                        }
                    },
                    creator: {
                        select: { id: true, first_name: true, last_name: true }
                    }
                },
                orderBy: { payment_date: 'desc' },
                skip,
                take: limit
            }),
            prisma.payment.count({ where })
        ]);

        return {
            payments,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    },

    /**
     * Get payment by ID
     */
    async getById(id) {
        return prisma.payment.findUnique({
            where: { id: parseInt(id) },
            include: {
                invoice: {
                    include: {
                        client: {
                            select: { id: true, name: true }
                        }
                    }
                },
                creator: {
                    select: { id: true, first_name: true, last_name: true }
                }
            }
        });
    },

    /**
     * Create new payment
     */
    async create(paymentData) {
        return prisma.$transaction(async (tx) => {
            // Create payment
            const payment = await tx.payment.create({
                data: {
                    ...paymentData,
                    invoice_id: parseInt(paymentData.invoice_id),
                    amount: parseFloat(paymentData.amount),
                    payment_date: new Date(paymentData.payment_date + 'T00:00:00.000Z'),
                    created_by: parseInt(paymentData.created_by)
                },
                include: {
                    invoice: {
                        include: {
                            client: {
                                select: { id: true, name: true }
                            }
                        }
                    },
                    creator: {
                        select: { id: true, first_name: true, last_name: true }
                    }
                }
            });

            // Update invoice status if fully paid
            const invoice = await tx.invoice.findUnique({
                where: { id: parseInt(paymentData.invoice_id) },
                include: { payments: true }
            });

            const totalPaid = invoice.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0) + parseFloat(paymentData.amount);

            if (totalPaid >= parseFloat(invoice.total_amount)) {
                await tx.invoice.update({
                    where: { id: parseInt(paymentData.invoice_id) },
                    data: { status: 'paid' }
                });
            } else if (totalPaid > 0 && invoice.status === 'sent') {
                await tx.invoice.update({
                    where: { id: parseInt(paymentData.invoice_id) },
                    data: { status: 'partially_paid' }
                });
            }

            return payment;
        });
    },

    /**
     * Update payment
     */
    async update(id, paymentData) {
        return prisma.payment.update({
            where: { id: parseInt(id) },
            data: {
                ...paymentData,
                amount: paymentData.amount ? parseFloat(paymentData.amount) : undefined,
                invoice_id: paymentData.invoice_id ? parseInt(paymentData.invoice_id) : undefined,
                payment_date: paymentData.payment_date ? new Date(paymentData.payment_date + 'T00:00:00.000Z') : undefined
            },
            include: {
                invoice: {
                    include: {
                        client: {
                            select: { id: true, name: true }
                        }
                    }
                },
                creator: {
                    select: { id: true, first_name: true, last_name: true }
                }
            }
        });
    },

    /**
     * Delete payment
     */
    async delete(id) {
        return prisma.payment.delete({
            where: { id: parseInt(id) }
        });
    },

    /**
     * Get payments by invoice
     */
    async getByInvoice(invoiceId) {
        return prisma.payment.findMany({
            where: { invoice_id: parseInt(invoiceId) },
            include: {
                creator: {
                    select: { id: true, first_name: true, last_name: true }
                }
            },
            orderBy: { payment_date: 'desc' }
        });
    },

    /**
     * Get payment statistics
     */
    async getStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const [
            totalPayments,
            thisMonthPayments,
            thisYearPayments,
            paymentMethods
        ] = await Promise.all([
            prisma.payment.aggregate({
                _sum: { amount: true },
                _count: true
            }),
            prisma.payment.aggregate({
                where: { payment_date: { gte: startOfMonth } },
                _sum: { amount: true },
                _count: true
            }),
            prisma.payment.aggregate({
                where: { payment_date: { gte: startOfYear } },
                _sum: { amount: true },
                _count: true
            }),
            prisma.payment.groupBy({
                by: ['payment_method'],
                _sum: { amount: true },
                _count: true
            })
        ]);

        return {
            total: {
                amount: totalPayments._sum.amount || 0,
                count: totalPayments._count
            },
            thisMonth: {
                amount: thisMonthPayments._sum.amount || 0,
                count: thisMonthPayments._count
            },
            thisYear: {
                amount: thisYearPayments._sum.amount || 0,
                count: thisYearPayments._count
            },
            byMethod: paymentMethods
        };
    }
};

module.exports = Payment;