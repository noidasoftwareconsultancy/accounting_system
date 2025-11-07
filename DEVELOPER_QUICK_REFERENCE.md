# Developer Quick Reference - Client-Server Alignment

## Quick Start Guide

This document provides quick reference for developers working with the newly aligned features.

## New Payroll Module

### Creating a Payroll Run

```javascript
import payrollService from '../../services/payrollService';

// Create a new payroll run
const payrollData = {
  run_name: 'Monthly Payroll - November 2025',
  month: 11,
  year: 2025,
  start_date: '2025-11-01',
  end_date: '2025-11-30',
  description: 'Regular monthly payroll'
};

const response = await payrollService.create(payrollData);
```

### Processing Payroll

```javascript
// Generate payroll data for selected employees
const payrollData = await payrollService.generatePayrollData(runId, employeeIds);

// Process payroll with employee payslips
const employeePayslips = payrollData.map(data => ({
  employee_id: data.employee_id,
  basic_salary: data.basic_salary,
  gross_salary: data.gross_salary,
  total_deductions: data.total_deductions,
  net_salary: data.net_salary
}));

await payrollService.processPayroll(runId, employeePayslips);
```

### Updating Payment Status

```javascript
// Update single payslip
await payrollService.updatePaymentStatus(payslipId, 'paid', '2025-11-30');

// Bulk update
await payrollService.bulkUpdatePaymentStatus([id1, id2, id3], 'paid', '2025-11-30');
```

## Enhanced Employee Service

### Bulk Attendance Recording

```javascript
import employeeService from '../../services/employeeService';

const attendanceRecords = [
  {
    employee_id: 1,
    date: '2025-11-07',
    check_in: '09:00:00',
    check_out: '17:00:00',
    status: 'present'
  },
  // ... more records
];

await employeeService.bulkUpdateAttendance(attendanceRecords);
```

### Salary Structure Management

```javascript
// Get current salary structure
const salaryStructure = await employeeService.getSalaryStructure(employeeId);

// Update salary structure
const newSalary = {
  basic_salary: 5000,
  allowances: 1000,
  effective_from: '2025-12-01'
};

await employeeService.updateEmployeeSalaryStructure(employeeId, newSalary);
```

### Leave Management

```javascript
// Apply for leave
const leaveData = {
  employee_id: 1,
  leave_type: 'annual',
  start_date: '2025-12-01',
  end_date: '2025-12-05',
  reason: 'Family vacation'
};

await employeeService.applyLeave(leaveData);

// Approve/Reject leave
await employeeService.approveLeave(leaveId);
await employeeService.rejectLeave(leaveId, 'Insufficient leave balance');
```

## Enhanced Banking Service

### Bank Reconciliation

```javascript
import bankingService from '../../services/bankingService';

// Start reconciliation
const reconciliationData = {
  statement_date: '2025-11-30',
  statement_balance: 50000,
  transactions: [...]
};

const reconciliation = await bankingService.startReconciliation(
  accountId, 
  reconciliationData
);

// Complete reconciliation
await bankingService.completeReconciliation(accountId, reconciliation.id);
```

### Transaction Categorization

```javascript
// Categorize single transaction
await bankingService.categorizeTransaction(transactionId, categoryId);

// Bulk categorization
await bankingService.bulkCategorizeTransactions(
  [txId1, txId2, txId3], 
  categoryId
);
```

### Cash Flow Reporting

```javascript
// Get cash flow report
const report = await bankingService.getCashFlowReport(
  accountId,
  '2025-11-01',
  '2025-11-30'
);

// Get banking analytics
const analytics = await bankingService.getBankingAnalytics('month');
```

## Tax Service

### Tax Rate Management

```javascript
import taxService from '../../services/taxService';

// Create tax rate
const taxRateData = {
  name: 'Income Tax - Standard',
  tax_type: 'income',
  rate: 20,
  is_percentage: true,
  is_active: true,
  effective_from: '2025-01-01'
};

await taxService.createTaxRate(taxRateData);
```

### Tax Calculations

```javascript
// Calculate tax
const calculation = await taxService.calculateTax({
  amount: 10000,
  tax_type: 'income',
  tax_rate_id: 1
});

// Calculate income tax
const incomeTax = await taxService.calculateIncomeTax({
  gross_income: 50000,
  deductions: 5000,
  tax_year: 2025
});
```

### Tax Reports

```javascript
// Generate quarterly report
const quarterlyReport = await taxService.getQuarterlyTaxReport(2025, 4);

// Generate annual report
const annualReport = await taxService.getAnnualTaxReport(2025);

// Get tax summary
const summary = await taxService.getTaxSummary('month');
```

## Common Patterns

### Error Handling

```javascript
try {
  const response = await payrollService.create(data);
  addNotification({
    type: 'success',
    title: 'Success',
    message: 'Payroll run created successfully'
  });
} catch (error) {
  console.error('Error:', error);
  addNotification({
    type: 'error',
    title: 'Error',
    message: error.response?.data?.message || 'Operation failed'
  });
}
```

### Pagination

```javascript
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);

const fetchData = async () => {
  const response = await service.getAll(page + 1, rowsPerPage, filters);
  setData(response.data.items);
  setTotalCount(response.data.pagination.total);
};
```

### Loading States

```javascript
const [loading, setLoading] = useState(true);

const loadData = async () => {
  try {
    setLoading(true);
    const response = await service.getData();
    setData(response.data);
  } catch (error) {
    setError('Failed to load data');
  } finally {
    setLoading(false);
  }
};
```

## API Response Formats

### Standard Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "msg": "Invalid email format"
    }
  ]
}
```

## Utility Functions

### Currency Formatting

```javascript
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0);
};
```

### Date Formatting

```javascript
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
```

### Percentage Formatting

```javascript
const formatPercentage = (value, decimals = 2) => {
  return `${parseFloat(value).toFixed(decimals)}%`;
};
```

## Component Patterns

### Status Chips

```javascript
const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'success';
    case 'processing': return 'warning';
    case 'draft': return 'default';
    case 'failed': return 'error';
    default: return 'default';
  }
};

<Chip
  label={status.toUpperCase()}
  color={getStatusColor(status)}
  size="small"
/>
```

### Action Menus

```javascript
const [anchorEl, setAnchorEl] = useState(null);
const [selectedItem, setSelectedItem] = useState(null);

<IconButton onClick={(e) => {
  setAnchorEl(e.currentTarget);
  setSelectedItem(item);
}}>
  <MoreVert />
</IconButton>

<Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={() => setAnchorEl(null)}
>
  <MenuItem onClick={handleEdit}>Edit</MenuItem>
  <MenuItem onClick={handleDelete}>Delete</MenuItem>
</Menu>
```

### Confirmation Dialogs

```javascript
const [dialogOpen, setDialogOpen] = useState(false);

<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
  <DialogTitle>Confirm Action</DialogTitle>
  <DialogContent>
    <Typography>Are you sure you want to proceed?</Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
    <Button onClick={handleConfirm} variant="contained">Confirm</Button>
  </DialogActions>
</Dialog>
```

## Testing Examples

### Service Testing

```javascript
import payrollService from '../../services/payrollService';

describe('PayrollService', () => {
  it('should create payroll run', async () => {
    const data = {
      run_name: 'Test Run',
      month: 11,
      year: 2025,
      start_date: '2025-11-01',
      end_date: '2025-11-30'
    };
    
    const response = await payrollService.create(data);
    expect(response.success).toBe(true);
    expect(response.data).toHaveProperty('id');
  });
});
```

### Component Testing

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import PayrollList from './PayrollList';

describe('PayrollList', () => {
  it('should render payroll runs', async () => {
    render(<PayrollList />);
    
    await screen.findByText('Payroll Management');
    expect(screen.getByText('Create Payroll Run')).toBeInTheDocument();
  });
});
```

## Performance Tips

1. **Use React.memo for expensive components**
```javascript
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});
```

2. **Debounce search inputs**
```javascript
const debouncedSearch = useCallback(
  debounce((value) => {
    performSearch(value);
  }, 300),
  []
);
```

3. **Lazy load heavy components**
```javascript
const PayrollDetail = lazy(() => import('./pages/payroll/PayrollDetail'));
```

4. **Use pagination for large datasets**
```javascript
// Always implement pagination for lists with 50+ items
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);
```

## Security Best Practices

1. **Always validate user input**
2. **Use authentication middleware on all protected routes**
3. **Sanitize data before sending to API**
4. **Handle sensitive data (passwords, tokens) securely**
5. **Implement proper error handling without exposing system details**

## Support and Resources

- **API Documentation**: See `CLIENT_SERVER_ALIGNMENT_REPORT.md`
- **Completion Summary**: See `ALIGNMENT_COMPLETION_SUMMARY.md`
- **Server Routes**: Check `server/routes/` directory
- **Service Files**: Check `client/src/services/` directory

---

**Last Updated**: November 7, 2025
**Version**: 1.0.0