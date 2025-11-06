import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Alert,
  Divider
} from '@mui/material';
import { Save, Cancel, Payment } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import paymentService from '../../services/paymentService';
import invoiceService from '../../services/invoiceService';
import { useApp } from '../../contexts/AppContext';

const validationSchema = yup.object({
  invoice_id: yup.number().required('Invoice is required'),
  amount: yup.number().min(0.01, 'Amount must be greater than 0').required('Amount is required'),
  payment_date: yup.date().required('Payment date is required'),
  payment_method: yup.string(),
  reference_number: yup.string(),
  notes: yup.string()
});

const PaymentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNotification } = useApp();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const formik = useFormik({
    initialValues: {
      invoice_id: '',
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: '',
      reference_number: '',
      notes: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);

        // Ensure proper data types
        const paymentData = {
          ...values,
          invoice_id: parseInt(values.invoice_id),
          amount: parseFloat(values.amount)
        };

        if (isEdit) {
          await paymentService.updatePayment(id, paymentData);
          addNotification({
            type: 'success',
            title: 'Success',
            message: 'Payment updated successfully'
          });
        } else {
          await paymentService.recordPayment(paymentData);
          addNotification({
            type: 'success',
            title: 'Success',
            message: 'Payment recorded successfully'
          });
        }

        navigate('/payments');
      } catch (err) {
        console.error('Error saving payment:', err);
        setError(err.response?.data?.message || 'Failed to save payment');
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to save payment'
        });
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    fetchInvoices();
    if (isEdit) {
      fetchPayment();
    } else {
      // Check for invoice parameter in URL
      const urlParams = new URLSearchParams(window.location.search);
      const invoiceId = urlParams.get('invoice');
      if (invoiceId) {
        formik.setFieldValue('invoice_id', parseInt(invoiceId));
      }
    }
  }, [id, isEdit]);

  useEffect(() => {
    // Pre-select invoice if specified in URL
    if (!isEdit && invoices.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const invoiceId = urlParams.get('invoice');
      if (invoiceId) {
        const invoice = invoices.find(inv => inv.id === parseInt(invoiceId));
        if (invoice) {
          setSelectedInvoice(invoice);
          const remainingAmount = getInvoiceBalance(invoice);
          if (remainingAmount > 0) {
            formik.setFieldValue('amount', remainingAmount.toFixed(2));
          }
        }
      }
    }
  }, [invoices, isEdit]);

  const fetchInvoices = async () => {
    try {
      const response = await invoiceService.getAll(1, 100, { status: 'sent' });
      setInvoices(response.data.invoices || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getById(id);
      const payment = response.data;
      
      formik.setValues({
        invoice_id: payment.invoice_id,
        amount: payment.amount,
        payment_date: payment.payment_date.split('T')[0],
        payment_method: payment.payment_method || '',
        reference_number: payment.reference_number || '',
        notes: payment.notes || ''
      });

      // Set selected invoice for display
      const invoice = invoices.find(inv => inv.id === payment.invoice_id);
      setSelectedInvoice(invoice);
    } catch (err) {
      console.error('Error fetching payment:', err);
      setError('Failed to fetch payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceChange = (event, newValue) => {
    if (newValue) {
      formik.setFieldValue('invoice_id', newValue.id);
      setSelectedInvoice(newValue);
      
      // Calculate remaining amount
      const totalPaid = newValue.payments?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0;
      const remainingAmount = parseFloat(newValue.total_amount) - totalPaid;
      
      if (remainingAmount > 0) {
        formik.setFieldValue('amount', remainingAmount.toFixed(2));
      }
    } else {
      formik.setFieldValue('invoice_id', '');
      setSelectedInvoice(null);
      formik.setFieldValue('amount', '');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getInvoiceBalance = (invoice) => {
    if (!invoice) return 0;
    const totalPaid = invoice.payments?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0;
    return parseFloat(invoice.total_amount) - totalPaid;
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {isEdit ? 'Edit Payment' : 'Record Payment'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {isEdit ? 'Update payment details' : 'Record a new payment against an invoice'}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Payment Details */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Details
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={invoices}
                      getOptionLabel={(option) => `${option.invoice_number} - ${option.client?.name} (${formatCurrency(option.total_amount)})`}
                      value={selectedInvoice}
                      onChange={handleInvoiceChange}
                      disabled={isEdit}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Invoice"
                          error={formik.touched.invoice_id && Boolean(formik.errors.invoice_id)}
                          helperText={formik.touched.invoice_id && formik.errors.invoice_id}
                          required
                        />
                      )}
                      renderOption={(props, option) => {
                        const { key, ...otherProps } = props;
                        return (
                          <li key={key} {...otherProps}>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {option.invoice_number} - {option.client?.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Total: {formatCurrency(option.total_amount)} | 
                                Balance: {formatCurrency(getInvoiceBalance(option))}
                              </Typography>
                            </Box>
                          </li>
                        );
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Payment Amount"
                      name="amount"
                      value={formik.values.amount}
                      onChange={formik.handleChange}
                      error={formik.touched.amount && Boolean(formik.errors.amount)}
                      helperText={formik.touched.amount && formik.errors.amount}
                      inputProps={{ min: 0, step: 0.01 }}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Payment Date"
                      name="payment_date"
                      value={formik.values.payment_date}
                      onChange={formik.handleChange}
                      error={formik.touched.payment_date && Boolean(formik.errors.payment_date)}
                      helperText={formik.touched.payment_date && formik.errors.payment_date}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Payment Method</InputLabel>
                      <Select
                        name="payment_method"
                        value={formik.values.payment_method}
                        onChange={formik.handleChange}
                        label="Payment Method"
                      >
                        <MenuItem value="">Select Method</MenuItem>
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                        <MenuItem value="credit_card">Credit Card</MenuItem>
                        <MenuItem value="check">Check</MenuItem>
                        <MenuItem value="online">Online Payment</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Reference Number"
                      name="reference_number"
                      value={formik.values.reference_number}
                      onChange={formik.handleChange}
                      error={formik.touched.reference_number && Boolean(formik.errors.reference_number)}
                      helperText={formik.touched.reference_number && formik.errors.reference_number}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Notes"
                      name="notes"
                      value={formik.values.notes}
                      onChange={formik.handleChange}
                      error={formik.touched.notes && Boolean(formik.errors.notes)}
                      helperText={formik.touched.notes && formik.errors.notes}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Invoice Summary */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Invoice Summary
                </Typography>

                {selectedInvoice ? (
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="textSecondary">
                        Invoice Number:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {selectedInvoice.invoice_number}
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="textSecondary">
                        Client:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {selectedInvoice.client?.name}
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="textSecondary">
                        Total Amount:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(selectedInvoice.total_amount)}
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="textSecondary">
                        Amount Paid:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(
                          selectedInvoice.payments?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0
                        )}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="body2" color="textSecondary">
                        Balance Due:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {formatCurrency(getInvoiceBalance(selectedInvoice))}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
                    Select an invoice to view details
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Actions */}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={() => navigate('/payments')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save />}
            disabled={loading}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Payment' : 'Record Payment'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default PaymentForm;