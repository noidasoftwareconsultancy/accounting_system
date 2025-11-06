# Chart of Accounts System - Complete Implementation

## Overview

This document describes the comprehensive Chart of Accounts system implemented for the Financial Management System. The system provides full accounting functionality with automatic journal entry generation and integration with other modules.

## Features Implemented

### 1. Chart of Accounts Management
- **Hierarchical Account Structure**: Support for parent-child account relationships
- **Account Types**: Asset, Liability, Equity, Revenue, Expense
- **Account Search and Filtering**: Advanced search and filtering capabilities
- **Account Balance Tracking**: Real-time balance calculations
- **Active/Inactive Status**: Soft delete functionality for accounts with transactions

### 2. Journal Entry Management
- **Manual Journal Entries**: Create, edit, and post journal entries
- **Automatic Journal Entries**: Integration with invoices, expenses, and payroll
- **Double-Entry Validation**: Ensures debits equal credits
- **Entry Numbering**: Automatic sequential numbering system
- **Posting Control**: Draft and posted entry states

### 3. Trial Balance Reporting
- **Real-time Trial Balance**: Automatically calculated from posted entries
- **Account Type Grouping**: Organized by asset, liability, equity, revenue, expense
- **Balance Validation**: Ensures accounting equation balance
- **Export Functionality**: CSV export capability
- **Print Support**: Formatted for printing

### 4. Integration with Other Modules
- **Invoice Integration**: Automatic journal entries for invoices
- **Expense Integration**: Automatic journal entries for expenses
- **Payroll Integration**: Automatic journal entries for payroll transactions
- **Bank Transaction Integration**: Ready for bank reconciliation

## Database Schema

### Account Types
```sql
account_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT
)
```

### Accounts
```sql
accounts (
  id SERIAL PRIMARY KEY,
  account_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  type_id INTEGER REFERENCES account_types(id),
  parent_account_id INTEGER REFERENCES accounts(id),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INTEGER REFERENCES users(id)
)
```

### Journal Entries
```sql
journal_entries (
  id SERIAL PRIMARY KEY,
  entry_number VARCHAR(20) UNIQUE NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  reference VARCHAR(100),
  is_posted BOOLEAN DEFAULT FALSE,
  created_by INTEGER REFERENCES users(id)
)
```

### Ledger Entries
```sql
ledger_entries (
  id SERIAL PRIMARY KEY,
  journal_entry_id INTEGER REFERENCES journal_entries(id),
  account_id INTEGER REFERENCES accounts(id),
  debit DECIMAL(15, 2) DEFAULT 0,
  credit DECIMAL(15, 2) DEFAULT 0,
  description TEXT
)
```

## API Endpoints

### Account Management
- `GET /api/accounting/accounts` - Get all accounts with filtering
- `GET /api/accounting/accounts/chart` - Get hierarchical chart of accounts
- `GET /api/accounting/accounts/search` - Search accounts
- `GET /api/accounting/accounts/types` - Get account types
- `GET /api/accounting/accounts/:id` - Get account by ID
- `GET /api/accounting/accounts/:id/balance` - Get account balance
- `POST /api/accounting/accounts` - Create new account
- `PUT /api/accounting/accounts/:id` - Update account
- `DELETE /api/accounting/accounts/:id` - Delete account (soft delete)

### Journal Entry Management
- `GET /api/accounting/journal-entries` - Get all journal entries
- `GET /api/accounting/journal-entries/:id` - Get journal entry by ID
- `POST /api/accounting/journal-entries` - Create journal entry
- `PATCH /api/accounting/journal-entries/:id/post` - Post journal entry

### Reporting
- `GET /api/accounting/trial-balance` - Get trial balance report

### Integration Endpoints
- `POST /api/accounting/integration/invoice/:invoiceId/journal-entry` - Create journal entry for invoice
- `POST /api/accounting/integration/expense/:expenseId/journal-entry` - Create journal entry for expense
- `POST /api/accounting/integration/payroll/:payslipId/journal-entry` - Create journal entry for payroll

## Client Components

### 1. AccountList Component (`/accounting/accounts`)
- **Features**:
  - Tabbed interface (Account List / Chart of Accounts)
  - Advanced filtering and search
  - Hierarchical account display
  - Account creation and editing
  - Balance display
  - Status management

### 2. JournalEntries Component (`/accounting/journal-entries`)
- **Features**:
  - Journal entry creation and editing
  - Multiple ledger entries per journal entry
  - Account selection with autocomplete
  - Debit/Credit validation
  - Balance checking
  - Entry posting

### 3. TrialBalance Component (`/accounting/trial-balance`)
- **Features**:
  - Real-time trial balance calculation
  - Account type grouping
  - Balance validation
  - Export to CSV
  - Print functionality
  - Summary cards

## Default Chart of Accounts

The system includes a comprehensive default chart of accounts:

### Assets (1000-1999)
- **Current Assets (1000-1499)**
  - Cash and Cash Equivalents (1010-1019)
  - Accounts Receivable (1020-1029)
  - Inventory (1030-1039)
  - Prepaid Expenses (1040-1049)

- **Fixed Assets (1500-1999)**
  - Property, Plant & Equipment (1510-1519)
  - Accumulated Depreciation (1520-1529)

### Liabilities (2000-2999)
- **Current Liabilities (2000-2499)**
  - Accounts Payable (2010-2019)
  - Short-term Loans (2020-2029)
  - Payroll Liabilities (2030-2039)
  - Tax Liabilities (2040-2049)

- **Long-term Liabilities (2500-2999)**
  - Long-term Loans (2510-2519)

### Equity (3000-3999)
- Owner's Equity (3000-3099)
- Retained Earnings (3020-3029)
- Dividends (3030-3039)

### Revenue (4000-4999)
- Sales Revenue (4010-4019)
- Other Revenue (4020-4029)

### Expenses (5000-7999)
- Cost of Goods Sold (5000-5999)
- Operating Expenses (6000-6999)
- Other Expenses (7000-7999)

## Automatic Journal Entry Integration

### Invoice Journal Entries
When an invoice is created:
```
Dr. Accounts Receivable (1021)    $1,100
    Cr. Service Revenue (4012)              $1,000
    Cr. Sales Tax Payable (2042)            $100
```

### Expense Journal Entries
When an expense is recorded:
```
Dr. Office Supplies (6031)        $500
Dr. Prepaid Tax (1041)           $50
    Cr. Cash in Bank (1012)                 $550
```

### Payroll Journal Entries
When payroll is processed:
```
Dr. Staff Salaries (6012)        $5,000
    Cr. Salaries Payable (2031)            $4,200
    Cr. Payroll Tax Payable (2032)         $600
    Cr. Employee Benefits Payable (2033)   $200
```

## Setup Instructions

### 1. Database Setup
```sql
-- Run the main schema
\i database/schema.sql

-- Run the account seeding script
\i database/seed-accounts.sql
```

### 2. Server Configuration
The accounting routes are already registered in `server/index.js`:
```javascript
app.use('/api/accounting', require('./routes/accounting.routes'));
```

### 3. Client Configuration
The accounting pages are already registered in the React router:
```javascript
<Route path="/accounting/accounts" element={<AccountList />} />
<Route path="/accounting/journal-entries" element={<JournalEntries />} />
<Route path="/accounting/trial-balance" element={<TrialBalance />} />
```

## Usage Examples

### Creating a New Account
1. Navigate to `/accounting/accounts`
2. Click "Add Account"
3. Fill in account details:
   - Account Number (e.g., "1050")
   - Account Name (e.g., "Petty Cash")
   - Account Type (e.g., "Asset")
   - Parent Account (optional)
   - Description

### Creating a Journal Entry
1. Navigate to `/accounting/journal-entries`
2. Click "Create Entry"
3. Fill in entry details:
   - Entry Number (auto-generated)
   - Date
   - Description
   - Reference
4. Add ledger entries:
   - Select accounts
   - Enter debit/credit amounts
   - Ensure debits = credits
5. Save and post the entry

### Viewing Trial Balance
1. Navigate to `/accounting/trial-balance`
2. View real-time trial balance
3. Export to CSV or print as needed

## Security and Permissions

- **Admin**: Full access to all accounting functions
- **Accountant**: Full access to all accounting functions
- **User**: Read-only access to reports

## Best Practices

1. **Account Numbering**: Use consistent numbering scheme (e.g., 1000s for assets)
2. **Account Names**: Use clear, descriptive names
3. **Journal Entry References**: Always include reference numbers for traceability
4. **Regular Reconciliation**: Regularly check trial balance for accuracy
5. **Backup**: Regular database backups before major transactions

## Future Enhancements

1. **Financial Statements**: Automated P&L, Balance Sheet generation
2. **Budget Integration**: Budget vs. actual reporting
3. **Multi-Currency**: Support for multiple currencies
4. **Audit Trail**: Enhanced audit logging
5. **Bank Reconciliation**: Automated bank statement reconciliation
6. **Tax Reporting**: Automated tax report generation

## Troubleshooting

### Common Issues

1. **Trial Balance Not Balancing**
   - Check for unposted journal entries
   - Verify all entries have equal debits and credits
   - Check for data entry errors

2. **Account Not Appearing in Lists**
   - Verify account is marked as active
   - Check account type assignment
   - Refresh the page

3. **Permission Errors**
   - Verify user role (admin/accountant required for modifications)
   - Check authentication status

### Support

For technical support or questions about the Chart of Accounts system, please refer to the main project documentation or contact the development team.