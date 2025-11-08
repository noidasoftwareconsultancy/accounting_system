import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useApp } from '../../../contexts/AppContext';
import purchaseOrderService from '../../../services/purchaseOrderService';
import productService from '../../../services/productService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import FormActions from '../components/FormActions';
import LineItemsTable from '../components/LineItemsTable';
import useFormValidation from '../hooks/useFormValidation';
import useUnsavedChanges from '../hooks/useUnsavedChanges';

const PurchaseOrderFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    vendor_id: '',
    order_date: new Date(),
    expected_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    payment_terms: 30,
    currency: 'USD',
    notes: '',
    items: []
  });

  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const validationSchema = {
    vendor_id: { required: true },
    order_date: { required: true },
    expected_date: { required: true }
  };

  const { errors, validate, validateField, clearError } = useFormValidation(validationSchema);
  useUnsavedChanges(isDirty);

  useEffect(() => {
    fetchVendors();
    fetchProducts();
    if (isEditMode) {
      fetchPurchaseOrder();
    }
  }, [id]);

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/vendors');
      const data = await response.json();
      setVendors(data.data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productService.getAllProducts({ limit: 1000 });
      setProducts(response.data.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchPurchaseOrder = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderService.getPurchaseOrderById(id);
      const po = response.data.data;
      setFormData({
        vendor_id: po.vendor_id || '',
        order_date: new Date(po.order_date),
        expected_date: new Date(po.expected_date),
        payment_terms: po.payment_terms || 30,
        currency: po.currency || 'USD',
        notes: po.notes || '',
        items: po.items || []
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load purchase order'
      });
      navigate('/inventory/purchase-orders');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) {
      clearError(field);
    }
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: null, quantity: 1, unit_price: 0, tax_amount: 0 }]
    }));
    setIsDirty(true);
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  const handleUpdateItem = (index, updatedItem) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? updatedItem : item)
    }));
    setIsDirty(true);
  };

  const handleSubmit = async () => {
    const { isValid } = validate(formData);
    
    if (!isValid) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors before submitting'
      });
      return;
    }

    if (formData.items.length === 0) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please add at least one item'
      });
      return;
    }

    try {
      setSaving(true);
      const submitData = {
        ...formData,
        order_date: formData.order_date.toISOString().split('T')[0],
        expected_date: formData.expected_date.toISOString().split('T')[0]
      };

      if (isEditMode) {
        await purchaseOrderService.updatePurchaseOrder(id, submitData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Purchase order updated successfully'
        });
      } else {
        await purchaseOrderService.createPurchaseOrder(submitData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Purchase order created successfully'
        });
      }
      setIsDirty(false);
      navigate('/inventory/purchase-orders');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error?.message || 'Failed to save purchase order'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    navigate('/inventory/purchase-orders');
  };

  if (loading) {
    return <LoadingSpinner message="Loading purchase order..." />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Purchase Order' : 'Create Purchase Order'}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Vendor"
              value={formData.vendor_id}
              onChange={(e) => handleChange('vendor_id', e.target.value)}
              error={Boolean(errors.vendor_id)}
              helperText={errors.vendor_id}
              required
            >
              <MenuItem value="">
                <em>Select Vendor</em>
              </MenuItem>
              {vendors.map((vendor) => (
                <MenuItem key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Currency"
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
            >
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
              <MenuItem value="GBP">GBP</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <DatePicker
              label="Order Date"
              value={formData.order_date}
              onChange={(date) => handleChange('order_date', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: Boolean(errors.order_date),
                  helperText: errors.order_date
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <DatePicker
              label="Expected Date"
              value={formData.expected_date}
              onChange={(date) => handleChange('expected_date', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: Boolean(errors.expected_date),
                  helperText: errors.expected_date
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Payment Terms (days)"
              type="number"
              value={formData.payment_terms}
              onChange={(e) => handleChange('payment_terms', e.target.value)}
              inputProps={{ min: 0, step: 1 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              multiline
              rows={3}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Line Items
        </Typography>
        <LineItemsTable
          items={formData.items}
          products={products}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onUpdateItem={handleUpdateItem}
          showTax={true}
        />

        <FormActions
          onSave={handleSubmit}
          onCancel={handleCancel}
          loading={saving}
          disabled={!isDirty}
          sx={{ mt: 3 }}
        />
      </Paper>
    </Box>
  );
};

export default PurchaseOrderFormPage;
