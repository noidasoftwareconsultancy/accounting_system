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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  CheckCircle,
  LocalShipping,
  Business,
  Phone,
  Email as EmailIcon,
  CalendarToday
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import purchaseOrderService from '../../services/purchaseOrderService';
import warehouseService from '../../services/warehouseService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PurchaseOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [receivedItems, setReceivedItems] = useState([]);

  useEffect(() => {
    fetchOrderDetails();
    fetchWarehouses();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderService.getPurchaseOrderById(id);
      setOrder(response.data.data);
      // Initialize received items
      if (response.data.data.items) {
        setReceivedItems(response.data.data.items.map(item => ({
          item_id: item.id,
          product_id: item.product_id,
          quantity_received: item.quantity - item.quantity_received,
          unit_cost: parseFloat(item.unit_price)
        })));
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch purchase order details'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await warehouseService.getAllWarehouses({ limit: 100 });
      setWarehouses(response.data.data.warehouses);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const handleReceiveOrder = () => {
    setReceiveDialogOpen(true);
  };

  const handleConfirmReceive = async () => {
    try {
      if (!selectedWarehouse) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Please select a warehouse'
        });
        return;
      }

      await purchaseOrderService.receivePurchaseOrder(id, {
        received_items: receivedItems.filter(item => item.quantity_received > 0),
        warehouse_id: selectedWarehouse
      });

      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Purchase order received successfully'
      });
      setReceiveDialogOpen(false);
      fetchOrderDetails();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to receive purchase order'
      });
    }
  };

  const updateReceivedQuantity = (itemId, quantity) => {
    setReceivedItems(prev =>
      prev.map(item =>
        item.item_id === itemId
          ? { ...item, quantity_received: parseInt(quantity) || 0 }
          : item
      )
    );
  };

  const getStatusColor = (status) => {
    const statusColors = {
      draft: 'default',
      sent: 'info',
      confirmed: 'primary',
      received: 'success',
      cancelled: 'error'
    };
    return statusColors[status] || 'default';
  };

  if (loading) {
    return <LoadingSpinner message="Loading purchase order..." />;
  }

  if (!order) {
    return (
      <Box p={3}>
        <Typography>Purchase order not found</Typography>
      </Box>
    );
  }

  const canReceive = ['confirmed', 'sent'].includes(order.status);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/inventory/purchase-orders')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4">{order.po_number}</Typography>
            <Chip
              label={order.status}
              size="small"
              color={getStatusColor(order.status)}
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>
        <Box>
          {order.status === 'draft' && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate(`/inventory/purchase-orders/${id}/edit`)}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
          )}
          {canReceive && (
            <Button
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={handleReceiveOrder}
            >
              Receive Order
            </Button>
          )}
        </Box>
      </Box>

      {/* Order Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2" gutterBottom>
                Subtotal
              </Typography>
              <Typography variant="h4">
                ${parseFloat(order.subtotal).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2" gutterBottom>
                Tax & Shipping
              </Typography>
              <Typography variant="h4">
                ${(parseFloat(order.tax_amount) + parseFloat(order.shipping_cost)).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2" gutterBottom>
                Total Amount
              </Typography>
              <Typography variant="h4" color="primary">
                ${parseFloat(order.total_amount).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Order Details */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Vendor Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Business fontSize="small" color="action" />
              <Typography variant="body1" fontWeight="medium">
                {order.vendor?.name}
              </Typography>
            </Box>
            {order.vendor?.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2">{order.vendor.email}</Typography>
              </Box>
            )}
            {order.vendor?.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Phone fontSize="small" color="action" />
                <Typography variant="body2">{order.vendor.phone}</Typography>
              </Box>
            )}
            {order.vendor?.address && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                {order.vendor.address}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Order Date
                </Typography>
                <Typography variant="body1">
                  {new Date(order.order_date).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Expected Date
                </Typography>
                <Typography variant="body1">
                  {order.expected_date
                    ? new Date(order.expected_date).toLocaleDateString()
                    : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Payment Terms
                </Typography>
                <Typography variant="body1">
                  {order.payment_terms} days
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Currency
                </Typography>
                <Typography variant="body1">
                  {order.currency}
                </Typography>
              </Grid>
              {order.received_date && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Received Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(order.received_date).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Order Items */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Items
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Received</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Tax</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Typography variant="body2">
                      {item.product?.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={item.product?.sku} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={item.quantity_received}
                      size="small"
                      color={item.quantity_received === item.quantity ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    ${parseFloat(item.unit_price).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    ${parseFloat(item.tax_amount).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      ${parseFloat(item.total_amount).toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {order.notes && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Notes
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {order.notes}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Receive Order Dialog */}
      <Dialog
        open={receiveDialogOpen}
        onClose={() => setReceiveDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Receive Purchase Order</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Enter the quantities received for each item. Stock will be added to the selected warehouse.
            </Alert>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Warehouse</InputLabel>
              <Select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                label="Warehouse"
                required
              >
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Ordered</TableCell>
                    <TableCell align="right">Previously Received</TableCell>
                    <TableCell align="right">Receive Now</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items?.map((item, index) => {
                    const receivedItem = receivedItems.find(ri => ri.item_id === item.id);
                    const remaining = item.quantity - item.quantity_received;

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="body2">
                            {item.product?.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{item.quantity_received}</TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={receivedItem?.quantity_received || 0}
                            onChange={(e) => updateReceivedQuantity(item.id, e.target.value)}
                            inputProps={{ min: 0, max: remaining }}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmReceive}
            variant="contained"
            disabled={!selectedWarehouse || receivedItems.every(item => item.quantity_received === 0)}
          >
            Confirm Receipt
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchaseOrderDetailPage;
