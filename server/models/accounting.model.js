const prisma = require('../lib/prisma');

const accountingModel = {
  /**
   * Get all accounts with hierarchy
   */
  async getAllAccounts(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        include: {
          type: true,
          parent_account: {
            select: { id: true, name: true, account_number: true }
          },
          sub_accounts: {
            select: { id: true, name: true, account_number: true }
          },
          creator: {
            select: { id: true, first_name: true, last_name: true }
          },
          _count: {
            select: { ledger_entries: true }
          }
        },
        orderBy: { account_number: 'asc' },
        skip,
        take: limit
      }),
      prisma.account.count()
    ]);

    return {
      accounts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get account by ID
   */
  async getAccountById(id) {
    return prisma.account.findUnique({
      where: { id: parseInt(id) },
      include: {
        type: true,
        parent_account: true,
        sub_accounts: true,
        creator: {
          select: { id: true, first_name: true, last_name: true }
        },
        ledger_entries: {
          include: {
            journal_entry: true
          },
          orderBy: { created_at: 'desc' },
          take: 20
        }
      }
    });
  },

  /**
   * Create account
   */
  async createAccount(accountData) {
    return prisma.account.create({
      data: {
        ...accountData,
        type_id: parseInt(accountData.type_id),
        parent_account_id: accountData.parent_account_id ? parseInt(accountData.parent_account_id) : null,
        created_by: parseInt(accountData.created_by)
      },
      include: {
        type: true,
        parent_account: true
      }
    });
  },

  /**
   * Update account
   */
  async updateAccount(id, accountData) {
    return prisma.account.update({
      where: { id: parseInt(id) },
      data: {
        ...accountData,
        type_id: accountData.type_id ? parseInt(accountData.type_id) : undefined,
        parent_account_id: accountData.parent_account_id ? parseInt(accountData.parent_account_id) : undefined
      },
      include: {
        type: true,
        parent_account: true
      }
    });
  },

  /**
   * Get all journal entries
   */
  async getAllJournalEntries(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [journalEntries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        include: {
          creator: {
            select: { id: true, first_name: true, last_name: true }
          },
          ledger_entries: {
            include: {
              account: {
                select: { id: true, name: true, account_number: true }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.journalEntry.count()
    ]);

    return {
      journalEntries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Create journal entry with ledger entries
   */
  async createJournalEntry(entryData) {
    const { ledger_entries, ...journalData } = entryData;

    return prisma.$transaction(async (tx) => {
      // Create journal entry
      const journalEntry = await tx.journalEntry.create({
        data: {
          ...journalData,
          created_by: parseInt(journalData.created_by)
        }
      });

      // Create ledger entries
      if (ledger_entries && ledger_entries.length > 0) {
        await tx.ledgerEntry.createMany({
          data: ledger_entries.map(entry => ({
            journal_entry_id: journalEntry.id,
            account_id: parseInt(entry.account_id),
            debit: parseFloat(entry.debit || 0),
            credit: parseFloat(entry.credit || 0),
            description: entry.description
          }))
        });
      }

      return this.getJournalEntryById(journalEntry.id);
    });
  },

  /**
   * Get journal entry by ID
   */
  async getJournalEntryById(id) {
    return prisma.journalEntry.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: { id: true, first_name: true, last_name: true }
        },
        ledger_entries: {
          include: {
            account: true
          }
        }
      }
    });
  },

  /**
   * Post journal entry
   */
  async postJournalEntry(id) {
    return prisma.journalEntry.update({
      where: { id: parseInt(id) },
      data: { is_posted: true }
    });
  },

  /**
   * Get trial balance
   */
  async getTrialBalance() {
    const accounts = await prisma.account.findMany({
      include: {
        type: true,
        ledger_entries: {
          where: {
            journal_entry: {
              is_posted: true
            }
          }
        }
      }
    });

    const trialBalance = accounts.map(account => {
      const totalDebit = account.ledger_entries.reduce((sum, entry) => sum + parseFloat(entry.debit), 0);
      const totalCredit = account.ledger_entries.reduce((sum, entry) => sum + parseFloat(entry.credit), 0);
      const balance = totalDebit - totalCredit;

      return {
        account_id: account.id,
        account_number: account.account_number,
        account_name: account.name,
        account_type: account.type.name,
        debit: totalDebit,
        credit: totalCredit,
        balance
      };
    });

    return trialBalance.filter(account => account.debit !== 0 || account.credit !== 0);
  },

  /**
   * Get account types
   */
  async getAccountTypes() {
    return prisma.accountType.findMany({
      include: {
        _count: {
          select: { accounts: true }
        }
      }
    });
  }
};

module.exports = accountingModel;