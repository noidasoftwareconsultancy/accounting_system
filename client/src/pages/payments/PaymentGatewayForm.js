import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Save, Cancel, Visibility, VisibilityOff, Security } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import bankingService from '../../services/bankingService';
import { useApp } from '../../contexts/AppContext';

const validationSchema = yup.object({
  name: yup.string().required('Gateway name is required'),
  api_key: yup.string(),
  secret_key: yup.string(),
  is_active: yup.boolean()
});

const PaymentGatewayForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNotification } = useApp();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      api_key: '',
      secret_key: '',
      is_active: true
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);

        if (isEdit) {
          // Note: Update endpoint would need to be implemented in the backend
          addNotification({
            type: 'success',
            title: 'Success',
            message: 'Payment gateway updated successfully'
          });
        } else {
          await bankingService.createPaymentGateway(values);
          addNotification({
            type: 'success',
            title: 'Success',
            message: 'Payment gateway created successfully'
          });
        }

        navigate('/payments/gateways');
      } catch (err) {
        console.error('Error saving payment gateway:', err);
        setError(err.response?.data?.message || 'Failed to save payment gateway');
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to save payment gateway'
        });
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (isEdit) {
      fetchGateway();
    }
  }, [id, isEdit]);

  const fetchGateway = async () => {
    try {
      setLoading(true);
      // Note: Get by ID endpoint would need to be implemented in the backend
      const response = await bankingService.getPaymentGateways();
      const gateway = response.data.find(g => g.id === parseInt(id));
      
      if (gateway) {
        formik.setValues({
          name: gateway.name,
          api_key: gateway.api_key || '',
          secret_key: gateway.secret_key || '',
          is_active: gateway.is_active
        });
      }
    } catch (err) {
      console.error('Error fetching payment gateway:', err);
      setError('Failed to fetch payment gateway details');
    } finally {
      setLoading(false);
    }
  };

  const gatewayTypes = [
    {
      name: 'Stripe',
      description: 'Accept credit cards, digital wallets, and more',
      fields: ['api_key', 'secret_key']
    },
    {
      name: 'PayPal',
      description: 'PayPal payments and PayPal Credit',
      fields: ['api_key', 'secret_key']
    },
    {
      name: 'Square',
      description: 'Square payment processing',
      fields: ['api_key', 'secret_key']
    },
    {
      name: 'Razorpay',
      description: 'Indian payment gateway',
      fields: ['api_key', 'secret_key']
    }
  ];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {isEdit ? 'Edit Payment Gateway' : 'Add Payment Gateway'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {isEdit ? 'Update payment gateway configuration' : 'Configure a new payment processing gateway'}
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
          {/* Gateway Configuration */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Gateway Configuration
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Gateway Name"
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="API Key"
                      name="api_key"
                      type={showApiKey ? 'text' : 'password'}
                      value={formik.values.api_key}
                      onChange={formik.handleChange}
                      error={formik.touched.api_key && Boolean(formik.errors.api_key)}
                      helperText={formik.touched.api_key && formik.errors.api_key}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowApiKey(!showApiKey)}
                              edge="end"
                            >
                              {showApiKey ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Secret Key"
                      name="secret_key"
                      type={showSecretKey ? 'text' : 'password'}
                      value={formik.values.secret_key}
                      onChange={formik.handleChange}
                      error={formik.touched.secret_key && Boolean(formik.errors.secret_key)}
                      helperText={formik.touched.secret_key && formik.errors.secret_key}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowSecretKey(!showSecretKey)}
                              edge="end"
                            >
                              {showSecretKey ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="is_active"
                          checked={formik.values.is_active}
                          onChange={formik.handleChange}
                        />
                      }
                      label="Active"
                    />
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 4 }}>
                      Enable this gateway to process payments
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Gateway Types */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Popular Gateways
                </Typography>

                <Box display="flex" flexDirection="column" gap={2}>
                  {gatewayTypes.map((gateway) => (
                    <Card
                      key={gateway.name}
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        bgcolor: formik.values.name === gateway.name ? 'action.selected' : 'transparent'
                      }}
                      onClick={() => formik.setFieldValue('name', gateway.name)}
                    >
                      <CardContent sx={{ py: 1.5 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Security fontSize="small" color="primary" />
                          <Typography variant="body2" fontWeight="medium">
                            {gateway.name}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {gateway.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="warning.main">
                  Security Notice
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • Keep your API keys secure and never share them
                  • Use test keys during development
                  • Regularly rotate your production keys
                  • Monitor gateway logs for suspicious activity
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Actions */}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={() => navigate('/payments/gateways')}
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
            {loading ? 'Saving...' : isEdit ? 'Update Gateway' : 'Add Gateway'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default PaymentGatewayForm;