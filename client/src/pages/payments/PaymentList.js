import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Tooltip
} from '@mui/material';
import {
  MoreVert,
  Add,
  Payment,
  Receipt,
  Edit,
  Delete,
  FilterList,
  Search
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import paymentService from '../../services/paymentService';
import invoiceService from '../../services/invoiceService';
import { useApp } from '../../contexts/AppContext';

const PaymentList = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    payment_method: '',
    start_date: '',
    end_date: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [page, rowsPerPage, filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getAll(page + 1, rowsPerPage, filters);
      setPayments(response.data.payments || []);
      setTotalCount(response.data.total || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to fetch payments');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch payments'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, payment) => {
    setAnchorEl(event.currentTarget);
    setSelectedPayment(payment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPayment(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      payment_method: '',
      start_date: '',
      end_date: ''
    });
    setPage(0);
  };

  const handleDeletePayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await paymentService.deletePayment(paymentId);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Payment deleted successfully'
        });
        fetchPayments();
      } catch (err) {
        console.error('Error deleting payment:', err);
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete payment'
        });
      }
    }
    handleMenuClose();
  };

  const getPaymentMethodColor = (method) => {
    const colors = {
      'cash': 'success',
      'bank_transfer': 'primary',
      'credit_card': 'secondary',
      'check': 'warning',
      'online': 'info'
    };
    return colors[method] || 'default';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading && payments.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading payments...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Payments
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Track and manage all payment transactions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/payments/new')}
        >
          Record Payment
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Filters
            </Typography>
            <Box>
              <Button
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
                size="small"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
              {Object.values(filters).some(v => v) && (
                <Button onClick={clearFilters} size="small" sx={{ ml: 1 }}>
                  Clear
                </Button>
              )}
            </Box>
          </Box>

          {showFilters && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={filters.payment_method}
                    onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                    label="Payment Method"
                  >
                    <MenuItem value="">All Methods</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                    <MenuItem value="credit_card">Credit Card</MenuItem>
                    <MenuItem value="check">Check</MenuItem>
                    <MenuItem value="online">Online</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Start Date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="End Date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Payment Date</TableCell>
                <TableCell>Invoice</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} hover>
                  <TableCell>
                    {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {payment.invoice?.invoice_number}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Due: {payment.invoice?.due_date && format(new Date(payment.invoice.due_date), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {payment.invoice?.client?.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(payment.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={payment.payment_method || 'Not specified'}
                      color={getPaymentMethodColor(payment.payment_method)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {payment.reference_number || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="More actions">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, payment)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {payments.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <Payment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        No payments found
                      </Typography>
                      <Typography variant="body2" color="textSecondary" mb={2}>
                        Start by recording your first payment
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/payments/new')}
                      >
                        Record Payment
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/invoices/${selectedPayment?.invoice_id}`);
          handleMenuClose();
        }}>
          <Receipt fontSize="small" sx={{ mr: 1 }} />
          View Invoice
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/payments/${selectedPayment?.id}/edit`);
          handleMenuClose();
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Payment
        </MenuItem>
        <MenuItem 
          onClick={() => handleDeletePayment(selectedPayment?.id)}
          sx={{ color: 'error.main' }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Payment
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PaymentList;