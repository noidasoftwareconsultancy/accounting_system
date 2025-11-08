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
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Search,
  Warehouse as WarehouseIcon,
  LocationOn,
  Phone,
  Email as EmailIcon,
  Inventory
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import warehouseService from '../../services/warehouseService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const WarehousesPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [warehouseDialogOpen, setWarehouseDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    phone: '',
    email: '',
    manager_id: null,
    is_active: true
  });

  useEffect(() => {
    fetchWarehouses();
  }, [page, rowsPerPage, searchTerm]);

  const fetchWarehouses = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm
      };
      const response = await warehouseService.getAllWarehouses(params);
      setWarehouses(response.data.data.warehouses);
      setTotalCount(response.data.data.pagination.total);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch warehouses'
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, addNotification]);

  const handleMenuClick = (event, warehouse) => {
    setAnchorEl(event.currentTarget);
    setSelectedWarehouse(warehouse);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedWarehouse(null);
  };

  const handleAddWarehouse = () => {
    navigate('/inventory/warehouses/new');
  };

  const handleAddWarehouseOld = () => {
    setEditMode(false);
    setFormData({
      name: '',
      code: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      phone: '',
      email: '',
      manager_id: null,
      is_active: true
    });
    setWarehouseDialogOpen(true);
  };

  const handleEditWarehouse = () => {
    setEditMode(true);
    setFormData({
      name: selectedWarehouse.name,
      code: selectedWarehouse.code,
      address: selectedWarehouse.address || '',
      city: selectedWarehouse.city || '',
      state: selectedWarehouse.state || '',
      country: selectedWarehouse.country || '',
      postal_code: selectedWarehouse.postal_code || '',
      phone: selectedWarehouse.phone || '',
      email: selectedWarehouse.email || '',
      manager_id: selectedWarehouse.manager_id,
      is_active: selectedWarehouse.is_active
    });
    setWarehouseDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await warehouseService.deleteWarehouse(selectedWarehouse.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Warehouse deleted successfully'
      });
      fetchWarehouses();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete warehouse'
      });
    }
    setDeleteDialogOpen(false);
  };

  const handleSaveWarehouse = async () => {
    try {
      if (editMode) {
        await warehouseService.updateWarehouse(selectedWarehouse.id, formData);
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
      setWarehouseDialogOpen(false);
      fetchWarehouses();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to save warehouse'
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

  const getWarehouseInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading && warehouses.length === 0) {
    return <LoadingSpinner message="Loading warehouses..." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Warehouses
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddWarehouse}
        >
          Add Warehouse
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <WarehouseIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Warehouses
                  </Typography>
                  <Typography variant="h4">
                    {totalCount}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Inventory />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Active Warehouses
                  </Typography>
                  <Typography variant="h4">
                    {warehouses.filter(w => w.is_active).length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <LocationOn />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Locations
                  </Typography>
                  <Typography variant="h4">
                    {new Set(warehouses.map(w => w.city).filter(Boolean)).size}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search warehouses by name, code, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Paper>

      {/* Warehouse Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Warehouse</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {warehouses.map((warehouse) => (
              <TableRow key={warehouse.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {getWarehouseInitials(warehouse.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {warehouse.name}
                      </Typography>
                      {warehouse.address && (
                        <Typography variant="body2" color="textSecondary" noWrap sx={{ maxWidth: 200 }}>
                          {warehouse.address}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={warehouse.code} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Box>
                    {warehouse.city && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2">
                          {[warehouse.city, warehouse.state, warehouse.country]
                            .filter(Boolean)
                            .join(', ')}
                        </Typography>
                      </Box>
                    )}
                    {warehouse.postal_code && (
                      <Typography variant="body2" color="textSecondary">
                        {warehouse.postal_code}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    {warehouse.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">{warehouse.email}</Typography>
                      </Box>
                    )}
                    {warehouse.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone fontSize="small" color="action" />
                        <Typography variant="body2">{warehouse.phone}</Typography>
                      </Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={warehouse.is_active ? 'Active' : 'Inactive'}
                    size="small"
                    color={warehouse.is_active ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={(e) => handleMenuClick(e, warehouse)}>
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
          navigate(`/inventory/warehouses/${selectedWarehouse?.id}`);
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditWarehouse}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Warehouse Form Dialog */}
      <Dialog
        open={warehouseDialogOpen}
        onClose={() => setWarehouseDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? 'Edit Warehouse' : 'Add New Warehouse'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Warehouse Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Warehouse Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                helperText="Unique identifier for the warehouse"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="State/Province"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWarehouseDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveWarehouse} variant="contained">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Warehouse"
        message={`Are you sure you want to delete "${selectedWarehouse?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        severity="error"
      />
    </Box>
  );
};

export default WarehousesPage;
