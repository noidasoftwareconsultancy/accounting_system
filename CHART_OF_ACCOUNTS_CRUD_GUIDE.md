# Chart of Accounts - CRUD Operations Guide

## Overview

The Chart of Accounts system provides comprehensive CRUD (Create, Read, Update, Delete) operations for managing accounting accounts. All operations are role-based and require appropriate permissions.

## Available CRUD Operations

### 1. CREATE Operations

#### Create New Account
- **Location**: `/accounting/accounts`
- **Button**: "Add Account" (top right)
- **Required Role**: Admin or Accountant
- **Fields**:
  - Account Number (required)
  - Account Name (required)
  - Account Type (required) - Asset, Liability, Equity, Revenue, Expense
  - Parent Account (optional) - for hierarchical structure
  - Description (optional)

#### Create Journal Entry
- **Location**: `/accounting/journal-entries`
- **Button**: "Create Entry" (top right)
- **Required Role**: Admin or Accountant
- **Features**:
  - Multiple ledger entries per journal entry
  - Automatic debit/credit validation
  - Account selection with autocomplete
  - Balance verification (debits must equal credits)

### 2. READ Operations

#### View All Accounts
- **Location**: `/accounting/accounts`
- **Available to**: All authenticated users
- **Features**:
  - Tabbed interface (Account List / Chart of Accounts)
  - Hierarchical account display
  - Account balance information
  - Search and filtering capabilities
  - Account type grouping

#### View Chart of Accounts
- **Location**: `/accounting/accounts` (Chart of Accounts tab)
- **Available to**: All authenticated users
- **Features**:
  - Hierarchical tree structure
  - Account type grouping
  - Expandable/collapsible sections
  - Balance information
  - Account count per type

#### View Journal Entries
- **Location**: `/accounting/journal-entries`
- **Available to**: All authenticated users
- **Features**:
  - List of all journal entries
  - Entry details with ledger entries
  - Posted/Draft status
  - Entry amounts and descriptions

#### View Trial Balance
- **Location**: `/accounting/trial-balance`
- **Available to**: All authenticated users
- **Features**:
  - Real-time trial balance calculation
  - Account type grouping
  - Debit/Credit totals
  - Balance validation
  - Export capabilities

### 3. UPDATE Operations

#### Edit Account
- **Location**: `/accounting/accounts`
- **Button**: Edit icon in Actions column
- **Required Role**: Admin or Accountant
- **Features**:
  - Modify account details
  - Change account type
  - Update parent account relationship
  - Edit description

#### Edit Journal Entry
- **Location**: `/accounting/journal-entries`
- **Button**: Edit icon in Actions column
- **Required Role**: Admin or Accountant
- **Restrictions**: Only draft entries can be edited
- **Features**:
  - Modify entry details
  - Add/remove ledger entries
  - Update amounts and descriptions

#### Post Journal Entry
- **Location**: `/accounting/journal-entries`
- **Button**: Post icon in Actions column
- **Required Role**: Admin or Accountant
- **Effect**: Marks entry as posted (cannot be edited after posting)

### 4. DELETE Operations

#### Delete Account
- **Location**: `/accounting/accounts`
- **Button**: Delete icon in Actions column
- **Required Role**: Admin or Accountant
- **Behavior**:
  - Soft delete if account has transactions
  - Hard delete if no transactions exist
  - Confirmation dialog required

## Role-Based Access Control

### Admin Users
- ✅ Full CRUD access to all accounting features
- ✅ Can create, edit, delete accounts
- ✅ Can create, edit, post journal entries
- ✅ Can view all reports and data

### Accountant Users
- ✅ Full CRUD access to all accounting features
- ✅ Can create, edit, delete accounts
- ✅ Can create, edit, post journal entries
- ✅ Can view all reports and data

### Regular Users
- ✅ Can view all accounting data
- ✅ Can access reports and trial balance
- ❌ Cannot create, edit, or delete accounts
- ❌ Cannot create or modify journal entries
- ❌ UI buttons are hidden for restricted operations

## Navigation and Access

### Main Navigation
1. **Sidebar**: Click "Accounting" → "Chart of Accounts"
2. **Direct URL**: `/accounting/accounts`

### Sub-Navigation
- **Account List Tab**: Flat list view with search and filters
- **Chart of Accounts Tab**: Hierarchical tree view grouped by type

### Related Pages
- **Journal Entries**: `/accounting/journal-entries`
- **Trial Balance**: `/accounting/trial-balance`

## Features by Page

### Account List Page (`/accounting/accounts`)

#### Account List Tab
- **Search**: Real-time search by account name or number
- **Filters**: Filter by account type, status (active/inactive)
- **Sorting**: Sortable columns
- **Actions**: Edit, Delete (role-based)
- **Pagination**: Configurable page size

#### Chart of Accounts Tab
- **Hierarchy**: Parent-child account relationships
- **Grouping**: Organized by account type
- **Expansion**: Expandable account type sections
- **Balances**: Real-time balance display
- **Statistics**: Account count per type

### Journal Entries Page (`/accounting/journal-entries`)
- **Entry Management**: Create, edit, post journal entries
- **Ledger Entries**: Multiple line items per entry
- **Validation**: Automatic debit/credit balance checking
- **Status Tracking**: Draft vs. Posted entries
- **Account Selection**: Autocomplete account picker

### Trial Balance Page (`/accounting/trial-balance`)
- **Real-time Calculation**: Automatically calculated from posted entries
- **Account Grouping**: Organized by account type
- **Balance Validation**: Ensures accounting equation balance
- **Export**: CSV export functionality
- **Print Support**: Formatted for printing

## Data Validation

### Account Creation
- **Account Number**: Must be unique
- **Account Name**: Required, descriptive
- **Account Type**: Must select from predefined types
- **Parent Account**: Must be same type as child (if specified)

### Journal Entry Creation
- **Entry Number**: Auto-generated, unique
- **Date**: Required, valid date
- **Ledger Entries**: Minimum 2 entries required
- **Balance**: Total debits must equal total credits
- **Accounts**: Must select valid, active accounts

## Error Handling

### Common Errors
- **Permission Denied**: User lacks required role
- **Validation Errors**: Invalid or missing required fields
- **Balance Errors**: Debits don't equal credits in journal entries
- **Duplicate Errors**: Account number already exists

### Error Messages
- Clear, descriptive error messages
- Field-specific validation feedback
- Success confirmations for completed operations

## Best Practices

### Account Management
1. **Numbering**: Use consistent numbering scheme (1000s for assets, etc.)
2. **Naming**: Use clear, descriptive account names
3. **Hierarchy**: Organize accounts in logical parent-child relationships
4. **Types**: Assign correct account types for proper reporting

### Journal Entries
1. **Descriptions**: Provide clear, detailed descriptions
2. **References**: Include reference numbers for traceability
3. **Review**: Review entries before posting
4. **Backup**: Regular database backups before major changes

### Security
1. **Roles**: Assign appropriate roles to users
2. **Permissions**: Regularly review user permissions
3. **Audit**: Monitor account and entry modifications
4. **Backup**: Maintain regular backups

## Troubleshooting

### Missing CRUD Buttons
- **Check User Role**: Ensure user has admin or accountant role
- **Check Login**: Verify user is properly authenticated
- **Clear Cache**: Clear browser cache and reload

### Permission Errors
- **Verify Role**: Check user role in profile
- **Contact Admin**: Request role upgrade if needed
- **Re-login**: Try logging out and back in

### Data Issues
- **Refresh Page**: Reload to get latest data
- **Check Network**: Verify internet connection
- **Server Status**: Check if server is running

## Integration

### Chart of Accounts Integration
- **Banking**: Bank transactions create automatic journal entries
- **Invoicing**: Invoice creation affects receivables accounts
- **Expenses**: Expense recording affects expense accounts
- **Payroll**: Payroll processing affects salary and liability accounts

### Reporting Integration
- **Trial Balance**: Uses chart of accounts for balance calculation
- **Financial Statements**: Future enhancement using account structure
- **Analytics**: Account-based financial analysis