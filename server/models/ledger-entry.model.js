const prisma = require('../lib/prisma');

const ledgerEntryModel = {
  /**
   * Get all ledger entries with pagination and filters
   */
  async getAll(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    if (filters.account_id) where.account_id = parseInt(filters.account_id);
    if (filters.journal_entry_id) where.journal_entry_id = parseInt(filters.journal_entry_id);
    if (filters.start_date && filters.end_date) {
      where.journal_entry = {
        date: {
          gte: new Date(filters.start_date),
          lte: new Date(filters.end_date)
        }
      };
    }

    const [entries, total] = await Promise.all([
      prisma.ledgerEntry.findMany({
        where,
        include: {
          account: {
            select: { id: true, name: true, account_number: true }
          },
          journal_entry: {
            select: { 
              id: true, 
              entry_number: true, 
              date: true, 
              description: true,
              creator: {
                select: { id: true, first_name: true, last_name: true }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.ledgerEntry.count({ where })
    ]);

    return {
      entries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get ledger entry by ID
   */
  async getById(id) {
    return prisma.ledgerEntry.findUnique({
      where: { id: parseInt(id) },
      include: {
        account: true,
        journal_entry: {
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
   * Get account balance
   */
  async getAccountBalance(accountId, asOfDate = null) {
    const where = {
      account_id: parseInt(accountId)
    };

    if (asOfDate) {
      where.journal_entry = {
        date: { lte: new Date(asOfDate) },
        is_posted: true
      };
    } else {
      where.journal_entry = {
        is_posted: true
      };
    }

    const result = await prisma.ledgerEntry.aggregate({
      where,
      _sum: {
        debit: true,
        credit: true
      }
    });

    const totalDebits = result._sum.debit || 0;
    const totalCredits = result._sum.credit || 0;
    
    return {
      accountId: parseInt(accountId),
      totalDebits,
      totalCredits,
      balance: totalDebits - totalCredits,
      asOfDate: asOfDate || new Date()
    };
  },

  /**
   * Get trial balance
   */
  async getTrialBalance(asOfDate = null) {
    const accounts = await prisma.account.findMany({
      where: { is_active: true },
      include: {
        type: true
      },
      orderBy: { account_number: 'asc' }
    });

    const balances = await Promise.all(
      accounts.map(async (account) => {
        const balance = await this.getAccountBalance(account.id, asOfDate);
        return {
          ...account,
          ...balance
        };
      })
    );

    const totalDebits = balances.reduce((sum, acc) => sum + acc.totalDebits, 0);
    const totalCredits = balances.reduce((sum, acc) => sum + acc.totalCredits, 0);

    return {
      accounts: balances,
      totals: {
        totalDebits,
        totalCredits,
        difference: totalDebits - totalCredits
      },
      asOfDate: asOfDate || new Date()
    };
  },

  /**
   * Get ledger entries by account
   */
  async getByAccount(accountId, page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    const where = { account_id: parseInt(accountId) };

    if (filters.start_date && filters.end_date) {
      where.journal_entry = {
        date: {
          gte: new Date(filters.start_date),
          lte: new Date(filters.end_date)
        }
      };
    }

    const [entries, total] = await Promise.all([
      prisma.ledgerEntry.findMany({
        where,
        include: {
          journal_entry: {
            select: { 
              id: true, 
              entry_number: true, 
              date: true, 
              description: true, 
              reference: true,
              is_posted: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.ledgerEntry.count({ where })
    ]);

    // Calculate running balance
    let runningBalance = 0;
    const entriesWithBalance = entries.map(entry => {
      runningBalance += (parseFloat(entry.debit) - parseFloat(entry.credit));
      return {
        ...entry,
        runningBalance
      };
    });

    return {
      entries: entriesWithBalance,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get account statement
   */
  async getAccountStatement(accountId, startDate, endDate) {
    const account = await prisma.account.findUnique({
      where: { id: parseInt(accountId) },
      include: { type: true }
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Get opening balance
    const openingBalance = await this.getAccountBalance(accountId, startDate);
    
    // Get entries for the period
    const entries = await prisma.ledgerEntry.findMany({
      where: {
        account_id: parseInt(accountId),
        journal_entry: {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          },
          is_posted: true
        }
      },
      include: {
        journal_entry: {
          select: { 
            id: true, 
            entry_number: true, 
            date: true, 
            description: true, 
            reference: true
          }
        }
      },
      orderBy: {
        journal_entry: { date: 'asc' }
      }
    });

    // Calculate running balance
    let runningBalance = openingBalance.balance;
    const entriesWithBalance = entries.map(entry => {
      runningBalance += (parseFloat(entry.debit) - parseFloat(entry.credit));
      return {
        ...entry,
        runningBalance
      };
    });

    const closingBalance = await this.getAccountBalance(accountId, endDate);

    return {
      account,
      period: { startDate, endDate },
      openingBalance: openingBalance.balance,
      closingBalance: closingBalance.balance,
      entries: entriesWithBalance,
      summary: {
        totalDebits: entries.reduce((sum, e) => sum + parseFloat(e.debit), 0),
        totalCredits: entries.reduce((sum, e) => sum + parseFloat(e.credit), 0),
        netMovement: closingBalance.balance - openingBalance.balance
      }
    };
  }
};

module.exports = ledgerEntryModel;