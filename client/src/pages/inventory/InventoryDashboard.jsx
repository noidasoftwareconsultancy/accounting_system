import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warehouse as WarehouseIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as PurchaseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import inventoryService from '../../services/inventoryService';
import purchaseOrderService from '../../services/purchaseOrderService';

const StatCard = ({ title, value, icon, color, subtitle, onClick }) => (
  <Card 
    sx={{ 
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': onClick ? { boxShadow: 6 } : {}
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ mb: 1 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}.light`,
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const InventoryDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [poStats, setPoStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [inventoryStatsRes, lowStockRes, poStatsRes] = await Promise.all([
        inventoryService.getInventoryStats(),
        inventoryService.getLowStockItems(),
        purchaseOrderService.getStats()
      ]);

      setStats(inventoryStatsRes.data.data);
      setLowStockItems(lowStockRes.data.data);
      setPoStats(poStatsRes.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Inventory Dashboard
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/inventory/products/new')}
            sx={{ mr: 1 }}
          >
            Add Product
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/inventory/purchase-orders/new')}
          >
            New Purchase Order
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={stats?.total_products || 0}
            icon={<InventoryIcon sx={{ color: 'primary.main', fontSize: 32 }} />}
            color="primary"
            onClick={() => navigate('/inventory/products')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Warehouses"
            value={stats?.total_warehouses || 0}
            icon={<WarehouseIcon sx={{ color: 'info.main', fontSize: 32 }} />}
            color="info"
            onClick={() => navigate('/inventory/warehouses')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Items"
            value={stats?.low_stock_items || 0}
            icon={<WarningIcon sx={{ color: 'warning.main', fontSize: 32 }} />}
            color="warning"
            subtitle={stats?.low_stock_items > 0 ? 'Needs attention' : 'All good'}
            onClick={() => navigate('/inventory/stock?filter=low')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Inventory Value"
            value={`$${(stats?.total_inventory_value || 0).toLocaleString()}`}
            icon={<TrendingUpIcon sx={{ color: 'success.main', fontSize: 32 }} />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Purchase Order Stats */}
      {poStats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Total Purchase Orders"
              value={poStats.total_orders || 0}
              icon={<PurchaseIcon sx={{ color: 'secondary.main', fontSize: 32 }} />}
              color="secondary"
              onClick={() => navigate('/inventory/purchase-orders')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Pending Orders"
              value={poStats.pending_orders || 0}
              icon={<PurchaseIcon sx={{ color: 'warning.main', fontSize: 32 }} />}
              color="warning"
              subtitle="Awaiting receipt"
              onClick={() => navigate('/inventory/purchase-orders?status=pending')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="PO Total Value"
              value={`$${(poStats.total_value || 0).toLocaleString()}`}
              icon={<TrendingUpIcon sx={{ color: 'info.main', fontSize: 32 }} />}
              color="info"
            />
          </Grid>
        </Grid>
      )}

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" component="h2">
                Low Stock Alerts
              </Typography>
              <Button
                size="small"
                onClick={() => navigate('/inventory/reports?report=reorder')}
              >
                View Reorder Report
              </Button>
            </Box>
            <Grid container spacing={2}>
              {lowStockItems.slice(0, 6).map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        {item.product_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        SKU: {item.sku}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                        <Chip
                          label={`Stock: ${item.quantity_available}`}
                          size="small"
                          color="warning"
                        />
                        <Typography variant="caption" color="textSecondary">
                          Reorder: {item.reorder_level}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {lowStockItems.length > 6 && (
              <Box mt={2} textAlign="center">
                <Button
                  variant="text"
                  onClick={() => navigate('/inventory/stock?filter=low')}
                >
                  View All {lowStockItems.length} Low Stock Items
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/inventory/products/new')}
              >
                Add Product
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/inventory/purchase-orders/new')}
              >
                Create Purchase Order
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/inventory/transfers/new')}
              >
                Stock Transfer
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/inventory/adjustments/new')}
              >
                Stock Adjustment
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InventoryDashboard;
