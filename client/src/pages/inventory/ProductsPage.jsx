import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Search,
  Inventory,
  Category as CategoryIcon,
  LocalOffer,
  QrCode
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category_id: '',
    unit_of_measure: 'pcs',
    unit_price: '',
    cost_price: '',
    reorder_level: 0,
    reorder_quantity: 0,
    tax_rate: 0,
    barcode: '',
    is_active: true,
    is_serialized: false,
    is_batch_tracked: false
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    parent_id: null,
    is_active: true
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, rowsPerPage, searchTerm, categoryFilter]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        category_id: categoryFilter || undefined
      };
      const response = await productService.getAllProducts(params);
      setProducts(response.data.data.products);
      setTotalCount(response.data.data.pagination.total);
    } catch (error) {
      console.error('Error fetching products:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch products'
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, categoryFilter, addNotification]);

  const fetchCategories = async () => {
    try {
      const response = await productService.getAllCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleMenuClick = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const handleAddProduct = () => {
    navigate('/inventory/products/new');
  };

  const handleAddProductOld = () => {
    setEditMode(false);
    setFormData({
      sku: '',
      name: '',
      description: '',
      category_id: '',
      unit_of_measure: 'pcs',
      unit_price: '',
      cost_price: '',
      reorder_level: 0,
      reorder_quantity: 0,
      tax_rate: 0,
      barcode: '',
      is_active: true,
      is_serialized: false,
      is_batch_tracked: false
    });
    setProductDialogOpen(true);
  };

  const handleEditProduct = () => {
    setEditMode(true);
    setFormData({
      sku: selectedProduct.sku,
      name: selectedProduct.name,
      description: selectedProduct.description || '',
      category_id: selectedProduct.category_id || '',
      unit_of_measure: selectedProduct.unit_of_measure,
      unit_price: selectedProduct.unit_price,
      cost_price: selectedProduct.cost_price,
      reorder_level: selectedProduct.reorder_level,
      reorder_quantity: selectedProduct.reorder_quantity,
      tax_rate: selectedProduct.tax_rate,
      barcode: selectedProduct.barcode || '',
      is_active: selectedProduct.is_active,
      is_serialized: selectedProduct.is_serialized,
      is_batch_tracked: selectedProduct.is_batch_tracked
    });
    setProductDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await productService.deleteProduct(selectedProduct.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Product deleted successfully'
      });
      fetchProducts();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete product'
      });
    }
    setDeleteDialogOpen(false);
  };

  const handleSaveProduct = async () => {
    try {
      if (editMode) {
        await productService.updateProduct(selectedProduct.id, formData);
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
      setProductDialogOpen(false);
      fetchProducts();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to save product'
      });
    }
  };

  const handleSaveCategory = async () => {
    try {
      await productService.createCategory(categoryFormData);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Category created successfully'
      });
      setCategoryDialogOpen(false);
      fetchCategories();
      setCategoryFormData({
        name: '',
        description: '',
        parent_id: null,
        is_active: true
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create category'
      });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'N/A';
  };

  if (loading && products.length === 0) {
    return <LoadingSpinner message="Loading products..." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Products
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<CategoryIcon />}
            onClick={() => setCategoryDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Add Category
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddProduct}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Inventory />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Products
                  </Typography>
                  <Typography variant="h4">
                    {totalCount}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CategoryIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Categories
                  </Typography>
                  <Typography variant="h4">
                    {categories.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <QrCode />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Serialized
                  </Typography>
                  <Typography variant="h4">
                    {products.filter(p => p.is_serialized).length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <LocalOffer />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Batch Tracked
                  </Typography>
                  <Typography variant="h4">
                    {products.filter(p => p.is_batch_tracked).length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search products by name, SKU, or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Product Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Unit Price</TableCell>
              <TableCell>Cost Price</TableCell>
              <TableCell>UOM</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2">
                      {product.name}
                    </Typography>
                    {product.description && (
                      <Typography variant="body2" color="textSecondary" noWrap sx={{ maxWidth: 200 }}>
                        {product.description}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={product.sku} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  {getCategoryName(product.category_id)}
                </TableCell>
                <TableCell>
                  ${parseFloat(product.unit_price).toFixed(2)}
                </TableCell>
                <TableCell>
                  ${parseFloat(product.cost_price).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Chip label={product.unit_of_measure} size="small" />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    <Chip
                      label={product.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      color={product.is_active ? 'success' : 'default'}
                    />
                    {product.is_serialized && (
                      <Chip label="Serial" size="small" color="info" />
                    )}
                    {product.is_batch_tracked && (
                      <Chip label="Batch" size="small" color="warning" />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={(e) => handleMenuClick(e, product)}>
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/inventory/products/${selectedProduct?.id}`);
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditProduct}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Product Form Dialog */}
      <Dialog
        open={productDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SKU"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="">None</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Unit of Measure</InputLabel>
                <Select
                  value={formData.unit_of_measure}
                  onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                  label="Unit of Measure"
                >
                  <MenuItem value="pcs">Pieces</MenuItem>
                  <MenuItem value="kg">Kilograms</MenuItem>
                  <MenuItem value="ltr">Liters</MenuItem>
                  <MenuItem value="box">Box</MenuItem>
                  <MenuItem value="m">Meters</MenuItem>
                  <MenuItem value="set">Set</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Unit Price"
                type="number"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cost Price"
                type="number"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reorder Level"
                type="number"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reorder Quantity"
                type="number"
                value={formData.reorder_quantity}
                onChange={(e) => setFormData({ ...formData, reorder_quantity: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tax Rate (%)"
                type="number"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_serialized}
                    onChange={(e) => setFormData({ ...formData, is_serialized: e.target.checked })}
                  />
                }
                label="Serialized"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_batch_tracked}
                    onChange={(e) => setFormData({ ...formData, is_batch_tracked: e.target.checked })}
                  />
                }
                label="Batch Tracked"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveProduct} variant="contained">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Form Dialog */}
      <Dialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Parent Category</InputLabel>
                <Select
                  value={categoryFormData.parent_id || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, parent_id: e.target.value || null })}
                  label="Parent Category"
                >
                  <MenuItem value="">None</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={categoryFormData.is_active}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, is_active: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveCategory} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        severity="error"
      />
    </Box>
  );
};

export default ProductsPage;
