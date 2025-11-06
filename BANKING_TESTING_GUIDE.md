# Banking System Testing Guide

## Quick Start

### 1. Setup Database and Users
```bash
# Navigate to server directory
cd server

# Run database migrations (if not already done)
npm run db:migrate

# Seed the database with test users
npm run db:seed
```

### 2. Start the Application
```bash
# Start server (in server directory)
npm run dev

# Start client (in client directory)
cd ../client
npm start
```

### 3. Login with Test Users

#### For Full Banking Access (Admin/Accountant):
- **Email**: admin@example.com or accountant@example.com
- **Password**: admin123

#### For Read-Only Access (Regular User):
- **Email**: user@example.com
- **Password**: admin123

## Testing Banking Features

### 1. Bank Account Management (`/banking/accounts`)

**As Admin/Accountant:**
- ✅ Create new bank accounts
- ✅ Edit existing accounts
- ✅ Delete accounts
- ✅ Transfer between accounts
- ✅ View account statistics

**As Regular User:**
- ✅ View bank accounts
- ❌ No create/edit/delete buttons
- ❌ No transfer functionality

### 2. Transaction Management (`/banking/transactions`)

**As Admin/Accountant:**
- ✅ Create new transactions
- ✅ Reconcile transactions
- ✅ Bulk reconcile multiple transactions
- ✅ Filter and search transactions

**As Regular User:**
- ✅ View transactions
- ❌ No create transaction button
- ❌ No reconcile functionality
- ❌ No bulk operations

### 3. Bank Reconciliation (`/banking/reconciliation`)

**As Admin/Accountant:**
- ✅ Select accounts for reconciliation
- ✅ Enter statement balances
- ✅ Reconcile individual transactions
- ✅ Bulk reconcile transactions
- ✅ View balance differences

**As Regular User:**
- ✅ View reconciliation data
- ❌ No reconcile buttons
- ❌ Cannot modify reconciliation status

## Expected Behavior

### Successful Operations
- Bank account creation should work for admin/accountant
- Transaction creation should update account balances
- Reconciliation should mark transactions as reconciled
- Transfers should create linked transactions

### Permission Errors
- Regular users should see 403 errors when trying to create/modify
- UI buttons should be hidden based on user role
- Server should log role check information

## Troubleshooting

### 403 Forbidden Errors
1. **Check User Role**: Ensure you're logged in as admin or accountant
2. **Check Browser Console**: Look for authentication errors
3. **Check Server Logs**: Look for role check debug messages
4. **Clear Browser Storage**: Clear localStorage and login again

### Database Issues
1. **Run Migrations**: `npm run db:migrate`
2. **Reset Database**: `npm run db:reset` (WARNING: This will delete all data)
3. **Re-seed Database**: `npm run db:seed`

### Authentication Issues
1. **Check JWT Token**: Verify token in browser localStorage
2. **Check Token Expiry**: Tokens expire after 7 days by default
3. **Check Environment Variables**: Ensure JWT_SECRET is set

## API Testing with curl

### Login and Get Token
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Create Bank Account (with token)
```bash
curl -X POST http://localhost:5001/api/banking/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "account_name": "Test Account",
    "account_number": "12345678",
    "bank_name": "Test Bank",
    "account_type": "checking",
    "currency": "USD",
    "opening_balance": 1000
  }'
```

### Get Bank Accounts
```bash
curl -X GET http://localhost:5001/api/banking/accounts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Expected Test Results

### Admin/Accountant Login
- Should see all banking management buttons
- Should be able to create accounts and transactions
- Should be able to perform reconciliation
- Should see account statistics

### Regular User Login
- Should see banking data but no management buttons
- Should get 403 errors when trying to create/modify
- Should still be able to view all financial information

### Database State After Testing
- Should have test users with different roles
- Should have sample bank accounts
- Should have transaction history
- Should have reconciliation data

## Performance Testing

### Large Dataset Testing
1. Create multiple bank accounts (10+)
2. Create many transactions (100+)
3. Test pagination and filtering
4. Test bulk reconciliation with many transactions

### Concurrent User Testing
1. Login with multiple users simultaneously
2. Perform operations concurrently
3. Verify data consistency
4. Check for race conditions

## Security Testing

### Role-Based Access Control
1. Verify each role has appropriate permissions
2. Test role escalation attempts
3. Verify JWT token validation
4. Test expired token handling

### Input Validation
1. Test with invalid account numbers
2. Test with negative amounts
3. Test with invalid dates
4. Test with SQL injection attempts

## Integration Testing

### Chart of Accounts Integration
1. Verify bank transactions create journal entries
2. Test account balance synchronization
3. Verify trial balance includes bank accounts

### Other Module Integration
1. Test invoice payment processing
2. Test expense payment processing
3. Test payroll payment processing
4. Verify audit trail creation