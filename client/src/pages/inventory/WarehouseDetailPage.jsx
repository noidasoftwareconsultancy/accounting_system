import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  LocationOn,
  Phone,
  Email as EmailIcon,
  Inventory as InventoryIcon,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import warehouseService from '../../services/warehouseService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const WarehouseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [loading, setLoading] = useState(true);
  const [warehouse, setWarehouse] = useState(null);
  const [inventorySummary, setInventorySummary] = useState(null);

  useEffect(() => {
    fetchWarehouseDetails();
    fetchInventorySummary();
  }, [id]);

  const fetchWarehouseDetails = async () => {
    try {
      setLoading(true);
      const response = await warehouseService.getWarehouseById(id);
      setWarehouse(response.data.data);
    } catch (error) {
      console.error('Error fetching warehouse:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch warehouse details'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInventorySummary = async () => {
    try {
      const response = await warehouseService.getInventorySummary(id);
      setInventorySummary(response.data.data);
    } catch (error) {
      console.error('Error fetching inventory summary:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading warehouse details..." />;
  }

  if (!warehouse) {
    return (
      <Box p={3}>
        <Typography>Warehouse not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/inventory/warehouses')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4">{warehouse.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              Code: {warehouse.code}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => navigate(`/inventory/warehouses/${id}/edit`)}
        >
          Edit Warehouse
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2" gutterBottom>
                Total Products
              </Typography>
              <Typography variant="h4">
                {inventorySummary?.total_products || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2" gutterBottom>
                Total Quantity
              </Typography>
              <Typography variant="h4">
                {inventorySummary?.total_quantity || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2" gutterBottom>
                Inventory Value
              </Typography>
              <Typography variant="h4">
                ${(inventorySummary?.total_value || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Warehouse Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Warehouse Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Address
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOn fontSize="small" color="action" />
                <Box>
                  {warehouse.address && (
                    <Typography variant="body1">{warehouse.address}</Typography>
                  )}
                  <Typography variant="body1">
                    {[warehouse.city, warehouse.state, warehouse.postal_code]
                      .filter(Boolean)
                      .join(', ')}
                  </Typography>
                  {warehouse.country && (
                    <Typography variant="body1">{warehouse.country}</Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Contact Information
              </Typography>
              {warehouse.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body1">{warehouse.phone}</Typography>
                </Box>
              )}
              {warehouse.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body1">{warehouse.email}</Typography>
                </Box>
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={warehouse.is_active ? 'Active' : 'Inactive'}
                color={warehouse.is_active ? 'success' : 'default'}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Inventory Items */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Inventory Items
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate(`/inventory/stock?warehouse=${id}`)}
          >
            View All Stock
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>On Hand</TableCell>
                <TableCell>Reserved</TableCell>
                <TableCell>Available</TableCell>
                <TableCell>Unit Value</TableCell>
                <TableCell>Total Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventorySummary?.items?.map((item) => (
                <TableRow key={item.product_id} hover>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>
                    <Chip label={item.sku} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{item.category || 'N/A'}</TableCell>
                  <TableCell>{item.quantity_on_hand}</TableCell>
                  <TableCell>{item.quantity_reserved}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.quantity_available}
                      size="small"
                      color={item.quantity_available > 0 ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>${item.unit_value.toFixed(2)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      ${item.total_value.toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {(!inventorySummary?.items || inventorySummary.items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No inventory items found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default WarehouseDetailPage;
