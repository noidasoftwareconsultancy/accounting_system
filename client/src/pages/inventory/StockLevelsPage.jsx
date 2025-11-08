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
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Alert,
  LinearProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  TrendingUp,
  FilterList,
  Add,
  Remove,
  SwapHoriz
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import inventoryService from '../../services/inventoryService';
import productService from '../../services/productService';
import warehouseService from '../../services/warehouseService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const StockLevelsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addNotification } = useApp();
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState(searchParams.get('warehouse') || '');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState(searchParams.get('filter') || 'all');
  const [stats, setStats] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustmentData, setAdjustmentData] = useState({
    quantity: 0,
    type: 'add',
    notes: ''
  });

  useEffect(() => {
    fetchInventory();
    fetchWarehouses();
    fetchCategories();
    fetchStats();
  }, [page, rowsPerPage, searchTerm, warehouseFilter, categoryFilter, stockFilter]);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        warehouse_id: warehouseFilter || undefined,
        low_stock: stockFilter === 'low' ? 'true' : undefined
      };
      const response = await inventoryService.getAllInventory(params);
      let items = response.data.data.items;

      // Client-side filtering for category and stock status
      if (categoryFilter) {
        items = items.filter(item => item.product?.category_id === parseInt(categoryFilter));
      }
      if (stockFilter === 'out') {
        items = items.filter(item => item.quantity_available === 0);
      } else if (stockFilter === 'available') {
        items = items.filter(item => item.quantity_available > 0);
      }

      setInventory(items);
      setTotalCount(response.data.data.pagination.total);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch inventory'
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, warehouseFilter, categoryFilter, stockFilter, addNotification]);

  const fetchWarehouses = async () => {
    try {
      const response = await warehouseService.getAllWarehouses({ limit: 100 });
      setWarehouses(response.data.data.warehouses);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productService.getAllCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await inventoryService.getInventoryStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAdjustStock = (item) => {
    setSelectedItem(item);
    setAdjustmentData({
      quantity: 0,
      type: 'add',
      notes: ''
    });
    setAdjustDialogOpen(true);
  };

  const handleSaveAdjustment = async () => {
    try {
      const quantityChange = adjustmentData.type === 'add' 
        ? Math.abs(adjustmentData.quantity)
        : -Math.abs(adjustmentData.quantity);

      await inventoryService.updateQuantity({
        productId: selectedItem.product_id,
        warehouseId: selectedItem.warehouse_id,
        quantityChange,
        movementType: 'adjustment',
        referenceType: 'manual',
        notes: adjustmentData.notes
      });

      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Stock adjusted successfully'
      });
      setAdjustDialogOpen(false);
      fetchInventory();
      fetchStats();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to adjust stock'
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

  const getStockStatus = (item) => {
    if (item.quantity_available === 0) {
      return { label: 'Out of Stock', color: 'error' };
    } else if (item.quantity_available <= item.product?.reorder_level) {
      return { label: 'Low Stock', color: 'warning' };
    } else {
      return { label: 'In Stock', color: 'success' };
    }
  };

  const getStockPercentage = (item) => {
    if (!item.product?.reorder_level || item.product.reorder_level === 0) return 100;
    return Math.min((item.quantity_available / (item.product.reorder_level * 2)) * 100, 100);
  };

  if (loading && inventory.length === 0) {
    return <LoadingSpinner message="Loading stock levels..." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Stock Levels
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<SwapHoriz />}
            onClick={() => navigate('/inventory/transfers/new')}
            sx={{ mr: 1 }}
          >
            Transfer Stock
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/inventory/adjustments/new')}
          >
            Stock Adjustment
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <InventoryIcon />
                  </Avatar>
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Total Products
                    </Typography>
                    <Typography variant="h4">
                      {stats.total_products}
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
                    <WarningIcon />
                  </Avatar>
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Low Stock Items
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {stats.low_stock_items}
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
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Inventory Value
                    </Typography>
                    <Typography variant="h4">
                      ${(stats.total_inventory_value || 0).toLocaleString()}
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
                    <InventoryIcon />
                  </Avatar>
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Warehouses
                    </Typography>
                    <Typography variant="h4">
                      {stats.total_warehouses}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Warehouse</InputLabel>
              <Select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                label="Warehouse"
              >
                <MenuItem value="">All Warehouses</MenuItem>
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
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
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Stock Status</InputLabel>
              <Select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                label="Stock Status"
              >
                <MenuItem value="all">All Stock</MenuItem>
                <MenuItem value="available">In Stock</MenuItem>
                <MenuItem value="low">Low Stock</MenuItem>
                <MenuItem value="out">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                setSearchTerm('');
                setWarehouseFilter('');
                setCategoryFilter('');
                setStockFilter('all');
              }}
              sx={{ height: '56px' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Stock Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Warehouse</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>On Hand</TableCell>
              <TableCell>Reserved</TableCell>
              <TableCell>Available</TableCell>
              <TableCell>Reorder Level</TableCell>
              <TableCell>Stock Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => {
              const status = getStockStatus(item);
              const percentage = getStockPercentage(item);
              
              return (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {item.product?.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={item.product?.sku} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{item.warehouse?.name}</TableCell>
                  <TableCell>{item.product?.category?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {item.quantity_on_hand}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {item.quantity_reserved > 0 ? (
                      <Chip 
                        label={item.quantity_reserved} 
                        size="small" 
                        color="info"
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">0</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {item.quantity_available}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {item.product?.reorder_level || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Chip
                        label={status.label}
                        size="small"
                        color={status.color}
                      />
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{ 
                          mt: 1, 
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: 
                              percentage < 25 ? 'error.main' :
                              percentage < 50 ? 'warning.main' :
                              'success.main'
                          }
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleAdjustStock(item)}
                    >
                      Adjust
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {inventory.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography variant="body2" color="textSecondary" py={3}>
                    No inventory items found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Stock Adjustment Dialog */}
      <Dialog
        open={adjustDialogOpen}
        onClose={() => setAdjustDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Adjust Stock Level</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Product:</strong> {selectedItem.product?.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Warehouse:</strong> {selectedItem.warehouse?.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Current Stock:</strong> {selectedItem.quantity_available}
                </Typography>
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Adjustment Type</InputLabel>
                    <Select
                      value={adjustmentData.type}
                      onChange={(e) => setAdjustmentData({ ...adjustmentData, type: e.target.value })}
                      label="Adjustment Type"
                    >
                      <MenuItem value="add">Add Stock</MenuItem>
                      <MenuItem value="remove">Remove Stock</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={adjustmentData.quantity}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity: parseInt(e.target.value) || 0 })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {adjustmentData.type === 'add' ? <Add /> : <Remove />}
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={adjustmentData.notes}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, notes: e.target.value })}
                    placeholder="Reason for adjustment..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="warning">
                    New stock level will be: {
                      adjustmentData.type === 'add'
                        ? selectedItem.quantity_available + Math.abs(adjustmentData.quantity)
                        : selectedItem.quantity_available - Math.abs(adjustmentData.quantity)
                    }
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjustDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveAdjustment} 
            variant="contained"
            disabled={!adjustmentData.quantity || adjustmentData.quantity === 0}
          >
            Confirm Adjustment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StockLevelsPage;
