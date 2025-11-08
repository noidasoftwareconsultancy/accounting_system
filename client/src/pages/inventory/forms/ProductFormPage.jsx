import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Button
} from '@mui/material';
import { useApp } from '../../../contexts/AppContext';
import productService from '../../../services/productService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import FormActions from '../components/FormActions';
import useFormValidation from '../hooks/useFormValidation';
import useUnsavedChanges from '../hooks/useUnsavedChanges';

const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category_id: '',
    unit_price: '',
    cost_price: '',
    reorder_level: '',
    barcode: ''
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const validationSchema = {
    name: { required: true },
    sku: { required: true },
    unit_price: { required: true, numeric: true, min: 0 },
    cost_price: { numeric: true, min: 0 },
    reorder_level: { numeric: true, min: 0 }
  };

  const { errors, validate, validateField, clearError } = useFormValidation(validationSchema);
  useUnsavedChanges(isDirty);

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await productService.getAllCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductById(id);
      const product = response.data.data;
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        category_id: product.category_id || '',
        unit_price: product.unit_price || '',
        cost_price: product.cost_price || '',
        reorder_level: product.reorder_level || '',
        barcode: product.barcode || ''
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load product'
      });
      navigate('/inventory/products');
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
        await productService.updateProduct(id, formData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Product updated successfully'
        });
      } else {
        await productService.createProduct(formData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Product created successfully'
        });
      }
      setIsDirty(false);
      navigate('/inventory/products');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error?.message || 'Failed to save product'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    navigate('/inventory/products');
  };

  if (loading) {
    return <LoadingSpinner message="Loading product..." />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Product' : 'Create Product'}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Product Name"
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
              label="SKU"
              value={formData.sku}
              onChange={(e) => handleChange('sku', e.target.value)}
              onBlur={() => handleBlur('sku')}
              error={Boolean(errors.sku)}
              helperText={errors.sku}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Category"
              value={formData.category_id}
              onChange={(e) => handleChange('category_id', e.target.value)}
            >
              <MenuItem value="">
                <em>Select Category</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Barcode"
              value={formData.barcode}
              onChange={(e) => handleChange('barcode', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Unit Price"
              type="number"
              value={formData.unit_price}
              onChange={(e) => handleChange('unit_price', e.target.value)}
              onBlur={() => handleBlur('unit_price')}
              error={Boolean(errors.unit_price)}
              helperText={errors.unit_price}
              required
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
              }}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Cost Price"
              type="number"
              value={formData.cost_price}
              onChange={(e) => handleChange('cost_price', e.target.value)}
              onBlur={() => handleBlur('cost_price')}
              error={Boolean(errors.cost_price)}
              helperText={errors.cost_price}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
              }}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Reorder Level"
              type="number"
              value={formData.reorder_level}
              onChange={(e) => handleChange('reorder_level', e.target.value)}
              onBlur={() => handleBlur('reorder_level')}
              error={Boolean(errors.reorder_level)}
              helperText={errors.reorder_level || 'Minimum stock level before reorder'}
              inputProps={{ min: 0, step: 1 }}
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

export default ProductFormPage;
