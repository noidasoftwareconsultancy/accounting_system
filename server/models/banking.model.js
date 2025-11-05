const prisma = require('../lib/prisma');

const bankingModel = {
  /**
   * Get all bank accounts
   */
  async getAllBankAccounts(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [bankAccounts, total] = await Promise.all([
      prisma.bankAccount.findMany({
        include: {
          creator: {
            select: { id: true, first_name: true, last_name: true }
          },
          _count: {
            select: { transactions: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.bankAccount.count()
    ]);

    return {
      bankAccounts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get bank account by ID
   */
  async getBankAccountById(id) {
    return prisma.bankAccount.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true }
        },
        transactions: {
          orderBy: { transaction_date: 'desc' },
          take: 50,
          include: {
            creator: {
              select: { id: true, first_name: true, last_name: true }
            }
          }
        }
      }
    });
  },

  /**
   * Create bank account
   */
  async createBankAccount(accountData) {
    return prisma.bankAccount.create({
      data: {
        ...accountData,
        created_by: parseInt(accountData.created_by),
        opening_balance: parseFloat(accountData.opening_balance || 0),
        current_balance: parseFloat(accountData.opening_balance || 0)
      },
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Update bank account
   */
  async updateBankAccount(id, accountData) {
    return prisma.bankAccount.update({
      where: { id: parseInt(id) },
      data: {
        ...accountData,
        opening_balance: accountData.opening_balance ? parseFloat(accountData.opening_balance) : undefined,
        current_balance: accountData.current_balance ? parseFloat(accountData.current_balance) : undefined
      },
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Create bank transaction
   */
  async createTransaction(transactionData) {
    return prisma.$transaction(async (tx) => {
      // Create transaction
      const transaction = await tx.bankTransaction.create({
        data: {
          ...transactionData,
          bank_account_id: parseInt(transactionData.bank_account_id),
          amount: parseFloat(transactionData.amount),
          created_by: parseInt(transactionData.created_by)
        }
      });

      // Update bank account balance
      const bankAccount = await tx.bankAccount.findUnique({
        where: { id: parseInt(transactionData.bank_account_id) }
      });

      let newBalance = parseFloat(bankAccount.current_balance);
      
      if (transactionData.transaction_type === 'deposit') {
        newBalance += parseFloat(transactionData.amount);
      } else if (transactionData.transaction_type === 'withdrawal') {
        newBalance -= parseFloat(transactionData.amount);
      }

      await tx.bankAccount.update({
        where: { id: parseInt(transactionData.bank_account_id) },
        data: { current_balance: newBalance }
      });

      return transaction;
    });
  },

  /**
   * Get bank transactions
   */
  async getTransactions(bankAccountId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = bankAccountId ? { bank_account_id: parseInt(bankAccountId) } : {};

    const [transactions, total] = await Promise.all([
      prisma.bankTransaction.findMany({
        where,
        include: {
          bank_account: {
            select: { id: true, account_name: true, account_number: true }
          },
          creator: {
            select: { id: true, first_name: true, last_name: true }
          }
        },
        orderBy: { transaction_date: 'desc' },
        skip,
        take: limit
      }),
      prisma.bankTransaction.count({ where })
    ]);

    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Reconcile transaction
   */
  async reconcileTransaction(transactionId) {
    return prisma.bankTransaction.update({
      where: { id: parseInt(transactionId) },
      data: { is_reconciled: true }
    });
  },

  /**
   * Get payment gateways
   */
  async getPaymentGateways() {
    return prisma.paymentGateway.findMany({
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true }
        },
        _count: {
          select: { logs: true }
        }
      }
    });
  },

  /**
   * Create payment gateway
   */
  async createPaymentGateway(gatewayData) {
    return prisma.paymentGateway.create({
      data: {
        ...gatewayData,
        created_by: parseInt(gatewayData.created_by)
      }
    });
  },

  /**
   * Log payment gateway transaction
   */
  async logGatewayTransaction(logData) {
    return prisma.paymentGatewayLog.create({
      data: {
        ...logData,
        gateway_id: parseInt(logData.gateway_id),
        amount: parseFloat(logData.amount)
      }
    });
  },

  /**
   * Get banking statistics
   */
  async getStats() {
    const [totalAccounts, totalBalance, thisMonthTransactions] = await Promise.all([
      prisma.bankAccount.count({ where: { is_active: true } }),
      prisma.bankAccount.aggregate({
        where: { is_active: true },
        _sum: { current_balance: true }
      }),
      prisma.bankTransaction.count({
        where: {
          transaction_date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    return {
      totalAccounts,
      totalBalance: totalBalance._sum.current_balance || 0,
      thisMonthTransactions
    };
  }
};

module.exports = bankingModel;