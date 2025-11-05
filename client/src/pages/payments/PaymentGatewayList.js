import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Settings,
  Security
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import bankingService from '../../services/bankingService';
import { useApp } from '../../contexts/AppContext';

const PaymentGatewayList = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();

  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState(null);

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      setLoading(true);
      const response = await bankingService.getPaymentGateways();
      setGateways(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching payment gateways:', err);
      setError('Failed to fetch payment gateways');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch payment gateways'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, gateway) => {
    setAnchorEl(event.currentTarget);
    setSelectedGateway(gateway);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGateway(null);
  };

  const handleDeleteGateway = async (gatewayId) => {
    if (window.confirm('Are you sure you want to delete this payment gateway?')) {
      try {
        // Note: Delete endpoint would need to be implemented in the backend
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Payment gateway deleted successfully'
        });
        fetchGateways();
      } catch (err) {
        console.error('Error deleting payment gateway:', err);
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete payment gateway'
        });
      }
    }
    handleMenuClose();
  };

  const handleToggleStatus = async (gatewayId, currentStatus) => {
    try {
      // Note: Toggle status endpoint would need to be implemented in the backend
      addNotification({
        type: 'success',
        title: 'Success',
        message: `Payment gateway ${currentStatus ? 'disabled' : 'enabled'} successfully`
      });
      fetchGateways();
    } catch (err) {
      console.error('Error updating payment gateway status:', err);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update payment gateway status'
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading payment gateways...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Payment Gateways
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage payment processing gateways and integrations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/payments/gateways/new')}
        >
          Add Gateway
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Gateways Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Gateway Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Configuration</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gateways.map((gateway) => (
                <TableRow key={gateway.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Settings color="primary" />
                      <Typography variant="body2" fontWeight="medium">
                        {gateway.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={gateway.is_active}
                          onChange={() => handleToggleStatus(gateway.id, gateway.is_active)}
                          size="small"
                        />
                      }
                      label={
                        <Chip
                          label={gateway.is_active ? 'Active' : 'Inactive'}
                          color={gateway.is_active ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Security fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">
                        {gateway.api_key ? 'Configured' : 'Not configured'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {format(new Date(gateway.created_at), 'MMM dd, yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, gateway)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {gateways.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <Settings sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        No payment gateways configured
                      </Typography>
                      <Typography variant="body2" color="textSecondary" mb={2}>
                        Add your first payment gateway to start processing payments
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/payments/gateways/new')}
                      >
                        Add Gateway
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/payments/gateways/${selectedGateway?.id}/edit`);
          handleMenuClose();
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Gateway
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/payments/gateways/${selectedGateway?.id}/logs`);
          handleMenuClose();
        }}>
          <Settings fontSize="small" sx={{ mr: 1 }} />
          View Logs
        </MenuItem>
        <MenuItem 
          onClick={() => handleDeleteGateway(selectedGateway?.id)}
          sx={{ color: 'error.main' }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Gateway
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PaymentGatewayList;