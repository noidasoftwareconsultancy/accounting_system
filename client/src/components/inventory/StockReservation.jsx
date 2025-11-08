import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Button,
  CircularProgress
} from '@mui/material';
import { CheckCircle, Warning, Error as ErrorIcon } from '@mui/icons-material';
import integrationService from '../../services/integrationService';

const StockReservation = ({ invoiceId, items, onReserve, onRelease }) => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    checkAvailability();
  }, [items]);

  const checkAvailability = async () => {
    try {
      setLoading(true);
      const response = await integrationService.getStockAvailability(items);
      setAvailability(response.data.data);
    } catch (error) {
      console.error('Error checking availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    try {
      setReserving(true);
      await integrationService.reserveStock(invoiceId, items);
      onReserve?.();
    } catch (error) {
      console.error('Error reserving stock:', error);
    } finally {
      setReserving(false);
    }
  };

  const handleRelease = async () => {
    try {
      setReserving(true);
      await integrationService.releaseStock(invoiceId);
      onRelease?.();
    } catch (error) {
      console.error('Error releasing stock:', error);
    } finally {
      setReserving(false);
    }
  };

  const allAvailable = availability.every(item => item.available >= item.requested);
  const someUnavailable = availability.some(item => item.available < item.requested);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Stock Availability
      </Typography>

      {someUnavailable && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Some items have insufficient stock. Please adjust quantities or create backorders.
        </Alert>
      )}

      {allAvailable && (
        <Alert severity="success" sx={{ mb: 2 }}>
          All items are available in stock
        </Alert>
      )}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="right">Requested</TableCell>
              <TableCell align="right">Available</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {availability.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.product_name}</TableCell>
                <TableCell align="right">{item.requested}</TableCell>
                <TableCell align="right">{item.available}</TableCell>
                <TableCell>
                  {item.available >= item.requested ? (
                    <Chip
                      icon={<CheckCircle />}
                      label="Available"
                      size="small"
                      color="success"
                    />
                  ) : item.available > 0 ? (
                    <Chip
                      icon={<Warning />}
                      label="Partial"
                      size="small"
                      color="warning"
                    />
                  ) : (
                    <Chip
                      icon={<ErrorIcon />}
                      label="Out of Stock"
                      size="small"
                      color="error"
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={handleRelease}
          disabled={reserving}
        >
          Release Reservation
        </Button>
        <Button
          variant="contained"
          onClick={handleReserve}
          disabled={!allAvailable || reserving}
        >
          {reserving ? 'Reserving...' : 'Reserve Stock'}
        </Button>
      </Box>
    </Paper>
  );
};

export default StockReservation;
