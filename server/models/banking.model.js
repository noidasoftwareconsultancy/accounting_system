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
    const [totalAccounts, totalBalance, thisMonthTransactions, reconciliationStats] = await Promise.all([
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
      }),
      prisma.bankTransaction.groupBy({
        by: ['is_reconciled'],
        _count: true
      })
    ]);

    const reconciled = reconciliationStats.find(r => r.is_reconciled)?._count || 0;
    const unreconciled = reconciliationStats.find(r => !r.is_reconciled)?._count || 0;

    return {
      totalAccounts,
      totalBalance: totalBalance._sum.current_balance || 0,
      thisMonthTransactions,
      reconciliationStats: {
        reconciled,
        unreconciled,
        total: reconciled + unreconciled
      }
    };
  },

  /**
   * Get account balance history
   */
  async getAccountBalanceHistory(accountId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await prisma.bankTransaction.findMany({
      where: {
        bank_account_id: parseInt(accountId),
        transaction_date: {
          gte: startDate
        }
      },
      orderBy: { transaction_date: 'asc' }
    });

    const account = await prisma.bankAccount.findUnique({
      where: { id: parseInt(accountId) }
    });

    let runningBalance = parseFloat(account.opening_balance);
    const balanceHistory = [];

    // Calculate balance for each day
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      
      const dayTransactions = transactions.filter(t => 
        new Date(t.transaction_date).toDateString() === date.toDateString()
      );

      dayTransactions.forEach(transaction => {
        if (transaction.transaction_type === 'deposit') {
          runningBalance += parseFloat(transaction.amount);
        } else if (transaction.transaction_type === 'withdrawal') {
          runningBalance -= parseFloat(transaction.amount);
        }
      });

      balanceHistory.push({
        date: date.toISOString().split('T')[0],
        balance: runningBalance,
        transactions: dayTransactions.length
      });
    }

    return balanceHistory;
  },

  /**
   * Get cash flow summary
   */
  async getCashFlowSummary(accountId, period = 'month') {
    let startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const where = {
      transaction_date: { gte: startDate }
    };

    if (accountId) {
      where.bank_account_id = parseInt(accountId);
    }

    const [inflows, outflows] = await Promise.all([
      prisma.bankTransaction.aggregate({
        where: {
          ...where,
          transaction_type: 'deposit'
        },
        _sum: { amount: true },
        _count: true
      }),
      prisma.bankTransaction.aggregate({
        where: {
          ...where,
          transaction_type: 'withdrawal'
        },
        _sum: { amount: true },
        _count: true
      })
    ]);

    return {
      period,
      inflows: {
        amount: inflows._sum.amount || 0,
        count: inflows._count
      },
      outflows: {
        amount: outflows._sum.amount || 0,
        count: outflows._count
      },
      netFlow: (inflows._sum.amount || 0) - (outflows._sum.amount || 0)
    };
  },

  /**
   * Delete bank account (soft delete)
   */
  async deleteBankAccount(id) {
    // Check if account has transactions
    const transactionCount = await prisma.bankTransaction.count({
      where: { bank_account_id: parseInt(id) }
    });

    if (transactionCount > 0) {
      // Soft delete - set is_active to false
      return prisma.bankAccount.update({
        where: { id: parseInt(id) },
        data: { is_active: false }
      });
    } else {
      // Hard delete if no transactions
      return prisma.bankAccount.delete({
        where: { id: parseInt(id) }
      });
    }
  },

  /**
   * Get unreconciled transactions
   */
  async getUnreconciledTransactions(accountId) {
    const where = {
      is_reconciled: false
    };

    if (accountId) {
      where.bank_account_id = parseInt(accountId);
    }

    return prisma.bankTransaction.findMany({
      where,
      include: {
        bank_account: {
          select: { id: true, account_name: true, account_number: true }
        },
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      },
      orderBy: { transaction_date: 'desc' }
    });
  },

  /**
   * Bulk reconcile transactions
   */
  async bulkReconcileTransactions(transactionIds) {
    return prisma.bankTransaction.updateMany({
      where: {
        id: {
          in: transactionIds.map(id => parseInt(id))
        }
      },
      data: {
        is_reconciled: true
      }
    });
  },

  /**
   * Transfer between accounts
   */
  async transferBetweenAccounts(fromAccountId, toAccountId, amount, description, userId) {
    return prisma.$transaction(async (tx) => {
      // Create withdrawal from source account
      const withdrawal = await tx.bankTransaction.create({
        data: {
          bank_account_id: parseInt(fromAccountId),
          transaction_type: 'withdrawal',
          amount: parseFloat(amount),
          transaction_date: new Date(),
          description: `Transfer to account: ${description}`,
          created_by: parseInt(userId)
        }
      });

      // Create deposit to destination account
      const deposit = await tx.bankTransaction.create({
        data: {
          bank_account_id: parseInt(toAccountId),
          transaction_type: 'deposit',
          amount: parseFloat(amount),
          transaction_date: new Date(),
          description: `Transfer from account: ${description}`,
          reference_number: `TRF-${withdrawal.id}`,
          created_by: parseInt(userId)
        }
      });

      // Update balances
      const [fromAccount, toAccount] = await Promise.all([
        tx.bankAccount.findUnique({ where: { id: parseInt(fromAccountId) } }),
        tx.bankAccount.findUnique({ where: { id: parseInt(toAccountId) } })
      ]);

      await Promise.all([
        tx.bankAccount.update({
          where: { id: parseInt(fromAccountId) },
          data: { current_balance: parseFloat(fromAccount.current_balance) - parseFloat(amount) }
        }),
        tx.bankAccount.update({
          where: { id: parseInt(toAccountId) },
          data: { current_balance: parseFloat(toAccount.current_balance) + parseFloat(amount) }
        })
      ]);

      return { withdrawal, deposit };
    });
  }
};

module.exports = bankingModel;