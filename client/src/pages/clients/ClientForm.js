import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { clientService } from '../../services/clientService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const validationSchema = yup.object({
  name: yup.string().required('Client name is required'),
  email: yup.string().email('Enter a valid email'),
  phone: yup.string(),
  address: yup.string(),
  tax_id: yup.string(),
  currency: yup.string().required('Currency is required'),
  payment_terms: yup.number().min(0, 'Payment terms must be positive').required('Payment terms is required')
});

const currencies = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'INR', label: 'Indian Rupee (INR)' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)' },
  { value: 'AUD', label: 'Australian Dollar (AUD)' }
];

const ClientForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState(null);

  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      fetchClient();
    }
  }, [id, isEdit]);

  const fetchClient = useCallback(async () => {
    try {
      setLoading(true);
      const response = await clientService.getClient(id);
      setClient(response.data);
    } catch (error) {
      console.error('Error fetching client:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch client'
      });
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  }, [id, addNotification, navigate]);

  const formik = useFormik({
    initialValues: {
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      address: client?.address || '',
      tax_id: client?.tax_id || '',
      currency: client?.currency || 'USD',
      payment_terms: client?.payment_terms || 30
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        if (isEdit) {
          await clientService.updateClient(id, values);
          addNotification({
            type: 'success',
            title: 'Success',
            message: 'Client updated successfully'
          });
        } else {
          await clientService.createClient(values);
          addNotification({
            type: 'success',
            title: 'Success',
            message: 'Client created successfully'
          });
        }
        navigate('/clients');
      } catch (error) {
        console.error('Error saving client:', error);
        addNotification({
          type: 'error',
          title: 'Error',
          message: `Failed to ${isEdit ? 'update' : 'create'} client`
        });
      } finally {
        setLoading(false);
      }
    }
  });

  if (loading && isEdit && !client) {
    return <LoadingSpinner message="Loading client..." />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Edit Client' : 'Add New Client'}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Client Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tax ID"
                name="tax_id"
                value={formik.values.tax_id}
                onChange={formik.handleChange}
                error={formik.touched.tax_id && Boolean(formik.errors.tax_id)}
                helperText={formik.touched.tax_id && formik.errors.tax_id}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Address"
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Currency"
                name="currency"
                value={formik.values.currency}
                onChange={formik.handleChange}
                error={formik.touched.currency && Boolean(formik.errors.currency)}
                helperText={formik.touched.currency && formik.errors.currency}
                required
              >
                {currencies.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Payment Terms (Days)"
                name="payment_terms"
                value={formik.values.payment_terms}
                onChange={formik.handleChange}
                error={formik.touched.payment_terms && Boolean(formik.errors.payment_terms)}
                helperText={formik.touched.payment_terms && formik.errors.payment_terms}
                inputProps={{ min: 0 }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate('/clients')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (isEdit ? 'Update Client' : 'Create Client')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ClientForm;