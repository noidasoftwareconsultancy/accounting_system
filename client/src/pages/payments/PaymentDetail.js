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
  Alert,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Receipt,
  MoreVert,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import paymentService from '../../services/paymentService';
import { useApp } from '../../contexts/AppContext';

const PaymentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNotification } = useApp();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getById(id);
      setPayment(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching payment:', err);
      setError('Failed to fetch payment details');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch payment details'
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

  const handleDeletePayment = async () => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await paymentService.deletePayment(id);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Payment deleted successfully'
        });
        navigate('/payments');
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading payment details...</Typography>
      </Box>
    );
  }

  if (error || !payment) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Payment not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/payments')}
        >
          Back to Payments
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/payments')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              Payment Details
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Payment ID: {payment.id}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/payments/${id}/edit`)}
          >
            Edit
          </Button>
          <IconButton onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Payment Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Payment Amount
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {formatCurrency(payment.amount)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Payment Date
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {format(new Date(payment.payment_date), 'MMMM dd, yyyy')}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Payment Method
                  </Typography>
                  <Chip
                    label={payment.payment_method || 'Not specified'}
                    color={getPaymentMethodColor(payment.payment_method)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Reference Number
                  </Typography>
                  <Typography variant="body1">
                    {payment.reference_number || 'Not provided'}
                  </Typography>
                </Grid>

                {payment.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body1">
                      {payment.notes}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="textSecondary">
                    Created: {format(new Date(payment.created_at), 'MMMM dd, yyyy HH:mm')}
                  </Typography>
                  {payment.updated_at !== payment.created_at && (
                    <Typography variant="body2" color="textSecondary">
                      Updated: {format(new Date(payment.updated_at), 'MMMM dd, yyyy HH:mm')}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Invoice Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Related Invoice
              </Typography>

              {payment.invoice ? (
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Invoice Number:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {payment.invoice.invoice_number}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Client:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {payment.invoice.client?.name}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Invoice Total:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(payment.invoice.total_amount)}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Due Date:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {format(new Date(payment.invoice.due_date), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Status:
                    </Typography>
                    <Chip
                      label={payment.invoice.status}
                      color={payment.invoice.status === 'paid' ? 'success' : 'warning'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Receipt />}
                    onClick={() => navigate(`/invoices/${payment.invoice_id}`)}
                  >
                    View Invoice
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
                  Invoice information not available
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/payments/${id}/edit`)}
                >
                  Edit Payment
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PaymentIcon />}
                  onClick={() => navigate('/payments/new')}
                >
                  Record New Payment
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/payments/${id}/edit`);
          handleMenuClose();
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Payment
        </MenuItem>
        <MenuItem 
          onClick={handleDeletePayment}
          sx={{ color: 'error.main' }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Payment
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PaymentDetail;