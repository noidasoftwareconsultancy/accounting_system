import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Card,
  CardContent,
  Alert,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import { 
  Add, 
  Delete, 
  Save, 
  Cancel, 
  ArrowBack,
  Receipt,
  Business,
  Description
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate, useParams } from 'react-router-dom';
import invoiceService from '../../services/invoiceService';
import clientService from '../../services/clientService';
import projectService from '../../services/projectService';
import { useApp } from '../../contexts/AppContext';

const InvoiceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { addNotification } = useApp();
  
  const isEdit = Boolean(id);

  // State management
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    client_id: '',
    project_id: '',
    issue_date: new Date(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    notes: '',
    items: [
      { description: '', quantity: 1, unit_price: 0, tax_rate: 0 }
    ]
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      loadInvoice();
    }
  }, [id, isEdit]);

  const loadInitialData = async () => {
    try {
      const [clientsResponse, projectsResponse] = await Promise.all([
        clientService.getClients({ limit: 100 }),
        projectService.getProjects({ limit: 100 })
      ]);
      
      setClients(clientsResponse.data?.clients || []);
      setProjects(projectsResponse.data?.projects || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load form data'
      });
    }
  };

  const loadInvoice = async () => {
    try {
      setLoadingData(true);
      const response = await invoiceService.getInvoice(id);
      const invoice = response.data;
      
      setFormData({
        client_id: invoice.client_id || '',
        project_id: invoice.project_id || '',
        issue_date: invoice.issue_date ? new Date(invoice.issue_date) : new Date(),
        due_date: invoice.due_date ? new Date(invoice.due_date) : new Date(),
        notes: invoice.notes || '',
        items: invoice.items?.length > 0 ? invoice.items.map(item => ({
          description: item.description || '',
          quantity: parseFloat(item.quantity) || 1,
          unit_price: parseFloat(item.unit_price) || 0,
          tax_rate: parseFloat(item.tax_rate) || 0
        })) : [{ description: '', quantity: 1, unit_price: 0, tax_rate: 0 }]
      });
    } catch (error) {
      console.error('Error loading invoice:', error);
      setError('Failed to load invoice data');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load invoice data'
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.client_id) {
      setError('Client is required');
      return;
    }
    if (!formData.issue_date) {
      setError('Issue date is required');
      return;
    }
    if (!formData.due_date) {
      setError('Due date is required');
      return;
    }
    if (formData.items.length === 0 || !formData.items.some(item => item.description.trim())) {
      setError('At least one item with description is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { subtotal, totalTax, total } = calculateTotals();
      
      const invoiceData = {
        ...formData,
        issue_date: formData.issue_date.toISOString().split('T')[0],
        due_date: formData.due_date.toISOString().split('T')[0],
        amount: subtotal,
        tax_amount: totalTax,
        total_amount: total,
        items: formData.items.filter(item => item.description.trim()) // Only include items with descriptions
      };

      if (isEdit) {
        await invoiceService.updateInvoice(id, invoiceData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Invoice updated successfully'
        });
      } else {
        await invoiceService.createInvoice(invoiceData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Invoice created successfully'
        });
      }

      navigate('/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      setError(isEdit ? 'Failed to update invoice' : 'Failed to create invoice');
      addNotification({
        type: 'error',
        title: 'Error',
        message: isEdit ? 'Failed to update invoice' : 'Failed to create invoice'
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit_price: 0, tax_rate: 0 }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const calculateItemAmount = (item) => {
    return (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
  };

  const calculateItemTax = (item) => {
    const amount = calculateItemAmount(item);
    return amount * ((parseFloat(item.tax_rate) || 0) / 100);
  };

  const calculateItemTotal = (item) => {
    const subtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
    const tax = subtotal * ((parseFloat(item.tax_rate) || 0) / 100);
    return subtotal + tax;
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      return sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0));
    }, 0);
    
    const totalTax = formData.items.reduce((sum, item) => {
      const itemSubtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
      return sum + (itemSubtotal * ((parseFloat(item.tax_rate) || 0) / 100));
    }, 0);
    
    const total = subtotal + totalTax;
    return { subtotal, totalTax, total };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loadingData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEdit ? 'Edit Invoice' : 'Create Invoice'}
        </Typography>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Box sx={{ height: 56, backgroundColor: 'grey.200', borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
        </Paper>
        <Box sx={{ height: 300, backgroundColor: 'grey.200', borderRadius: 2 }} />
      </Box>
    );
  }

  const { subtotal, totalTax, total } = calculateTotals();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/invoices')}
          sx={{ color: 'text.secondary' }}
        >
          Back to Invoices
        </Button>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {isEdit ? 'Edit Invoice' : 'Create New Invoice'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {isEdit ? 'Update invoice information and items' : 'Create a new invoice for your client'}
          </Typography>
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Invoice Details */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Receipt color="primary" />
                  Invoice Details
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Client"
                      value={formData.client_id}
                      onChange={(e) => handleInputChange('client_id', e.target.value)}
                      required
                    >
                      {clients.map((client) => (
                        <MenuItem key={client.id} value={client.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Business fontSize="small" color="action" />
                            {client.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Project (Optional)"
                      value={formData.project_id}
                      onChange={(e) => handleInputChange('project_id', e.target.value)}
                    >
                      <MenuItem value="">None</MenuItem>
                      {projects.map((project) => (
                        <MenuItem key={project.id} value={project.id}>
                          {project.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Issue Date"
                      value={formData.issue_date}
                      onChange={(date) => handleInputChange('issue_date', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Due Date"
                      value={formData.due_date}
                      onChange={(date) => handleInputChange('due_date', date)}
                      minDate={formData.issue_date}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Additional notes or terms for this invoice"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Invoice Items */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Description color="primary" />
                    Invoice Items
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={addItem}
                    sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
                  >
                    Add Item
                  </Button>
                </Box>

                <TableContainer component={Paper} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                        <TableCell width="100px" sx={{ fontWeight: 600 }}>Quantity</TableCell>
                        <TableCell width="120px" sx={{ fontWeight: 600 }}>Unit Price</TableCell>
                        <TableCell width="100px" sx={{ fontWeight: 600 }}>Tax Rate (%)</TableCell>
                        <TableCell width="120px" sx={{ fontWeight: 600 }}>Total</TableCell>
                        <TableCell width="60px" align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.items.map((item, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <TextField
                              fullWidth
                              placeholder="Item description"
                              value={item.description}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              size="small"
                              inputProps={{ min: 0, step: 0.01 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={item.unit_price}
                              onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              size="small"
                              inputProps={{ min: 0, step: 0.01 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={item.tax_rate}
                              onChange={(e) => updateItem(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                              size="small"
                              inputProps={{ min: 0, max: 100, step: 0.01 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              {formatCurrency(calculateItemTotal(item))}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              onClick={() => removeItem(index)}
                              disabled={formData.items.length === 1}
                              size="small"
                              sx={{ color: 'error.main' }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Totals */}
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${theme.palette.divider}`, pt: 3 }}>
                  <Box sx={{ minWidth: 300 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Subtotal:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatCurrency(subtotal)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Tax:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatCurrency(totalTax)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Total:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {formatCurrency(total)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/invoices')}
                startIcon={<Cancel />}
                sx={{ borderRadius: 2, px: 3, py: 1.5, fontWeight: 600 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={loading}
                sx={{ borderRadius: 2, px: 4, py: 1.5, fontWeight: 600 }}
              >
                {loading ? 'Saving...' : (isEdit ? 'Update Invoice' : 'Create Invoice')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default InvoiceForm;