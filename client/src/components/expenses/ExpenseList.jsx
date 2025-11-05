import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Menu,
  Avatar,
  useTheme
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  FilterList, 
  Search, 
  Receipt, 
  MoreVert, 
  Visibility,
  GetApp,
  AttachMoney
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ExpenseList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    category_id: '',
    status: '',
    start_date: '',
    end_date: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);

  // Mock data for development
  const mockExpenses = [
    {
      id: 1,
      description: 'Office Supplies',
      category_name: 'Office Expenses',
      category_id: 1,
      date: '2023-06-15',
      amount: 250.75,
      vendor_name: 'Staples',
      status: 'approved',
      receipt_url: 'https://example.com/receipt1.pdf'
    },
    {
      id: 2,
      description: 'Team Lunch',
      category_name: 'Meals & Entertainment',
      category_id: 2,
      date: '2023-06-12',
      amount: 187.50,
      vendor_name: 'Local Restaurant',
      status: 'pending',
      receipt_url: 'https://example.com/receipt2.pdf'
    },
    {
      id: 3,
      description: 'Software Subscription',
      category_name: 'Software',
      category_id: 3,
      date: '2023-06-10',
      amount: 99.99,
      vendor_name: 'Adobe',
      status: 'approved',
      receipt_url: 'https://example.com/receipt3.pdf'
    },
    {
      id: 4,
      description: 'Client Meeting',
      category_name: 'Travel',
      category_id: 4,
      date: '2023-06-08',
      amount: 325.45,
      vendor_name: 'Uber',
      status: 'approved',
      receipt_url: 'https://example.com/receipt4.pdf'
    },
    {
      id: 5,
      description: 'Marketing Campaign',
      category_name: 'Marketing',
      category_id: 5,
      date: '2023-06-05',
      amount: 1500.00,
      vendor_name: 'Facebook',
      status: 'rejected',
      receipt_url: 'https://example.com/receipt5.pdf'
    },
    {
      id: 6,
      description: 'Office Rent',
      category_name: 'Rent',
      category_id: 6,
      date: '2023-06-01',
      amount: 3500.00,
      vendor_name: 'Property Management Inc',
      status: 'approved',
      receipt_url: 'https://example.com/receipt6.pdf'
    }
  ];

  const mockCategories = [
    { id: 1, name: 'Office Expenses' },
    { id: 2, name: 'Meals & Entertainment' },
    { id: 3, name: 'Software' },
    { id: 4, name: 'Travel' },
    { id: 5, name: 'Marketing' },
    { id: 6, name: 'Rent' },
    { id: 7, name: 'Utilities' },
    { id: 8, name: 'Insurance' }
  ];

  useEffect(() => {
    // In a real app, fetch from API
    // For now, use mock data
    setLoading(true);
    setTimeout(() => {
      setExpenses(mockExpenses);
      setCategories(mockCategories);
      setTotalCount(mockExpenses.length);
      setLoading(false);
    }, 500);
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let queryParams = `?page=${page + 1}&limit=${rowsPerPage}`;
      
      if (filters.category_id) {
        queryParams += `&category_id=${filters.category_id}`;
      }
      
      if (filters.status) {
        queryParams += `&status=${filters.status}`;
      }
      
      if (filters.start_date) {
        queryParams += `&start_date=${filters.start_date}`;
      }
      
      if (filters.end_date) {
        queryParams += `&end_date=${filters.end_date}`;
      }
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/expenses${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setExpenses(response.data.expenses);
      setTotalCount(response.data.pagination.total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/expenses/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleMenuOpen = (event, expenseId) => {
    setAnchorEl(event.currentTarget);
    setSelectedExpenseId(expenseId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedExpenseId(null);
  };

  const handleViewExpense = () => {
    console.log('View expense:', selectedExpenseId);
    handleMenuClose();
  };

  const handleEditExpense = () => {
    navigate(`/expenses/edit/${selectedExpenseId}`);
    handleMenuClose();
  };

  const handleDeleteExpense = async () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        // In a real app, delete from API
        console.log('Delete expense:', selectedExpenseId);
        // Refresh expenses
        const updatedExpenses = expenses.filter(expense => expense.id !== selectedExpenseId);
        setExpenses(updatedExpenses);
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
    handleMenuClose();
  };

  const handleViewReceipt = () => {
    const expense = expenses.find(e => e.id === selectedExpenseId);
    if (expense && expense.receipt_url) {
      window.open(expense.receipt_url, '_blank');
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return theme.palette.success;
      case 'pending':
        return theme.palette.warning;
      case 'rejected':
        return theme.palette.error;
      default:
        return theme.palette.info;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredExpenses = expenses.filter(expense => {
    // Apply search filter
    const matchesSearch = searchTerm === '' || 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply category filter
    const matchesCategory = filters.category_id === '' || 
      expense.category_id.toString() === filters.category_id;
    
    // Apply status filter
    const matchesStatus = filters.status === '' || 
      expense.status === filters.status;
    
    // Apply date filters
    const expenseDate = new Date(expense.date);
    const matchesStartDate = !filters.start_date || 
      expenseDate >= new Date(filters.start_date);
    const matchesEndDate = !filters.end_date || 
      expenseDate <= new Date(filters.end_date);
    
    return matchesSearch && matchesCategory && matchesStatus && 
      matchesStartDate && matchesEndDate;
  });

  const displayedExpenses = filteredExpenses
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Expenses
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => navigate('/expenses/new')}
          sx={{
            fontWeight: 'bold',
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            }
          }}
        >
          Add Expense
        </Button>
      </Box>

      {/* Filters */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label="All" 
                  onClick={() => setFilters({...filters, status: ''})}
                  color={filters.status === '' ? 'primary' : 'default'}
                  variant={filters.status === '' ? 'filled' : 'outlined'}
                />
                <Chip 
                  label="Approved" 
                  onClick={() => setFilters({...filters, status: 'approved'})}
                  color={filters.status === 'approved' ? 'success' : 'default'}
                  variant={filters.status === 'approved' ? 'filled' : 'outlined'}
                />
                <Chip 
                  label="Pending" 
                  onClick={() => setFilters({...filters, status: 'pending'})}
                  color={filters.status === 'pending' ? 'warning' : 'default'}
                  variant={filters.status === 'pending' ? 'filled' : 'outlined'}
                />
                <Chip 
                  label="Rejected" 
                  onClick={() => setFilters({...filters, status: 'rejected'})}
                  color={filters.status === 'rejected' ? 'error' : 'default'}
                  variant={filters.status === 'rejected' ? 'filled' : 'outlined'}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                name="category_id"
                label="Category"
                value={filters.category_id}
                onChange={handleFilterChange}
                variant="outlined"
                size="small"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="From Date"
                  value={filters.start_date ? new Date(filters.start_date) : null}
                  onChange={(date) => setFilters({...filters, start_date: date ? date.toISOString().split('T')[0] : ''})}
                  slotProps={{
                    textField: { size: 'small', fullWidth: true }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="To Date"
                  value={filters.end_date ? new Date(filters.end_date) : null}
                  onChange={(date) => setFilters({...filters, end_date: date ? date.toISOString().split('T')[0] : ''})}
                  slotProps={{
                    textField: { size: 'small', fullWidth: true }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="text" 
                color="inherit"
                fullWidth
                onClick={() => {
                  setSearchTerm('');
                  setFilters({
                    category_id: '',
                    status: '',
                    start_date: '',
                    end_date: ''
                  });
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card elevation={0} sx={{ borderRadius: 2 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Vendor</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Loading...</TableCell>
                </TableRow>
              ) : displayedExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No expenses found</TableCell>
                </TableRow>
              ) : (
                displayedExpenses.map((expense) => (
                  <TableRow 
                    key={expense.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                      {expense.description}
                    </TableCell>
                    <TableCell>{expense.category_name}</TableCell>
                    <TableCell>{formatDate(expense.date)}</TableCell>
                    <TableCell sx={{ fontWeight: 'medium' }}>{formatCurrency(expense.amount)}</TableCell>
                    <TableCell>{expense.vendor_name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={expense.status.charAt(0).toUpperCase() + expense.status.slice(1)} 
                        size="small"
                        sx={{ 
                          bgcolor: getStatusColor(expense.status).light,
                          color: getStatusColor(expense.status).main,
                          fontWeight: 'medium'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small"
                        onClick={(event) => handleMenuOpen(event, expense.id)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredExpenses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 1,
          sx: { borderRadius: 2, minWidth: 180 }
        }}
      >
        <MenuItem onClick={handleViewExpense}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditExpense}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Expense
        </MenuItem>
        <MenuItem onClick={handleViewReceipt}>
          <GetApp fontSize="small" sx={{ mr: 1 }} />
          View Receipt
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteExpense} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Expense
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ExpenseList;