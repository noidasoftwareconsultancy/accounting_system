import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  FormControlLabel,
  Switch
} from '@mui/material';
import { useApp } from '../../../contexts/AppContext';
import warehouseService from '../../../services/warehouseService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import FormActions from '../components/FormActions';
import useFormValidation from '../hooks/useFormValidation';
import useUnsavedChanges from '../hooks/useUnsavedChanges';

const WarehouseFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    capacity: '',
    is_active: true
  });

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const validationSchema = {
    name: { required: true },
    code: { required: true },
    address: { required: true },
    city: { required: true },
    capacity: { numeric: true, min: 0 }
  };

  const { errors, validate, validateField, clearError } = useFormValidation(validationSchema);
  useUnsavedChanges(isDirty);

  useEffect(() => {
    if (isEditMode) {
      fetchWarehouse();
    }
  }, [id]);

  const fetchWarehouse = async () => {
    try {
      setLoading(true);
      const response = await warehouseService.getWarehouseById(id);
      const warehouse = response.data.data;
      setFormData({
        name: warehouse.name || '',
        code: warehouse.code || '',
        address: warehouse.address || '',
        city: warehouse.city || '',
        state: warehouse.state || '',
        postal_code: warehouse.postal_code || '',
        country: warehouse.country || '',
        capacity: warehouse.capacity || '',
        is_active: warehouse.is_active !== false
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load warehouse'
      });
      navigate('/inventory/warehouses');
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

    try {
      setSaving(true);
      if (isEditMode) {
        await warehouseService.updateWarehouse(id, formData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Warehouse updated successfully'
        });
      } else {
        await warehouseService.createWarehouse(formData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Warehouse created successfully'
        });
      }
      setIsDirty(false);
      navigate('/inventory/warehouses');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error?.message || 'Failed to save warehouse'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    navigate('/inventory/warehouses');
  };

  if (loading) {
    return <LoadingSpinner message="Loading warehouse..." />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Warehouse' : 'Create Warehouse'}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Warehouse Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              error={Boolean(errors.name)}
              helperText={errors.name}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Warehouse Code"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value)}
              onBlur={() => handleBlur('code')}
              error={Boolean(errors.code)}
              helperText={errors.code}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              onBlur={() => handleBlur('address')}
              error={Boolean(errors.address)}
              helperText={errors.address}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              onBlur={() => handleBlur('city')}
              error={Boolean(errors.city)}
              helperText={errors.city}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="State/Province"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Postal Code"
              value={formData.postal_code}
              onChange={(e) => handleChange('postal_code', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Country"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => handleChange('capacity', e.target.value)}
              onBlur={() => handleBlur('capacity')}
              error={Boolean(errors.capacity)}
              helperText={errors.capacity || 'Maximum storage capacity'}
              inputProps={{ min: 0, step: 1 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                />
              }
              label="Active"
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
    </Box>
  );
};

export default WarehouseFormPage;
