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
  InputAdornment,
  Divider,
  Alert
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Search,
  ShoppingCart,
  LocalShipping,
  CheckCircle,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import purchaseOrderService from '../../services/purchaseOrderService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const PurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addNotification } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [page, rowsPerPage, searchTerm, statusFilter]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter || undefined
      };
      const response = await purchaseOrderService.getAllPurchaseOrders(params);
      setOrders(response.data.data.orders);
      setTotalCount(response.data.data.pagination.total);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch purchase orders'
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, statusFilter, addNotification]);

  const fetchStats = async () => {
    try {
      const response = await purchaseOrderService.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleMenuClick = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await purchaseOrderService.deletePurchaseOrder(selectedOrder.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Purchase order deleted successfully'
      });
      fetchOrders();
      fetchStats();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete purchase order'
      });
    }
    setDeleteDialogOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  const getStatusIcon = (status) => {
    const icons = {
      draft: <Edit fontSize="small" />,
      sent: <LocalShipping fontSize="small" />,
      confirmed: <CheckCircle fontSize="small" />,
      received: <CheckCircle fontSize="small" />,
      cancelled: <CancelIcon fontSize="small" />
    };
    return icons[status];
  };

  if (loading && orders.length === 0) {
    return <LoadingSpinner message="Loading purchase orders..." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Purchase Orders
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/inventory/purchase-orders/new')}
        >
          Create Purchase Order
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <ShoppingCart />
                  </Avatar>
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Total Orders
                    </Typography>
                    <Typography variant="h4">
                      {stats.total_orders}
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
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <LocalShipping />
                  </Avatar>
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Pending Orders
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {stats.pending_orders}
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
                    $
                  </Avatar>
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Total Value
                    </Typography>
                    <Typography variant="h4">
                      ${(stats.total_value || 0).toLocaleString()}
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
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search by PO number or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="received">Received</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Purchase Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>PO Number</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Expected Date</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="medium">
                    {order.po_number}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {order.vendor?.name}
                    </Typography>
                    {order.vendor?.email && (
                      <Typography variant="caption" color="textSecondary">
                        {order.vendor.email}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  {new Date(order.order_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {order.expected_date
                    ? new Date(order.expected_date).toLocaleDateString()
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${order.items?.length || 0} items`}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    ${parseFloat(order.total_amount).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {order.currency}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    size="small"
                    color={getStatusColor(order.status)}
                    icon={getStatusIcon(order.status)}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={(e) => handleMenuClick(e, order)}>
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="textSecondary" py={3}>
                    No purchase orders found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
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
          navigate(`/inventory/purchase-orders/${selectedOrder?.id}`);
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {selectedOrder?.status === 'draft' && (
          <MenuItem onClick={() => {
            navigate(`/inventory/purchase-orders/${selectedOrder?.id}/edit`);
            handleMenuClose();
          }}>
            <Edit sx={{ mr: 1 }} />
            Edit
          </MenuItem>
        )}
        {['confirmed', 'sent'].includes(selectedOrder?.status) && (
          <MenuItem onClick={() => {
            navigate(`/inventory/purchase-orders/${selectedOrder?.id}/receive`);
            handleMenuClose();
          }}>
            <CheckCircle sx={{ mr: 1 }} />
            Receive Order
          </MenuItem>
        )}
        {selectedOrder?.status === 'draft' && (
          <MenuItem onClick={handleDeleteClick}>
            <Delete sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Purchase Order"
        message={`Are you sure you want to delete PO "${selectedOrder?.po_number}"? This action cannot be undone.`}
        confirmText="Delete"
        severity="error"
      />
    </Box>
  );
};

export default PurchaseOrdersPage;
