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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Alert,
  Collapse,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccountBalance as AccountIcon,
  Search as SearchIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { accountingService } from '../../services/accountingService';
import { useAuth } from '../../contexts/AuthContext';
import { canManageAccounting } from '../../utils/permissions';

const AccountList = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [chartOfAccounts, setChartOfAccounts] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // Check if user can manage accounting operations
  const canManage = canManageAccounting(user);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [expandedTypes, setExpandedTypes] = useState({});
  
  // Form states
  const [formData, setFormData] = useState({
    account_number: '',
    name: '',
    type_id: '',
    parent_account_id: '',
    description: '',
    is_active: true
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    type_id: '',
    is_active: 'true'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (tabValue === 0) {
      loadAccounts();
    } else {
      loadChartOfAccounts();
    }
  }, [tabValue, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountTypesRes] = await Promise.all([
        accountingService.getAccountTypes()
      ]);
      
      setAccountTypes(accountTypesRes.data || []);
      
      if (tabValue === 0) {
        await loadAccounts();
      } else {
        await loadChartOfAccounts();
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const response = await accountingService.getAccounts(filters);
      setAccounts(response.data?.accounts || []);
    } catch (err) {
      setError('Failed to load accounts');
      console.error(err);
    }
  };

  const loadChartOfAccounts = async () => {
    try {
      const response = await accountingService.getChartOfAccounts();
      setChartOfAccounts(response.data || []);
    } catch (err) {
      setError('Failed to load chart of accounts');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      if (editingAccount) {
        await accountingService.updateAccount(editingAccount.id, formData);
        setSuccess('Account updated successfully');
      } else {
        await accountingService.createAccount(formData);
        setSuccess('Account created successfully');
      }
      
      handleCloseDialog();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save account');
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      account_number: account.account_number,
      name: account.name,
      type_id: account.type_id,
      parent_account_id: account.parent_account_id || '',
      description: account.description || '',
      is_active: account.is_active
    });
    setOpenDialog(true);
  };

  const handleDelete = async (account) => {
    if (window.confirm(`Are you sure you want to delete account "${account.name}"?`)) {
      try {
        await accountingService.deleteAccount(account.id);
        setSuccess('Account deleted successfully');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete account');
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAccount(null);
    setFormData({
      account_number: '',
      name: '',
      type_id: '',
      parent_account_id: '',
      description: '',
      is_active: true
    });
  };

  const toggleTypeExpansion = (typeId) => {
    setExpandedTypes(prev => ({
      ...prev,
      [typeId]: !prev[typeId]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  const renderAccountRow = (account, level = 0) => (
    <React.Fragment key={account.id}>
      <TableRow>
        <TableCell sx={{ pl: level * 3 + 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountIcon fontSize="small" />
            <Typography variant="body2" fontWeight={level === 0 ? 'bold' : 'normal'}>
              {account.account_number}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={level === 0 ? 'bold' : 'normal'}>
            {account.name}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip 
            label={account.type?.name} 
            color={getAccountTypeColor(account.type?.name)}
            size="small"
          />
        </TableCell>
        <TableCell align="right">
          {account.balance && (
            <Typography 
              variant="body2" 
              color={account.balance.balance >= 0 ? 'success.main' : 'error.main'}
            >
              {formatCurrency(Math.abs(account.balance.balance))}
            </Typography>
          )}
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
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => handleEdit(account)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => handleDelete(account)} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </TableCell>
      </TableRow>
      {account.children && account.children.map(child => renderAccountRow(child, level + 1))}
    </React.Fragment>
  );

  const renderChartOfAccounts = () => (
    <Box>
      {chartOfAccounts.map(accountType => (
        <Card key={accountType.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={() => toggleTypeExpansion(accountType.id)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  label={accountType.name} 
                  color={getAccountTypeColor(accountType.name)}
                />
                <Typography variant="body2" color="text.secondary">
                  {accountType.accounts?.length || 0} accounts
                </Typography>
              </Box>
              {expandedTypes[accountType.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            
            <Collapse in={expandedTypes[accountType.id]}>
              <Box sx={{ mt: 2 }}>
                {accountType.accounts && accountType.accounts.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Account Number</TableCell>
                          <TableCell>Account Name</TableCell>
                          <TableCell>Balance</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {accountType.accounts.map(account => renderAccountRow(account))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No accounts in this category
                  </Typography>
                )}
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

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
        <Typography variant="h4">Chart of Accounts</Typography>
        {canManage && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Account
          </Button>
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

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Account List" />
          <Tab label="Chart of Accounts" />
        </Tabs>
      </Paper>

      {/* Filters */}
      {tabValue === 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Search accounts"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Account Type</InputLabel>
                <Select
                  value={filters.type_id}
                  label="Account Type"
                  onChange={(e) => setFilters(prev => ({ ...prev, type_id: e.target.value }))}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {accountTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.is_active}
                  label="Status"
                  onChange={(e) => setFilters(prev => ({ ...prev, is_active: e.target.value }))}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Content */}
      {tabValue === 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Account Number</TableCell>
                <TableCell>Account Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Balance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map(account => (
                <TableRow key={account.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountIcon fontSize="small" />
                      {account.account_number}
                    </Box>
                  </TableCell>
                  <TableCell>{account.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={account.type?.name} 
                      color={getAccountTypeColor(account.type?.name)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {account.balance && (
                      <Typography 
                        variant="body2" 
                        color={account.balance.balance >= 0 ? 'success.main' : 'error.main'}
                      >
                        {formatCurrency(Math.abs(account.balance.balance))}
                      </Typography>
                    )}
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
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEdit(account)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDelete(account)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        renderChartOfAccounts()
      )}

      {/* Account Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingAccount ? 'Edit Account' : 'Add New Account'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
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
                  label="Account Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Account Type</InputLabel>
                  <Select
                    value={formData.type_id}
                    label="Account Type"
                    onChange={(e) => setFormData(prev => ({ ...prev, type_id: e.target.value }))}
                  >
                    {accountTypes.map(type => (
                      <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={accounts.filter(acc => acc.type_id === formData.type_id)}
                  getOptionLabel={(option) => `${option.account_number} - ${option.name}`}
                  value={accounts.find(acc => acc.id === formData.parent_account_id) || null}
                  onChange={(e, newValue) => setFormData(prev => ({ 
                    ...prev, 
                    parent_account_id: newValue?.id || '' 
                  }))}
                  renderInput={(params) => (
                    <TextField {...params} label="Parent Account (Optional)" />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
    </Box>
  );
};

export default AccountList;