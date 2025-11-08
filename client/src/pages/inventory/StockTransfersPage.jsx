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
  FormControl,
  InputLabel,
  Select,
  Alert
} from '@mui/material';
import {
  Add,
  MoreVert,
  Visibility,
  Delete,
  Search,
  SwapHoriz,
  CheckCircle,
  Cancel as CancelIcon,
  LocalShipping
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import stockTransferService from '../../services/stockTransferService';
import warehouseService from '../../services/warehouseService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const StockTransfersPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addNotification } = useApp();
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchTransfers();
    fetchWarehouses();
  }, [page, rowsPerPage, searchTerm, statusFilter, warehouseFilter]);

  const fetchTransfers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter || undefined,
        warehouse_id: warehouseFilter || undefined
      };
      const response = await stockTransferService.getAllTransfers(params);
      setTransfers(response.data.data.transfers);
      setTotalCount(response.data.data.pagination.total);
    } catch (error) {
      console.error('Error fetching stock transfers:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch stock transfers'
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, statusFilter, warehouseFilter, addNotification]);

  const fetchWarehouses = async () => {
    try {
      const response = await warehouseService.getAllWarehouses({ limit: 100 });
      setWarehouses(response.data.data.warehouses);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const handleMenuClick = (event, transfer) => {
    setAnchorEl(event.currentTarget);
    setSelectedTransfer(transfer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTransfer(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await stockTransferService.deleteTransfer(selectedTransfer.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Stock transfer deleted successfully'
      });
      fetchTransfers();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete stock transfer'
      });
    }
    setDeleteDialogOpen(false);
  };

  const handleProcessTransfer = async (transfer) => {
    try {
      await stockTransferService.processTransfer(transfer.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Stock transfer processed successfully'
      });
      fetchTransfers();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to process stock transfer'
      });
    }
    handleMenuClose();
  };

  const handleCancelTransfer = async (transfer) => {
    try {
      await stockTransferService.cancelTransfer(transfer.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Stock transfer cancelled successfully'
      });
      fetchTransfers();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to cancel stock transfer'
      });
    }
    handleMenuClose();
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
      pending: 'warning',
      in_transit: 'info',
      completed: 'success',
      cancelled: 'error'
    };
    return statusColors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: <MoreVert fontSize="small" />,
      pending: <LocalShipping fontSize="small" />,
      in_transit: <LocalShipping fontSize="small" />,
      completed: <CheckCircle fontSize="small" />,
      cancelled: <CancelIcon fontSize="small" />
    };
    return icons[status];
  };

  if (loading && transfers.length === 0) {
    return <LoadingSpinner message="Loading stock transfers..." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Stock Transfers
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/inventory/transfers/new')}
        >
          Create Transfer
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <SwapHoriz />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Transfers
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
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <LocalShipping />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    In Transit
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {transfers.filter(t => t.status === 'in_transit').length}
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
                  <LocalShipping />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Pending
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {transfers.filter(t => t.status === 'pending').length}
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
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Completed
                  </Typography>
                  <Typography variant="h4">
                    {transfers.filter(t => t.status === 'completed').length}
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
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by transfer number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_transit">In Transit</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
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
        </Grid>
      </Paper>

      {/* Stock Transfers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transfer Number</TableCell>
              <TableCell>From Warehouse</TableCell>
              <TableCell>To Warehouse</TableCell>
              <TableCell>Transfer Date</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transfers.map((transfer) => (
              <TableRow key={transfer.id} hover>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="medium">
                    {transfer.transfer_number}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {transfer.from_warehouse?.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {transfer.to_warehouse?.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  {new Date(transfer.transfer_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${transfer.items?.length || 0} items`}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={transfer.status.replace('_', ' ')}
                    size="small"
                    color={getStatusColor(transfer.status)}
                    icon={getStatusIcon(transfer.status)}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={(e) => handleMenuClick(e, transfer)}>
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {transfers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="textSecondary" py={3}>
                    No stock transfers found
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
          navigate(`/inventory/stock-transfers/${selectedTransfer?.id}`);
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {selectedTransfer?.status === 'pending' && (
          <MenuItem onClick={() => handleProcessTransfer(selectedTransfer)}>
            <LocalShipping sx={{ mr: 1 }} />
            Process Transfer
          </MenuItem>
        )}
        {['draft', 'pending'].includes(selectedTransfer?.status) && (
          <MenuItem onClick={() => handleCancelTransfer(selectedTransfer)}>
            <CancelIcon sx={{ mr: 1 }} />
            Cancel Transfer
          </MenuItem>
        )}
        {selectedTransfer?.status === 'draft' && (
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
        title="Delete Stock Transfer"
        message={`Are you sure you want to delete transfer "${selectedTransfer?.transfer_number}"? This action cannot be undone.`}
        confirmText="Delete"
        severity="error"
      />
    </Box>
  );
};

export default StockTransfersPage;
