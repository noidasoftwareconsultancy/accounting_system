import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Divider,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useApp } from '../../../contexts/AppContext';
import stockTransferService from '../../../services/stockTransferService';
import warehouseService from '../../../services/warehouseService';
import productService from '../../../services/productService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import FormActions from '../components/FormActions';
import LineItemsTable from '../components/LineItemsTable';
import WarehouseSelector from '../components/WarehouseSelector';
import useFormValidation from '../hooks/useFormValidation';
import useUnsavedChanges from '../hooks/useUnsavedChanges';

const StockTransferFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    from_warehouse_id: '',
    to_warehouse_id: '',
    transfer_date: new Date(),
    notes: '',
    items: []
  });

  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [availableStock, setAvailableStock] = useState({});
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const validationSchema = {
    from_warehouse_id: { required: true },
    to_warehouse_id: { required: true },
    transfer_date: { required: true }
  };

  const { errors, validate, validateField, clearError } = useFormValidation(validationSchema);
  useUnsavedChanges(isDirty);

  useEffect(() => {
    fetchWarehouses();
    fetchProducts();
    if (isEditMode) {
      fetchStockTransfer();
    }
  }, [id]);

  useEffect(() => {
    if (formData.from_warehouse_id) {
      fetchAvailableStock(formData.from_warehouse_id);
    }
  }, [formData.from_warehouse_id]);

  const fetchWarehouses = async () => {
    try {
      const response = await warehouseService.getAllWarehouses({ limit: 100 });
      setWarehouses(response.data.data.warehouses || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
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

  const fetchAvailableStock = async (warehouseId) => {
    try {
      const response = await fetch(`/api/inventory?warehouse_id=${warehouseId}`);
      const data = await response.json();
      const stockMap = {};
      (data.data || []).forEach(item => {
        stockMap[item.product_id] = item.quantity;
      });
      setAvailableStock(stockMap);
    } catch (error) {
      console.error('Error fetching available stock:', error);
    }
  };

  const fetchStockTransfer = async () => {
    try {
      setLoading(true);
      const response = await stockTransferService.getTransferById(id);
      const transfer = response.data.data;
      setFormData({
        from_warehouse_id: transfer.from_warehouse_id || '',
        to_warehouse_id: transfer.to_warehouse_id || '',
        transfer_date: new Date(transfer.transfer_date),
        notes: transfer.notes || '',
        items: transfer.items || []
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load stock transfer'
      });
      navigate('/inventory/transfers');
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
      items: [...prev.items, { product_id: null, quantity: 1, unit_price: 0 }]
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

  const validateStockAvailability = () => {
    for (const item of formData.items) {
      const available = availableStock[item.product_id] || 0;
      if (item.quantity > available) {
        const product = products.find(p => p.id === item.product_id);
        return `Insufficient stock for ${product?.name}. Available: ${available}, Requested: ${item.quantity}`;
      }
    }
    return null;
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

    if (formData.from_warehouse_id === formData.to_warehouse_id) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Source and destination warehouses must be different'
      });
      return;
    }

    const stockError = validateStockAvailability();
    if (stockError) {
      addNotification({
        type: 'error',
        title: 'Insufficient Stock',
        message: stockError
      });
      return;
    }

    try {
      setSaving(true);
      const submitData = {
        ...formData,
        transfer_date: formData.transfer_date.toISOString().split('T')[0]
      };

      if (isEditMode) {
        await stockTransferService.updateTransfer(id, submitData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Stock transfer updated successfully'
        });
      } else {
        await stockTransferService.createTransfer(submitData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Stock transfer created successfully'
        });
      }
      setIsDirty(false);
      navigate('/inventory/transfers');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error?.message || 'Failed to save stock transfer'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    navigate('/inventory/transfers');
  };

  if (loading) {
    return <LoadingSpinner message="Loading stock transfer..." />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Stock Transfer' : 'Create Stock Transfer'}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Transfer Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <WarehouseSelector
              label="From Warehouse"
              value={formData.from_warehouse_id}
              onChange={(value) => handleChange('from_warehouse_id', value)}
              warehouses={warehouses}
              error={errors.from_warehouse_id}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <WarehouseSelector
              label="To Warehouse"
              value={formData.to_warehouse_id}
              onChange={(value) => handleChange('to_warehouse_id', value)}
              warehouses={warehouses}
              excludeId={formData.from_warehouse_id}
              error={errors.to_warehouse_id}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Transfer Date"
              value={formData.transfer_date}
              onChange={(date) => handleChange('transfer_date', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: Boolean(errors.transfer_date),
                  helperText: errors.transfer_date
                }
              }}
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

        {formData.from_warehouse_id && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Stock availability is shown from the source warehouse
          </Alert>
        )}

        <Typography variant="h6" gutterBottom>
          Items to Transfer
        </Typography>
        <LineItemsTable
          items={formData.items}
          products={products}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onUpdateItem={handleUpdateItem}
          showAvailableStock={true}
          availableStock={availableStock}
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

export default StockTransferFormPage;
