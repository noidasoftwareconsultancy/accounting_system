import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useApp } from '../../../contexts/AppContext';
import warehouseService from '../../../services/warehouseService';
import productService from '../../../services/productService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import FormActions from '../components/FormActions';
import WarehouseSelector from '../components/WarehouseSelector';
import ProductSelector from '../components/ProductSelector';
import useFormValidation from '../hooks/useFormValidation';
import useUnsavedChanges from '../hooks/useUnsavedChanges';

const StockAdjustmentFormPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();

  const [formData, setFormData] = useState({
    warehouse_id: '',
    product_id: '',
    adjustment_type: 'add',
    quantity: '',
    reason: '',
    notes: ''
  });

  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentStock, setCurrentStock] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const validationSchema = {
    warehouse_id: { required: true },
    product_id: { required: true },
    quantity: { required: true, numeric: true, min: 1 },
    reason: { required: true }
  };

  const { errors, validate, validateField, clearError } = useFormValidation(validationSchema);
  useUnsavedChanges(isDirty);

  useEffect(() => {
    fetchWarehouses();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (formData.warehouse_id && formData.product_id) {
      fetchCurrentStock();
    }
  }, [formData.warehouse_id, formData.product_id]);

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

  const fetchCurrentStock = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/inventory?warehouse_id=${formData.warehouse_id}&product_id=${formData.product_id}`);
      const data = await response.json();
      const stockItem = data.data?.[0];
      setCurrentStock(stockItem?.quantity || 0);
    } catch (error) {
      console.error('Error fetching current stock:', error);
      setCurrentStock(0);
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

  const handleBlur = (field) => {
    validateField(field, formData[field], validationSchema);
  };

  const getNewStockLevel = () => {
    const qty = parseFloat(formData.quantity) || 0;
    if (formData.adjustment_type === 'add') {
      return currentStock + qty;
    } else {
      return currentStock - qty;
    }
  };

  const handleSubmit = () => {
    const { isValid } = validate(formData);
    
    if (!isValid) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors before submitting'
      });
      return;
    }

    if (formData.adjustment_type === 'remove' && parseFloat(formData.quantity) > currentStock) {
      addNotification({
        type: 'error',
        title: 'Insufficient Stock',
        message: `Cannot remove ${formData.quantity} units. Only ${currentStock} units available.`
      });
      return;
    }

    setConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/stock-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create stock adjustment');
      }

      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Stock adjustment created successfully'
      });
      setIsDirty(false);
      navigate('/inventory/adjustments');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to create stock adjustment'
      });
    } finally {
      setSaving(false);
      setConfirmDialogOpen(false);
    }
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    navigate('/inventory/adjustments');
  };

  const selectedProduct = products.find(p => p.id === formData.product_id);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create Stock Adjustment
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <WarehouseSelector
              label="Warehouse"
              value={formData.warehouse_id}
              onChange={(value) => handleChange('warehouse_id', value)}
              warehouses={warehouses}
              error={errors.warehouse_id}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ProductSelector
              value={formData.product_id}
              onChange={(value) => handleChange('product_id', value)}
              products={products}
              error={errors.product_id}
              required
            />
          </Grid>

          {formData.warehouse_id && formData.product_id && (
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Current Stock Level:</strong> {currentStock} units
                  {selectedProduct && ` of ${selectedProduct.name}`}
                </Typography>
              </Alert>
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <Typography variant="body2" gutterBottom>
              Adjustment Type *
            </Typography>
            <ToggleButtonGroup
              value={formData.adjustment_type}
              exclusive
              onChange={(e, value) => value && handleChange('adjustment_type', value)}
              fullWidth
            >
              <ToggleButton value="add" color="success">
                <Add sx={{ mr: 1 }} />
                Add Stock
              </ToggleButton>
              <ToggleButton value="remove" color="error">
                <Remove sx={{ mr: 1 }} />
                Remove Stock
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              onBlur={() => handleBlur('quantity')}
              error={Boolean(errors.quantity)}
              helperText={errors.quantity}
              required
              inputProps={{ min: 1, step: 1 }}
            />
          </Grid>

          {formData.quantity && formData.warehouse_id && formData.product_id && (
            <Grid item xs={12}>
              <Alert severity={getNewStockLevel() < 0 ? 'error' : 'success'}>
                <Typography variant="body2">
                  <strong>New Stock Level:</strong> {getNewStockLevel()} units
                  {getNewStockLevel() < 0 && ' (Invalid - cannot be negative)'}
                </Typography>
              </Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Reason"
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              onBlur={() => handleBlur('reason')}
              error={Boolean(errors.reason)}
              helperText={errors.reason || 'Required - explain why this adjustment is needed'}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Additional Notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              multiline
              rows={3}
            />
          </Grid>
        </Grid>

        <FormActions
          onSave={handleSubmit}
          onCancel={handleCancel}
          loading={saving}
          disabled={!isDirty}
          sx={{ mt: 3 }}
        />
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Stock Adjustment</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to {formData.adjustment_type} {formData.quantity} units?
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Current Stock: {currentStock} units
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Adjustment: {formData.adjustment_type === 'add' ? '+' : '-'}{formData.quantity} units
            </Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
              New Stock: {getNewStockLevel()} units
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmSubmit} variant="contained" disabled={saving}>
            {saving ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StockAdjustmentFormPage;
