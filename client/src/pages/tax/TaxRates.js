import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import taxService from '../../services/taxService';
import { usePermissions } from '../../utils/permissions';

const TaxRates = () => {
  const { canManage } = usePermissions();
  const [taxRates, setTaxRates] = useState([]);
  const [taxTypes, setTaxTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState(null);
  const [taxRateForm, setTaxRateForm] = useState({
    name: '',
    rate: '',
    type: '',
    is_active: true
  });

  useEffect(() => {
    loadTaxRates();
    loadTaxTypes();
  }, [page, rowsPerPage]);

  const loadTaxRates = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await taxService.getTaxRates({
        page: page + 1,
        limit: rowsPerPage
      });

      setTaxRates(response.data?.taxRates || []);
      setTotalCount(response.data?.pagination?.total || 0);
    } catch (err) {
      console.error('Load tax rates error:', err);
      setError(err.response?.data?.message || 'Failed to load tax rates');
    } finally {
      setLoading(false);
    }
  };

  const loadTaxTypes = async () => {
    try {
      const response = await taxService.getTaxTypes();
      setTaxTypes(response.data || []);
    } catch (err) {
      console.error('Load tax types error:', err);
    }
  };

  const handleCreateTaxRate = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      const taxRateData = {
        ...taxRateForm,
        rate: parseFloat(taxRateForm.rate)
      };

      if (editingTaxRate) {
        await taxService.updateTaxRate(editingTaxRate.id, taxRateData);
        setSuccess('Tax rate updated successfully');
      } else {
        await taxService.createTaxRate(taxRateData);
        setSuccess('Tax rate created successfully');
      }
      
      handleCloseDialog();
      loadTaxRates();
    } catch (err) {
      console.error('Tax rate save error:', err);
      if (err.response?.data?.errors) {
        setError(`Validation errors: ${err.response.data.errors.map(e => e.msg).join(', ')}`);
      } else {
        setError(err.response?.data?.message || 'Failed to save tax rate');
      }
    }
  };

  const handleEditTaxRate = (taxRate) => {
    setEditingTaxRate(taxRate);
    setTaxRateForm({
      name: taxRate.name,
      rate: taxRate.rate.toString(),
      type: taxRate.type,
      is_active: taxRate.is_active
    });
    setOpenDialog(true);
  };

  const handleDeleteTaxRate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tax rate?')) {
      return;
    }

    try {
      setError('');
      await taxService.deleteTaxRate(id);
      setSuccess('Tax rate deleted successfully');
      loadTaxRates();
    } catch (err) {
      console.error('Delete tax rate error:', err);
      setError(err.response?.data?.message || 'Failed to delete tax rate');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTaxRate(null);
    setTaxRateForm({
      name: '',
      rate: '',
      type: '',
      is_active: true
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tax Rates
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={loadTaxRates}
            disabled={loading}
          >
            Refresh
          </Button>
          {canManage && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Add Tax Rate
            </Button>
          )}
        </Box>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Rate (%)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Records</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created At</TableCell>
                {canManage && <TableCell align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 8 : 7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : taxRates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 8 : 7} align="center">
                    No tax rates found
                  </TableCell>
                </TableRow>
              ) : (
                taxRates.map((taxRate) => (
                  <TableRow key={taxRate.id}>
                    <TableCell>{taxRate.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={taxRate.type} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {taxService.formatPercentage(taxRate.rate)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={taxRate.is_active ? 'Active' : 'Inactive'} 
                        size="small" 
                        color={taxRate.is_active ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {taxRate._count?.tax_records || 0}
                    </TableCell>
                    <TableCell>
                      {taxRate.creator ? 
                        `${taxRate.creator.first_name} ${taxRate.creator.last_name}` : 
                        'Unknown'
                      }
                    </TableCell>
                    <TableCell>
                      {taxService.formatDate(taxRate.created_at)}
                    </TableCell>
                    {canManage && (
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditTaxRate(taxRate)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTaxRate(taxRate.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Tax Rate Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleCreateTaxRate}>
          <DialogTitle>
            {editingTaxRate ? 'Edit Tax Rate' : 'Add Tax Rate'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                fullWidth
                label="Tax Name"
                value={taxRateForm.name}
                onChange={(e) => setTaxRateForm({ ...taxRateForm, name: e.target.value })}
                required
              />
              
              <FormControl fullWidth required>
                <InputLabel>Tax Type</InputLabel>
                <Select
                  value={taxRateForm.type}
                  label="Tax Type"
                  onChange={(e) => setTaxRateForm({ ...taxRateForm, type: e.target.value })}
                >
                  {taxTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Tax Rate (%)"
                type="number"
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                value={taxRateForm.rate}
                onChange={(e) => setTaxRateForm({ ...taxRateForm, rate: e.target.value })}
                required
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={taxRateForm.is_active}
                    onChange={(e) => setTaxRateForm({ ...taxRateForm, is_active: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingTaxRate ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaxRates;