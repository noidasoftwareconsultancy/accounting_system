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
  Button,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Divider,
  TextField
} from '@mui/material';
import {
  CheckCircle as ReconcileIcon,
  Warning as WarningIcon,
  TrendingUp as DepositIcon,
  TrendingDown as WithdrawalIcon,
  SwapHoriz as TransferIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import bankingService from '../../services/bankingService';
import { useAuth } from '../../contexts/AuthContext';
import { canManageBanking } from '../../utils/permissions';

const Reconciliation = () => {
  const { user } = useAuth();
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [unreconciledTransactions, setUnreconciledTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Check if user can manage banking operations
  const canManage = canManageBanking(user);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [reconciliationDate, setReconciliationDate] = useState(new Date());
  const [statementBalance, setStatementBalance] = useState('');
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadBankAccounts();
    loadStats();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadUnreconciledTransactions();
    }
  }, [selectedAccount]);

  const loadBankAccounts = async () => {
    try {
      const response = await bankingService.getBankAccounts();
      setBankAccounts(response.data?.bankAccounts || []);
    } catch (err) {
      setError('Failed to load bank accounts');
      console.error(err);
    }
  };

  const loadUnreconciledTransactions = async () => {
    try {
      setLoading(true);
      const response = await bankingService.getUnreconciledTransactions(selectedAccount);
      setUnreconciledTransactions(response.data || []);
    } catch (err) {
      setError('Failed to load unreconciled transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await bankingService.getBankingStats();
      setStats(response.data || {});
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleSelectTransaction = (transactionId) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === unreconciledTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(unreconciledTransactions.map(t => t.id));
    }
  };

  const handleBulkReconcile = async () => {
    if (selectedTransactions.length === 0) {
      setError('Please select transactions to reconcile');
      return;
    }

    try {
      await bankingService.bulkReconcileTransactions(selectedTransactions);
      setSuccess(`${selectedTransactions.length} transactions reconciled successfully`);
      setSelectedTransactions([]);
      loadUnreconciledTransactions();
      loadStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reconcile transactions');
    }
  };

  const handleReconcileTransaction = async (transactionId) => {
    try {
      await bankingService.reconcileTransaction(transactionId);
      setSuccess('Transaction reconciled successfully');
      loadUnreconciledTransactions();
      loadStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reconcile transaction');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <DepositIcon color="success" fontSize="small" />;
      case 'withdrawal':
        return <WithdrawalIcon color="error" fontSize="small" />;
      case 'transfer':
        return <TransferIcon color="info" fontSize="small" />;
      default:
        return <TransferIcon fontSize="small" />;
    }
  };

  const calculateSelectedAmount = () => {
    return selectedTransactions.reduce((total, transactionId) => {
      const transaction = unreconciledTransactions.find(t => t.id === transactionId);
      if (transaction) {
        return total + (transaction.transaction_type === 'deposit' ? 
          parseFloat(transaction.amount) : -parseFloat(transaction.amount));
      }
      return total;
    }, 0);
  };

  const selectedAccount_obj = bankAccounts.find(acc => acc.id === parseInt(selectedAccount));
  const bookBalance = selectedAccount_obj?.current_balance || 0;
  const selectedAmount = calculateSelectedAmount();
  const adjustedBalance = bookBalance - selectedAmount;
  const difference = statementBalance ? parseFloat(statementBalance) - adjustedBalance : 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Typography variant="h4" gutterBottom>
          Bank Reconciliation
        </Typography>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Account Selection */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Select Bank Account</InputLabel>
                <Select
                  value={selectedAccount}
                  label="Select Bank Account"
                  onChange={(e) => setSelectedAccount(e.target.value)}
                >
                  {bankAccounts.map(account => (
                    <MenuItem key={account.id} value={account.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BankIcon fontSize="small" />
                        {account.account_name} - {account.account_number}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Reconciliation Date"
                value={reconciliationDate}
                onChange={(newValue) => setReconciliationDate(newValue)}
                slots={{
                  textField: TextField
                }}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Statement Balance"
                type="number"
                inputProps={{ step: 0.01 }}
                value={statementBalance}
                onChange={(e) => setStatementBalance(e.target.value)}
                placeholder="Enter bank statement balance"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                disabled={!selectedAccount}
                onClick={loadUnreconciledTransactions}
              >
                Load Transactions
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Reconciliation Summary */}
        {selectedAccount && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    Book Balance
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(bookBalance)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="warning.main">
                    Unreconciled Items
                  </Typography>
                  <Typography variant="h4">
                    {unreconciledTransactions.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(Math.abs(selectedAmount))}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="info.main">
                    Adjusted Balance
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(adjustedBalance)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color={Math.abs(difference) < 0.01 ? 'success.main' : 'error.main'}>
                    Difference
                  </Typography>
                  <Typography variant="h4" color={Math.abs(difference) < 0.01 ? 'success.main' : 'error.main'}>
                    {statementBalance ? formatCurrency(difference) : '-'}
                  </Typography>
                  {Math.abs(difference) < 0.01 && statementBalance && (
                    <Chip label="Balanced" color="success" size="small" />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Reconciliation Status */}
        {statementBalance && Math.abs(difference) < 0.01 && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReconcileIcon />
              Account is balanced! The adjusted book balance matches the statement balance.
            </Box>
          </Alert>
        )}

        {statementBalance && Math.abs(difference) >= 0.01 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon />
              Account is out of balance by {formatCurrency(Math.abs(difference))}. 
              Please review the transactions and statement balance.
            </Box>
          </Alert>
        )}

        {/* Unreconciled Transactions */}
        {selectedAccount && (
          <Paper>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Unreconciled Transactions ({unreconciledTransactions.length})
                </Typography>
                {selectedTransactions.length > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<ReconcileIcon />}
                    onClick={handleBulkReconcile}
                    color="success"
                  >
                    Reconcile Selected ({selectedTransactions.length})
                  </Button>
                )}
              </Box>
              {selectedTransactions.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Selected amount: {formatCurrency(selectedAmount)}
                </Typography>
              )}
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : unreconciledTransactions.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <ReconcileIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" color="success.main">
                  All transactions are reconciled!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No unreconciled transactions found for this account.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selectedTransactions.length > 0 && selectedTransactions.length < unreconciledTransactions.length}
                          checked={selectedTransactions.length > 0 && selectedTransactions.length === unreconciledTransactions.length}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Reference</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {unreconciledTransactions.map(transaction => (
                      <TableRow key={transaction.id}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedTransactions.includes(transaction.id)}
                            onChange={() => handleSelectTransaction(transaction.id)}
                          />
                        </TableCell>
                        <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getTransactionIcon(transaction.transaction_type)}
                            <Chip 
                              label={transaction.transaction_type} 
                              size="small"
                              color={transaction.transaction_type === 'deposit' ? 'success' : 'error'}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {transaction.description}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="body2" 
                            fontWeight="bold"
                            color={transaction.transaction_type === 'deposit' ? 'success.main' : 'error.main'}
                          >
                            {transaction.transaction_type === 'deposit' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {transaction.reference_number}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            startIcon={<ReconcileIcon />}
                            onClick={() => handleReconcileTransaction(transaction.id)}
                          >
                            Reconcile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        )}

        {/* Instructions */}
        {!selectedAccount && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <BankIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Bank Reconciliation Process
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Select a bank account to start the reconciliation process. Compare your book balance 
              with your bank statement and reconcile any differences.
            </Typography>
            <Box sx={{ mt: 3, textAlign: 'left', maxWidth: 600, mx: 'auto' }}>
              <Typography variant="subtitle2" gutterBottom>
                Steps to reconcile:
              </Typography>
              <Typography variant="body2" component="div">
                1. Select the bank account you want to reconcile<br/>
                2. Enter the statement balance from your bank statement<br/>
                3. Review unreconciled transactions<br/>
                4. Mark transactions as reconciled when they match your statement<br/>
                5. Investigate any differences between book and statement balance
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default Reconciliation;