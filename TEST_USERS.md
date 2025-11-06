# Test Users for Banking System

## Default Users Created by Seed Script

Run the seed script to create these test users:

```bash
cd server
npm run db:seed
```

### Admin User
- **Email**: admin@example.com
- **Password**: admin123
- **Role**: admin
- **Permissions**: Full access to all features

### Accountant User
- **Email**: accountant@example.com
- **Password**: admin123
- **Role**: accountant
- **Permissions**: Full access to banking and accounting features

### Regular User
- **Email**: user@example.com
- **Password**: admin123
- **Role**: user
- **Permissions**: Read-only access to financial data

## Testing Banking Features

1. **Login as Admin or Accountant** to test full banking functionality:
   - Create/edit/delete bank accounts
   - Create transactions
   - Perform reconciliation
   - Transfer between accounts

2. **Login as Regular User** to test read-only access:
   - View bank accounts (no create/edit buttons)
   - View transactions (no create/reconcile buttons)
   - View reconciliation data (no reconcile buttons)

## Troubleshooting 403 Errors

If you get 403 Forbidden errors:

1. **Check your user role**: Make sure you're logged in as admin or accountant
2. **Check the browser console**: Look for role check logs
3. **Check server logs**: Look for authentication debug messages
4. **Verify token**: Make sure your JWT token is valid and not expired

## Role Permissions

| Feature | Admin | Accountant | User |
|---------|-------|------------|------|
| View Bank Accounts | ✅ | ✅ | ✅ |
| Create Bank Accounts | ✅ | ✅ | ❌ |
| Edit Bank Accounts | ✅ | ✅ | ❌ |
| Delete Bank Accounts | ✅ | ✅ | ❌ |
| View Transactions | ✅ | ✅ | ✅ |
| Create Transactions | ✅ | ✅ | ❌ |
| Reconcile Transactions | ✅ | ✅ | ❌ |
| Transfer Between Accounts | ✅ | ✅ | ❌ |
| View Reconciliation | ✅ | ✅ | ✅ |
| Perform Reconciliation | ✅ | ✅ | ❌ |