import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  Button,
  TextField
} from '@mui/material';
import {
  AccountBalance as AccountIcon,
  Print as PrintIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { accountingService } from '../../services/accountingService';

const TrialBalance = () => {
  const [trialBalance, setTrialBalance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [asOfDate, setAsOfDate] = useState(new Date());

  useEffect(() => {
    loadTrialBalance();
  }, []);

  const loadTrialBalance = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await accountingService.getTrialBalance();
      setTrialBalance(response.data || []);
    } catch (err) {
      setError('Failed to load trial balance');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const getAccountTypeColor = (typeName) => {
    const colors = {
      'Asset': 'success',
      'Liability': 'error',
      'Equity': 'info',
      'Revenue': 'primary',
      'Expense': 'warning'
    };
    return colors[typeName] || 'default';
  };

  const calculateTotals = () => {
    const totalDebits = trialBalance.reduce((sum, account) => sum + account.debit, 0);
    const totalCredits = trialBalance.reduce((sum, account) => sum + account.credit, 0);
    return { totalDebits, totalCredits };
  };

  const groupByAccountType = () => {
    const grouped = {};
    trialBalance.forEach(account => {
      if (!grouped[account.account_type]) {
        grouped[account.account_type] = [];
      }
      grouped[account.account_type].push(account);
    });
    return grouped;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Account Number', 'Account Name', 'Account Type', 'Debit', 'Credit'];
    const csvContent = [
      headers.join(','),
      ...trialBalance.map(account => [
        account.account_number,
        `"${account.account_name}"`,
        account.account_type,
        account.debit,
        account.credit
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial-balance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const { totalDebits, totalCredits } = calculateTotals();
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;
  const groupedAccounts = groupByAccountType();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Trial Balance</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button startIcon={<RefreshIcon />} onClick={loadTrialBalance}>
              Refresh
            </Button>
            <Button startIcon={<PrintIcon />} onClick={handlePrint}>
              Print
            </Button>
            <Button startIcon={<ExportIcon />} onClick={handleExport}>
              Export
            </Button>
          </Box>
        </Box>

        {/* Date Filter */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography variant="subtitle1">As of Date:</Typography>
            </Grid>
            <Grid item>
              <DatePicker
                label="As of Date"
                value={asOfDate}
                onChange={(newValue) => setAsOfDate(newValue)}
                slots={{
                  textField: TextField
                }}
                slotProps={{
                  textField: {
                    size: 'small'
                  }
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  Total Debits
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(totalDebits)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="error.main">
                  Total Credits
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(totalCredits)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color={isBalanced ? 'success.main' : 'error.main'}>
                  Balance Status
                </Typography>
                <Typography variant="h4" color={isBalanced ? 'success.main' : 'error.main'}>
                  {isBalanced ? 'Balanced ✓' : 'Out of Balance'}
                </Typography>
                {!isBalanced && (
                  <Typography variant="body2" color="error.main">
                    Difference: {formatCurrency(Math.abs(totalDebits - totalCredits))}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Trial Balance Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Account Number</TableCell>
                <TableCell>Account Name</TableCell>
                <TableCell>Account Type</TableCell>
                <TableCell align="right">Debit</TableCell>
                <TableCell align="right">Credit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedAccounts).map(([accountType, accounts]) => (
                <React.Fragment key={accountType}>
                  {/* Account Type Header */}
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell colSpan={5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={accountType} 
                          color={getAccountTypeColor(accountType)}
                          size="small"
                        />
                        <Typography variant="subtitle2" fontWeight="bold">
                          ({accounts.length} accounts)
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                  
                  {/* Account Rows */}
                  {accounts.map(account => (
                    <TableRow key={account.account_id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2 }}>
                          <AccountIcon fontSize="small" />
                          {account.account_number}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ pl: 2 }}>{account.account_name}</TableCell>
                      <TableCell sx={{ pl: 2 }}>
                        <Chip 
                          label={account.account_type} 
                          color={getAccountTypeColor(account.account_type)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {account.debit > 0 && (
                          <Typography color="success.main">
                            {formatCurrency(account.debit)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {account.credit > 0 && (
                          <Typography color="error.main">
                            {formatCurrency(account.credit)}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Subtotal Row */}
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell colSpan={3} sx={{ pl: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {accountType} Subtotal
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                        {formatCurrency(accounts.reduce((sum, acc) => sum + acc.debit, 0))}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight="bold" color="error.main">
                        {formatCurrency(accounts.reduce((sum, acc) => sum + acc.credit, 0))}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
              
              {/* Grand Total Row */}
              <TableRow sx={{ bgcolor: isBalanced ? 'success.light' : 'error.light' }}>
                <TableCell colSpan={3}>
                  <Typography variant="h6" fontWeight="bold">
                    TOTAL
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    {formatCurrency(totalDebits)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" fontWeight="bold" color="error.main">
                    {formatCurrency(totalCredits)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer Information */}
        <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
          <Typography variant="body2" color="text.secondary">
            Trial Balance as of {asOfDate.toLocaleDateString()} • 
            Generated on {new Date().toLocaleString()} • 
            Total Accounts: {trialBalance.length}
          </Typography>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default TrialBalance;