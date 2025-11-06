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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Send,
  Payment,
  FileCopy,
  GetApp,
  Print,
  MoreVert,
  Receipt,
  Business,
  CalendarToday,
  AttachMoney
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import invoiceService from '../../services/invoiceService';
import { useApp } from '../../contexts/AppContext';

const InvoiceDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const { addNotification } = useApp();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getInvoice(id);
      setInvoice(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError('Failed to fetch invoice details');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch invoice details'
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

  const handleSendInvoice = async () => {
    try {
      await invoiceService.sendInvoice(id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Invoice sent successfully'
      });
      fetchInvoice();
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to send invoice'
      });
    }
    handleMenuClose();
  };

  const handleMarkAsPaid = async () => {
    try {
      await invoiceService.markAsPaid(id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Invoice marked as paid'
      });
      fetchInvoice();
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to mark invoice as paid'
      });
    }
    handleMenuClose();
  };

  const handleDuplicate = async () => {
    try {
      const response = await invoiceService.duplicateInvoice(id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Invoice duplicated successfully'
      });
      navigate(`/invoices/${response.data.id}`);
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to duplicate invoice'
      });
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoiceService.deleteInvoice(id);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Invoice deleted successfully'
        });
        navigate('/invoices');
      } catch (err) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete invoice'
        });
      }
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'default',
      'sent': 'info',
      'paid': 'success',
      'partial': 'warning',
      'overdue': 'error',
      'cancelled': 'error'
    };
    return colors[status] || 'default';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice?.currency || 'USD'
    }).format(amount);
  };

  const calculatePaidAmount = () => {
    return invoice?.payments?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0;
  };

  const calculateBalance = () => {
    return parseFloat(invoice?.total_amount || 0) - calculatePaidAmount();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading invoice details...</Typography>
      </Box>
    );
  }

  if (error || !invoice) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Invoice not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/invoices')}
        >
          Back to Invoices
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/invoices')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              {invoice.invoice_number}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Invoice Details
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/invoices/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            startIcon={<Payment />}
            onClick={() => navigate(`/payments/new?invoice=${id}`)}
            disabled={invoice.status === 'paid'}
          >
            Record Payment
          </Button>
          <IconButton onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Invoice Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Invoice Information</Typography>
                <Chip
                  label={invoice.status.toUpperCase()}
                  color={getStatusColor(invoice.status)}
                  variant="outlined"
                />
              </Box>

              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Business fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      Client
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {invoice.client?.name}
                  </Typography>
                  {invoice.client?.email && (
                    <Typography variant="body2" color="textSecondary">
                      {invoice.client.email}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      Dates
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    Issue: {format(new Date(invoice.issue_date), 'MMM dd, yyyy')}
                  </Typography>
                  <Typography variant="body2">
                    Due: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                  </Typography>
                </Grid>

                {invoice.project && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Project
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {invoice.project.name}
                    </Typography>
                  </Grid>
                )}

                {invoice.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body1">
                      {invoice.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {/* Invoice Items */}
              <Typography variant="h6" gutterBottom>
                Invoice Items
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Tax Rate</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell align="right">{item.tax_rate}%</TableCell>
                        <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Totals */}
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Box minWidth={200}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2">{formatCurrency(invoice.amount)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Tax:</Typography>
                    <Typography variant="body2">{formatCurrency(invoice.tax_amount)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6">{formatCurrency(invoice.total_amount)}</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Summary
              </Typography>

              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="textSecondary">
                  Total Amount:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formatCurrency(invoice.total_amount)}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="textSecondary">
                  Amount Paid:
                </Typography>
                <Typography variant="body2" fontWeight="medium" color="success.main">
                  {formatCurrency(calculatePaidAmount())}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Balance Due:
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  {formatCurrency(calculateBalance())}
                </Typography>
              </Box>

              {invoice.payments && invoice.payments.length > 0 && (
                <Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Payment History:
                  </Typography>
                  {invoice.payments.map((payment, index) => (
                    <Box key={index} display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="caption">
                        {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="caption">
                        {formatCurrency(payment.amount)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
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
                {invoice.status !== 'sent' && invoice.status !== 'paid' && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Send />}
                    onClick={handleSendInvoice}
                  >
                    Send Invoice
                  </Button>
                )}
                
                {invoice.status !== 'paid' && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Payment />}
                    onClick={() => navigate(`/payments/new?invoice=${id}`)}
                  >
                    Record Payment
                  </Button>
                )}
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FileCopy />}
                  onClick={handleDuplicate}
                >
                  Duplicate Invoice
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
          navigate(`/invoices/${id}/edit`);
          handleMenuClose();
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Invoice
        </MenuItem>
        
        {invoice.status !== 'sent' && invoice.status !== 'paid' && (
          <MenuItem onClick={handleSendInvoice}>
            <Send fontSize="small" sx={{ mr: 1 }} />
            Send Invoice
          </MenuItem>
        )}
        
        {invoice.status !== 'paid' && (
          <MenuItem onClick={handleMarkAsPaid}>
            <Receipt fontSize="small" sx={{ mr: 1 }} />
            Mark as Paid
          </MenuItem>
        )}
        
        <MenuItem onClick={handleDuplicate}>
          <FileCopy fontSize="small" sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={handleDelete}
          sx={{ color: 'error.main' }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Invoice
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default InvoiceDetail;