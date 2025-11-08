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
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid
} from '@mui/material';
import { Autorenew, ShoppingCart } from '@mui/icons-material';
import integrationService from '../../services/integrationService';
import { useApp } from '../../contexts/AppContext';

const ReorderAutomation = () => {
  const { addNotification } = useApp();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [settings, setSettings] = useState({
    reorder_level: '',
    reorder_quantity: '',
    lead_time_days: '',
    preferred_vendor_id: ''
  });

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await integrationService.getReorderSuggestions();
      setSuggestions(response.data.data);
    } catch (error) {
      console.error('Error fetching reorder suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePOs = async () => {
    try {
      const response = await integrationService.generateReorderPOs();
      addNotification({
        type: 'success',
        title: 'Success',
        message: `Generated ${response.data.data.count} purchase orders`
      });
      fetchSuggestions();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to generate purchase orders'
      });
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await integrationService.updateReorderSettings(selectedProduct.id, settings);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Reorder settings updated'
      });
      setSettingsOpen(false);
      fetchSuggestions();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update settings'
      });
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            <Autorenew sx={{ mr: 1, verticalAlign: 'middle' }} />
            Reorder Automation
          </Typography>
          <Button
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={handleGeneratePOs}
            disabled={suggestions.length === 0}
          >
            Generate Purchase Orders
          </Button>
        </Box>

        {suggestions.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {suggestions.length} products are below reorder level
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Current Stock</TableCell>
                <TableCell align="right">Reorder Level</TableCell>
                <TableCell align="right">Suggested Quantity</TableCell>
                <TableCell>Preferred Vendor</TableCell>
                <TableCell>Lead Time</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suggestions.map((item) => (
                <TableRow key={item.product_id}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={item.current_stock}
                      size="small"
                      color="error"
                    />
                  </TableCell>
                  <TableCell align="right">{item.reorder_level}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={item.suggested_quantity}
                      size="small"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>{item.preferred_vendor || '-'}</TableCell>
                  <TableCell>{item.lead_time_days} days</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedProduct(item);
                        setSettings({
                          reorder_level: item.reorder_level,
                          reorder_quantity: item.suggested_quantity,
                          lead_time_days: item.lead_time_days,
                          preferred_vendor_id: item.preferred_vendor_id
                        });
                        setSettingsOpen(true);
                      }}
                    >
                      Settings
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {suggestions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" py={3}>
                      All products are above reorder level
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reorder Settings - {selectedProduct?.product_name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reorder Level"
                type="number"
                value={settings.reorder_level}
                onChange={(e) => setSettings({ ...settings, reorder_level: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reorder Quantity"
                type="number"
                value={settings.reorder_quantity}
                onChange={(e) => setSettings({ ...settings, reorder_quantity: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lead Time (days)"
                type="number"
                value={settings.lead_time_days}
                onChange={(e) => setSettings({ ...settings, lead_time_days: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateSettings} variant="contained">
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReorderAutomation;
