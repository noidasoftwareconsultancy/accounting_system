const prisma = require('../lib/prisma');

const accountingModel = {
  /**
   * Get all accounts with hierarchy
   */
  async getAllAccounts(page = 1, limit = 50, filters = {}) {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (filters.type_id) where.type_id = parseInt(filters.type_id);
    if (filters.is_active !== undefined) where.is_active = filters.is_active === 'true';
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { account_number: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where,
        include: {
          type: true,
          parent_account: {
            select: { id: true, name: true, account_number: true }
          },
          sub_accounts: {
            select: { id: true, name: true, account_number: true, is_active: true }
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
      prisma.account.count({ where })
    ]);

    // Calculate balances for each account
    const accountsWithBalances = await Promise.all(
      accounts.map(async (account) => {
        const balance = await this.getAccountBalance(account.id);
        return {
          ...account,
          balance
        };
      })
    );

    return {
      accounts: accountsWithBalances,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get chart of accounts in hierarchical structure
   */
  async getChartOfAccounts() {
    const accounts = await prisma.account.findMany({
      where: { is_active: true },
      include: {
        type: true,
        parent_account: true,
        sub_accounts: {
          where: { is_active: true },
          include: {
            type: true,
            sub_accounts: {
              where: { is_active: true },
              include: { type: true }
            }
          }
        },
        _count: {
          select: { ledger_entries: true }
        }
      },
      orderBy: { account_number: 'asc' }
    });

    // Calculate balances for all accounts
    const accountsWithBalances = await Promise.all(
      accounts.map(async (account) => {
        const balance = await this.getAccountBalance(account.id);
        return {
          ...account,
          balance
        };
      })
    );

    // Group by account type and build hierarchy
    const accountTypes = await prisma.accountType.findMany({
      orderBy: { name: 'asc' }
    });

    const chartOfAccounts = accountTypes.map(type => {
      const typeAccounts = accountsWithBalances.filter(acc => acc.type_id === type.id);
      const parentAccounts = typeAccounts.filter(acc => !acc.parent_account_id);
      
      return {
        ...type,
        accounts: this.buildAccountHierarchy(parentAccounts, accountsWithBalances)
      };
    });

    return chartOfAccounts;
  },

  /**
   * Build account hierarchy recursively
   */
  buildAccountHierarchy(parentAccounts, allAccounts) {
    return parentAccounts.map(parent => ({
      ...parent,
      children: this.buildAccountHierarchy(
        allAccounts.filter(acc => acc.parent_account_id === parent.id),
        allAccounts
      )
    }));
  },

  /**
   * Get account balance
   */
  async getAccountBalance(accountId) {
    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: {
        account_id: parseInt(accountId),
        journal_entry: {
          is_posted: true
        }
      }
    });

    const totalDebit = ledgerEntries.reduce((sum, entry) => sum + parseFloat(entry.debit), 0);
    const totalCredit = ledgerEntries.reduce((sum, entry) => sum + parseFloat(entry.credit), 0);

    return {
      debit: totalDebit,
      credit: totalCredit,
      balance: totalDebit - totalCredit
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
    // Check if account number already exists
    const existingAccount = await prisma.account.findUnique({
      where: { account_number: accountData.account_number }
    });

    if (existingAccount) {
      throw new Error('Account number already exists');
    }

    // Validate parent account if provided
    if (accountData.parent_account_id) {
      const parentAccount = await prisma.account.findUnique({
        where: { id: parseInt(accountData.parent_account_id) }
      });

      if (!parentAccount) {
        throw new Error('Parent account not found');
      }

      // Ensure parent account is of the same type or compatible
      if (parentAccount.type_id !== parseInt(accountData.type_id)) {
        throw new Error('Parent account must be of the same type');
      }
    }

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
   * Update journal entry
   */
  async updateJournalEntry(id, entryData) {
    const { ledger_entries, ...journalData } = entryData;

    return prisma.$transaction(async (tx) => {
      // Update journal entry
      const journalEntry = await tx.journalEntry.update({
        where: { id: parseInt(id) },
        data: journalData
      });

      // Delete existing ledger entries
      await tx.ledgerEntry.deleteMany({
        where: { journal_entry_id: parseInt(id) }
      });

      // Create new ledger entries
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
  },

  /**
   * Delete account (soft delete by setting is_active to false)
   */
  async deleteAccount(id) {
    // Check if account has any ledger entries
    const ledgerEntriesCount = await prisma.ledgerEntry.count({
      where: { account_id: parseInt(id) }
    });

    if (ledgerEntriesCount > 0) {
      // Soft delete - set is_active to false
      return prisma.account.update({
        where: { id: parseInt(id) },
        data: { is_active: false }
      });
    } else {
      // Hard delete if no transactions
      return prisma.account.delete({
        where: { id: parseInt(id) }
      });
    }
  },

  /**
   * Get accounts by type
   */
  async getAccountsByType(typeId) {
    return prisma.account.findMany({
      where: {
        type_id: parseInt(typeId),
        is_active: true
      },
      include: {
        type: true,
        parent_account: true
      },
      orderBy: { account_number: 'asc' }
    });
  },

  /**
   * Search accounts
   */
  async searchAccounts(query) {
    return prisma.account.findMany({
      where: {
        AND: [
          { is_active: true },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { account_number: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      },
      include: {
        type: true,
        parent_account: true
      },
      orderBy: { account_number: 'asc' },
      take: 20
    });
  },

  /**
   * Create automatic journal entry for invoice
   */
  async createInvoiceJournalEntry(invoice, userId) {
    const entryNumber = await this.generateEntryNumber('INV');
    
    const ledgerEntries = [
      {
        account_id: await this.getAccountByNumber('1021'), // Trade Receivables
        debit: parseFloat(invoice.total_amount),
        credit: 0,
        description: `Invoice ${invoice.invoice_number} - ${invoice.client?.name}`
      },
      {
        account_id: await this.getAccountByNumber('4012'), // Service Revenue
        debit: 0,
        credit: parseFloat(invoice.amount),
        description: `Invoice ${invoice.invoice_number} - Revenue`
      }
    ];

    // Add tax entry if applicable
    if (invoice.tax_amount > 0) {
      ledgerEntries.push({
        account_id: await this.getAccountByNumber('2042'), // Sales Tax Payable
        debit: 0,
        credit: parseFloat(invoice.tax_amount),
        description: `Invoice ${invoice.invoice_number} - Sales Tax`
      });
    }

    return this.createJournalEntry({
      entry_number: entryNumber,
      date: invoice.issue_date,
      description: `Automatic entry for Invoice ${invoice.invoice_number}`,
      reference: `INV-${invoice.id}`,
      ledger_entries: ledgerEntries,
      created_by: userId
    });
  },

  /**
   * Create automatic journal entry for expense
   */
  async createExpenseJournalEntry(expense, userId) {
    const entryNumber = await this.generateEntryNumber('EXP');
    
    const ledgerEntries = [
      {
        account_id: await this.getExpenseAccountByCategory(expense.category_id),
        debit: parseFloat(expense.amount),
        credit: 0,
        description: `Expense: ${expense.description}`
      },
      {
        account_id: await this.getAccountByNumber('1012'), // Cash in Bank - Checking
        debit: 0,
        credit: parseFloat(expense.amount + expense.tax_amount),
        description: `Payment for: ${expense.description}`
      }
    ];

    // Add tax entry if applicable
    if (expense.tax_amount > 0) {
      ledgerEntries.push({
        account_id: await this.getAccountByNumber('1041'), // Prepaid Tax (or appropriate tax account)
        debit: parseFloat(expense.tax_amount),
        credit: 0,
        description: `Tax on expense: ${expense.description}`
      });
    }

    return this.createJournalEntry({
      entry_number: entryNumber,
      date: expense.expense_date,
      description: `Automatic entry for Expense: ${expense.description}`,
      reference: `EXP-${expense.id}`,
      ledger_entries: ledgerEntries,
      created_by: userId
    });
  },

  /**
   * Create automatic journal entry for payroll
   */
  async createPayrollJournalEntry(payslip, userId) {
    const entryNumber = await this.generateEntryNumber('PAY');
    
    const ledgerEntries = [
      {
        account_id: await this.getAccountByNumber('6012'), // Staff Salaries
        debit: parseFloat(payslip.gross_salary),
        credit: 0,
        description: `Payroll for employee ${payslip.employee?.employee_id}`
      },
      {
        account_id: await this.getAccountByNumber('2031'), // Salaries Payable
        debit: 0,
        credit: parseFloat(payslip.net_salary),
        description: `Net salary payable for employee ${payslip.employee?.employee_id}`
      }
    ];

    // Add deduction entries
    if (payslip.tax_deduction > 0) {
      ledgerEntries.push({
        account_id: await this.getAccountByNumber('2032'), // Payroll Tax Payable
        debit: 0,
        credit: parseFloat(payslip.tax_deduction),
        description: `Tax deduction for employee ${payslip.employee?.employee_id}`
      });
    }

    if (payslip.provident_fund > 0) {
      ledgerEntries.push({
        account_id: await this.getAccountByNumber('2033'), // Employee Benefits Payable
        debit: 0,
        credit: parseFloat(payslip.provident_fund),
        description: `PF deduction for employee ${payslip.employee?.employee_id}`
      });
    }

    return this.createJournalEntry({
      entry_number: entryNumber,
      date: new Date(),
      description: `Automatic entry for Payroll - Employee ${payslip.employee?.employee_id}`,
      reference: `PAY-${payslip.id}`,
      ledger_entries: ledgerEntries,
      created_by: userId
    });
  },

  /**
   * Generate entry number
   */
  async generateEntryNumber(prefix = 'JE') {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const count = await prisma.journalEntry.count({
      where: {
        entry_number: {
          startsWith: `${prefix}-${year}${month}`
        }
      }
    });

    return `${prefix}-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  },

  /**
   * Get account by account number
   */
  async getAccountByNumber(accountNumber) {
    const account = await prisma.account.findUnique({
      where: { account_number: accountNumber }
    });
    return account?.id;
  },

  /**
   * Get expense account by category
   */
  async getExpenseAccountByCategory(categoryId) {
    // Map expense categories to appropriate expense accounts
    const categoryMappings = {
      1: '6031', // Office Supplies
      2: '6033', // Software & Subscriptions -> Telephone and Internet
      3: '6013', // Hardware -> Equipment (depreciation)
      4: '6071', // Travel
      5: '6042', // Utilities -> Electricity
      6: '6041', // Rent
      7: '6012', // Salaries -> Staff Salaries
      8: '6061', // Marketing -> Advertising Expense
      9: '6052', // Professional Services -> Accounting Fees
      10: '6000' // Miscellaneous -> Operating Expenses
    };

    const accountNumber = categoryMappings[categoryId] || '6000';
    return this.getAccountByNumber(accountNumber);
  }
};

module.exports = accountingModel;