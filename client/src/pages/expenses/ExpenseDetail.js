import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Paper,
  useTheme,
  alpha,
  Avatar
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Payment,
  MoreVert,
  Receipt,
  Business,
  Category,
  Work,
  CalendarToday,
  AttachMoney,
  Description
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import expenseService from '../../services/expenseService';
import { useApp } from '../../contexts/AppContext';

const ExpenseDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const { addNotification } = useApp();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchExpense();
  }, [id]);

  const fetchExpense = async () => {
    try {
      setLoading(true);
      const response = await expenseService.getById(id);
      setExpense(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching expense:', err);
      setError('Failed to fetch expense details');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch expense details'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleApprove = async () => {
    try {
      await expenseService.approve(id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Expense approved successfully'
      });
      fetchExpense();
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to approve expense'
      });
    }
    handleMenuClose();
  };

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason !== null) {
      try {
        await expenseService.reject(id, reason);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Expense rejected successfully'
        });
        fetchExpense();
      } catch (err) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to reject expense'
        });
      }
    }
    handleMenuClose();
  };

  const handleMarkAsPaid = async () => {
    try {
      await expenseService.markAsPaid(id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Expense marked as paid'
      });
      fetchExpense();
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to mark expense as paid'
      });
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.delete(id);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Expense deleted successfully'
        });
        navigate('/expenses');
      } catch (err) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete expense'
        });
      }
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'error',
      'paid': 'info'
    };
    return colors[status] || 'default';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: expense?.currency || 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading expense details...</Typography>
      </Box>
    );
  }

  if (error || !expense) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Expense not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/expenses')}
        >
          Back to Expenses
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/expenses')}>
            <ArrowBack />
          </IconButton>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <Receipt />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1">
              Expense Details
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {expense.description}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/expenses/${id}/edit`)}
          >
            Edit
          </Button>
          <IconButton onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Expense Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Expense Information</Typography>
                <Chip
                  label={expense.status.toUpperCase()}
                  color={getStatusColor(expense.status)}
                  variant="outlined"
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <AttachMoney fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      Amount
                    </Typography>
                  </Box>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {formatCurrency(expense.amount)}
                  </Typography>
                  {expense.tax_amount > 0 && (
                    <Typography variant="body2" color="textSecondary">
                      Tax: {formatCurrency(expense.tax_amount)}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      Expense Date
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {format(new Date(expense.expense_date), 'MMMM dd, yyyy')}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Description fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      Description
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {expense.description}
                  </Typography>
                </Grid>

                {expense.category && (
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Category fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">
                        Category
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      {expense.category.name}
                    </Typography>
                    {expense.category.description && (
                      <Typography variant="body2" color="textSecondary">
                        {expense.category.description}
                      </Typography>
                    )}
                  </Grid>
                )}

                {expense.vendor && (
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Business fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">
                        Vendor
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      {expense.vendor.name}
                    </Typography>
                    {expense.vendor.email && (
                      <Typography variant="body2" color="textSecondary">
                        {expense.vendor.email}
                      </Typography>
                    )}
                  </Grid>
                )}

                {expense.project && (
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Work fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">
                        Project
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      {expense.project.name}
                    </Typography>
                  </Grid>
                )}

                {expense.payment_method && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Payment Method
                    </Typography>
                    <Typography variant="body1">
                      {expense.payment_method}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Currency
                  </Typography>
                  <Typography variant="body1">
                    {expense.currency}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Reimbursable
                  </Typography>
                  <Typography variant="body1">
                    {expense.is_reimbursable ? 'Yes' : 'No'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Recurring
                  </Typography>
                  <Typography variant="body1">
                    {expense.is_recurring ? 'Yes' : 'No'}
                  </Typography>
                </Grid>

                {expense.receipt_path && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Receipt
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Receipt />}
                      onClick={() => window.open(expense.receipt_path, '_blank')}
                    >
                      View Receipt
                    </Button>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="textSecondary">
                    Created: {format(new Date(expense.created_at), 'MMMM dd, yyyy HH:mm')}
                  </Typography>
                  {expense.updated_at !== expense.created_at && (
                    <Typography variant="body2" color="textSecondary">
                      Updated: {format(new Date(expense.updated_at), 'MMMM dd, yyyy HH:mm')}
                    </Typography>
                  )}
                  {expense.creator && (
                    <Typography variant="body2" color="textSecondary">
                      Created by: {expense.creator.first_name} {expense.creator.last_name}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions and Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Status & Actions
              </Typography>

              <Box mb={3}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Current Status
                </Typography>
                <Chip
                  label={expense.status.toUpperCase()}
                  color={getStatusColor(expense.status)}
                  size="large"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>

              <Box display="flex" flexDirection="column" gap={1}>
                {expense.status === 'pending' && (
                  <>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={handleApprove}
                    >
                      Approve Expense
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={handleReject}
                    >
                      Reject Expense
                    </Button>
                  </>
                )}

                {expense.status === 'approved' && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Payment />}
                    onClick={handleMarkAsPaid}
                  >
                    Mark as Paid
                  </Button>
                )}

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/expenses/${id}/edit`)}
                >
                  Edit Expense
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Recurring Expense Info */}
          {expense.is_recurring && expense.recurring_expenses && expense.recurring_expenses.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recurring Schedule
                </Typography>
                
                {expense.recurring_expenses.map((recurring, index) => (
                  <Box key={index}>
                    <Typography variant="body2" color="textSecondary">
                      Frequency: {recurring.frequency}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Next Date: {format(new Date(recurring.next_date), 'MMM dd, yyyy')}
                    </Typography>
                    {recurring.end_date && (
                      <Typography variant="body2" color="textSecondary">
                        End Date: {format(new Date(recurring.end_date), 'MMM dd, yyyy')}
                      </Typography>
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/expenses/${id}/edit`);
          handleMenuClose();
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Expense
        </MenuItem>
        
        {expense.status === 'pending' && (
          <>
            <MenuItem onClick={handleApprove}>
              <CheckCircle fontSize="small" sx={{ mr: 1 }} />
              Approve
            </MenuItem>
            <MenuItem onClick={handleReject}>
              <Cancel fontSize="small" sx={{ mr: 1 }} />
              Reject
            </MenuItem>
          </>
        )}
        
        {expense.status === 'approved' && (
          <MenuItem onClick={handleMarkAsPaid}>
            <Payment fontSize="small" sx={{ mr: 1 }} />
            Mark as Paid
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem 
          onClick={handleDelete}
          sx={{ color: 'error.main' }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Expense
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ExpenseDetail;