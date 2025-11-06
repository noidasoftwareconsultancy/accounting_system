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
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalance as BankIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  SwapHoriz as TransferIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import bankingService from '../../services/bankingService';
import { useAuth } from '../../contexts/AuthContext';
import { canManageBanking } from '../../utils/permissions';

const BankAccountList = () => {
  const { user } = useAuth();
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({});
  
  // Check if user can manage banking operations
  const canManage = canManageBanking(user);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    account_name: '',
    account_number: '',
    bank_name: '',
    branch: '',
    ifsc_code: '',
    account_type: 'checking',
    currency: 'USD',
    opening_balance: 0,
    is_active: true
  });

  const [transferData, setTransferData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsRes, statsRes] = await Promise.all([
        bankingService.getBankAccounts(),
        bankingService.getBankingStats()
      ]);
      
      setBankAccounts(accountsRes.data?.bankAccounts || []);
      setStats(statsRes.data || {});
    } catch (err) {
      setError('Failed to load bank accounts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      if (editingAccount) {
        await bankingService.updateBankAccount(editingAccount.id, formData);
        setSuccess('Bank account updated successfully');
      } else {
        await bankingService.createBankAccount(formData);
        setSuccess('Bank account created successfully');
      }
      
      handleCloseDialog();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save bank account');
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      account_name: account.account_name,
      account_number: account.account_number,
      bank_name: account.bank_name,
      branch: account.branch || '',
      ifsc_code: account.ifsc_code || '',
      account_type: account.account_type || 'checking',
      currency: account.currency,
      opening_balance: account.opening_balance,
      is_active: account.is_active
    });
    setOpenDialog(true);
    setAnchorEl(null);
  };

  const handleDelete = async (account) => {
    if (window.confirm(`Are you sure you want to delete account "${account.account_name}"?`)) {
      try {
        await bankingService.deleteBankAccount(account.id);
        setSuccess('Bank account deleted successfully');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete bank account');
      }
    }
    setAnchorEl(null);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await bankingService.transferBetweenAccounts(transferData);
      setSuccess('Transfer completed successfully');
      setOpenTransferDialog(false);
      setTransferData({
        fromAccountId: '',
        toAccountId: '',
        amount: '',
        description: ''
      });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process transfer');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAccount(null);
    setFormData({
      account_name: '',
      account_number: '',
      bank_name: '',
      branch: '',
      ifsc_code: '',
      account_type: 'checking',
      currency: 'USD',
      opening_balance: 0,
      is_active: true
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getAccountTypeColor = (type) => {
    const colors = {
      'checking': 'primary',
      'savings': 'success',
      'credit': 'warning',
      'investment': 'info'
    };
    return colors[type] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Bank Accounts</Typography>
        {canManage && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              startIcon={<TransferIcon />}
              onClick={() => setOpenTransferDialog(true)}
            >
              Transfer
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Add Account
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

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Total Accounts
              </Typography>
              <Typography variant="h4">
                {stats.totalAccounts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                Total Balance
              </Typography>
              <Typography variant="h4">
                {formatCurrency(stats.totalBalance || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                This Month Transactions
              </Typography>
              <Typography variant="h4">
                {stats.thisMonthTransactions || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                Unreconciled
              </Typography>
              <Typography variant="h4">
                {stats.reconciliationStats?.unreconciled || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bank Accounts Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Account Details</TableCell>
              <TableCell>Bank Information</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Current Balance</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bankAccounts.map(account => (
              <TableRow key={account.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BankIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {account.account_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {account.account_number}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {account.bank_name}
                    </Typography>
                    {account.branch && (
                      <Typography variant="body2" color="text.secondary">
                        {account.branch}
                      </Typography>
                    )}
                    {account.ifsc_code && (
                      <Typography variant="body2" color="text.secondary">
                        IFSC: {account.ifsc_code}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={account.account_type || 'checking'} 
                    color={getAccountTypeColor(account.account_type)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(account.current_balance, account.currency)}
                    </Typography>
                    {account.current_balance > account.opening_balance ? (
                      <TrendingUpIcon color="success" fontSize="small" />
                    ) : account.current_balance < account.opening_balance ? (
                      <TrendingDownIcon color="error" fontSize="small" />
                    ) : null}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={account.is_active ? 'Active' : 'Inactive'} 
                    color={account.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {canManage && (
                    <IconButton 
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedAccount(account);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleEdit(selectedAccount)}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          // Navigate to account details
          setAnchorEl(null);
        }}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          // Navigate to transaction history
          setAnchorEl(null);
        }}>
          <HistoryIcon sx={{ mr: 1 }} fontSize="small" />
          Transaction History
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedAccount)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Bank Account Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Account Name"
                  value={formData.account_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Account Number"
                  value={formData.account_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bank Name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Branch"
                  value={formData.branch}
                  onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="IFSC Code"
                  value={formData.ifsc_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, ifsc_code: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Account Type</InputLabel>
                  <Select
                    value={formData.account_type}
                    label="Account Type"
                    onChange={(e) => setFormData(prev => ({ ...prev, account_type: e.target.value }))}
                  >
                    <MenuItem value="checking">Checking</MenuItem>
                    <MenuItem value="savings">Savings</MenuItem>
                    <MenuItem value="credit">Credit</MenuItem>
                    <MenuItem value="investment">Investment</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={formData.currency}
                    label="Currency"
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                    <MenuItem value="INR">INR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Opening Balance"
                  type="number"
                  inputProps={{ step: 0.01 }}
                  value={formData.opening_balance}
                  onChange={(e) => setFormData(prev => ({ ...prev, opening_balance: parseFloat(e.target.value) || 0 }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingAccount ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={openTransferDialog} onClose={() => setOpenTransferDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleTransfer}>
          <DialogTitle>Transfer Between Accounts</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>From Account</InputLabel>
                  <Select
                    value={transferData.fromAccountId}
                    label="From Account"
                    onChange={(e) => setTransferData(prev => ({ ...prev, fromAccountId: e.target.value }))}
                  >
                    {bankAccounts.filter(acc => acc.is_active).map(account => (
                      <MenuItem key={account.id} value={account.id}>
                        {account.account_name} - {formatCurrency(account.current_balance)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>To Account</InputLabel>
                  <Select
                    value={transferData.toAccountId}
                    label="To Account"
                    onChange={(e) => setTransferData(prev => ({ ...prev, toAccountId: e.target.value }))}
                  >
                    {bankAccounts.filter(acc => acc.is_active && acc.id !== parseInt(transferData.fromAccountId)).map(account => (
                      <MenuItem key={account.id} value={account.id}>
                        {account.account_name} - {formatCurrency(account.current_balance)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  inputProps={{ step: 0.01, min: 0.01 }}
                  value={transferData.amount}
                  onChange={(e) => setTransferData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={transferData.description}
                  onChange={(e) => setTransferData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenTransferDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Transfer
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default BankAccountList;