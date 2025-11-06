import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as ReconcileIcon,
  TrendingUp as DepositIcon,
  TrendingDown as WithdrawalIcon,
  SwapHoriz as TransferIcon,
  FilterList as FilterIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import bankingService from '../../services/bankingService';
import { useAuth } from '../../contexts/AuthContext';
import { canManageBanking } from '../../utils/permissions';

const TransactionList = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Check if user can manage banking operations
  const canManage = canManageBanking(user);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalTransactions, setTotalTransactions] = useState(0);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  
  // Form states
  const [formData, setFormData] = useState({
    bank_account_id: '',
    transaction_type: 'deposit',
    amount: '',
    transaction_date: new Date(),
    description: '',
    reference_number: ''
  });

  // Filter states
  const [filters, setFilters] = useState({
    bank_account_id: '',
    transaction_type: '',
    is_reconciled: '',
    start_date: null,
    end_date: null
  });

  useEffect(() => {
    loadData();
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      };
      
      const response = await bankingService.getTransactions(params);
      setTransactions(response.data?.transactions || []);
      setTotalTransactions(response.data?.pagination?.total || 0);
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBankAccounts = async () => {
    try {
      const response = await bankingService.getBankAccounts();
      setBankAccounts(response.data?.bankAccounts || []);
    } catch (err) {
      console.error('Failed to load bank accounts:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await bankingService.createTransaction(formData);
      setSuccess('Transaction created successfully');
      handleCloseDialog();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create transaction');
    }
  };

  const handleReconcile = async (transactionId) => {
    try {
      await bankingService.reconcileTransaction(transactionId);
      setSuccess('Transaction reconciled successfully');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reconcile transaction');
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
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reconcile transactions');
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
    const unreconciledTransactions = transactions
      .filter(t => !t.is_reconciled)
      .map(t => t.id);
    
    if (selectedTransactions.length === unreconciledTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(unreconciledTransactions);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      bank_account_id: '',
      transaction_type: 'deposit',
      amount: '',
      transaction_date: new Date(),
      description: '',
      reference_number: ''
    });
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
        return <DepositIcon color="success" />;
      case 'withdrawal':
        return <WithdrawalIcon color="error" />;
      case 'transfer':
        return <TransferIcon color="info" />;
      default:
        return <TransferIcon />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
        return 'success';
      case 'withdrawal':
        return 'error';
      case 'transfer':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const unreconciledCount = transactions.filter(t => !t.is_reconciled).length;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Bank Transactions</Typography>
          {canManage && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {selectedTransactions.length > 0 && (
                <Button 
                  variant="outlined" 
                  startIcon={<ReconcileIcon />}
                  onClick={handleBulkReconcile}
                  color="success"
                >
                  Reconcile Selected ({selectedTransactions.length})
                </Button>
              )}
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
              >
                Add Transaction
              </Button>
            </Box>
          )}
        </Box>

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

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Account</InputLabel>
                <Select
                  value={filters.bank_account_id}
                  label="Account"
                  onChange={(e) => setFilters(prev => ({ ...prev, bank_account_id: e.target.value }))}
                >
                  <MenuItem value="">All Accounts</MenuItem>
                  {bankAccounts.map(account => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.account_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.transaction_type}
                  label="Type"
                  onChange={(e) => setFilters(prev => ({ ...prev, transaction_type: e.target.value }))}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="deposit">Deposit</MenuItem>
                  <MenuItem value="withdrawal">Withdrawal</MenuItem>
                  <MenuItem value="transfer">Transfer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.is_reconciled}
                  label="Status"
                  onChange={(e) => setFilters(prev => ({ ...prev, is_reconciled: e.target.value }))}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Reconciled</MenuItem>
                  <MenuItem value="false">Unreconciled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <DatePicker
                label="Start Date"
                value={filters.start_date}
                onChange={(newValue) => setFilters(prev => ({ ...prev, start_date: newValue }))}
                slots={{
                  textField: TextField
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <DatePicker
                label="End Date"
                value={filters.end_date}
                onChange={(newValue) => setFilters(prev => ({ ...prev, end_date: newValue }))}
                slots={{
                  textField: TextField
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setFilters({
                  bank_account_id: '',
                  transaction_type: '',
                  is_reconciled: '',
                  start_date: null,
                  end_date: null
                })}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Summary */}
        {unreconciledCount > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {unreconciledCount} unreconciled transactions found. 
            <Button 
              size="small" 
              onClick={() => setFilters(prev => ({ ...prev, is_reconciled: 'false' }))}
              sx={{ ml: 1 }}
            >
              View Unreconciled
            </Button>
          </Alert>
        )}

        {/* Transactions Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  {canManage && (
                    <Checkbox
                      indeterminate={selectedTransactions.length > 0 && selectedTransactions.length < transactions.filter(t => !t.is_reconciled).length}
                      checked={selectedTransactions.length > 0 && selectedTransactions.length === transactions.filter(t => !t.is_reconciled).length}
                      onChange={handleSelectAll}
                    />
                  )}
                </TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map(transaction => (
                <TableRow key={transaction.id}>
                  <TableCell padding="checkbox">
                    {canManage && !transaction.is_reconciled && (
                      <Checkbox
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={() => handleSelectTransaction(transaction.id)}
                      />
                    )}
                  </TableCell>
                  <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {transaction.bank_account?.account_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {transaction.bank_account?.account_number}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getTransactionIcon(transaction.transaction_type)}
                      <Chip 
                        label={transaction.transaction_type} 
                        color={getTransactionColor(transaction.transaction_type)}
                        size="small"
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
                    <Chip 
                      label={transaction.is_reconciled ? 'Reconciled' : 'Unreconciled'} 
                      color={transaction.is_reconciled ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {canManage && !transaction.is_reconciled && (
                      <Tooltip title="Reconcile Transaction">
                        <IconButton 
                          size="small" 
                          onClick={() => handleReconcile(transaction.id)}
                          color="success"
                        >
                          <ReconcileIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <TablePagination
            component="div"
            count={totalTransactions}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </TableContainer>

        {/* Transaction Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Bank Account</InputLabel>
                    <Select
                      value={formData.bank_account_id}
                      label="Bank Account"
                      onChange={(e) => setFormData(prev => ({ ...prev, bank_account_id: e.target.value }))}
                    >
                      {bankAccounts.filter(acc => acc.is_active).map(account => (
                        <MenuItem key={account.id} value={account.id}>
                          {account.account_name} - {account.account_number}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Transaction Type</InputLabel>
                    <Select
                      value={formData.transaction_type}
                      label="Transaction Type"
                      onChange={(e) => setFormData(prev => ({ ...prev, transaction_type: e.target.value }))}
                    >
                      <MenuItem value="deposit">Deposit</MenuItem>
                      <MenuItem value="withdrawal">Withdrawal</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    inputProps={{ step: 0.01, min: 0.01 }}
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <DatePicker
                    label="Transaction Date"
                    value={formData.transaction_date}
                    onChange={(newValue) => setFormData(prev => ({ ...prev, transaction_date: newValue }))}
                    slots={{
                      textField: TextField
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reference Number"
                    value={formData.reference_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained">
                Create Transaction
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TransactionList;