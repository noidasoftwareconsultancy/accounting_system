import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  IconButton,
  MenuItem,
  InputAdornment,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme
} from '@mui/material';
import {
  Add,
  Delete,
  Save,
  ArrowBack,
  Send,
  AttachFile,
  Receipt,
  CalendarToday
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useNavigate, useParams } from 'react-router-dom';

const InvoiceForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  // Form state
  const [invoice, setInvoice] = useState({
    id: '',
    client: null,
    issueDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    status: 'draft',
    notes: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    total: 0
  });

  // Mock clients data
  const [clients, setClients] = useState([
    { id: 1, name: 'Acme Corporation', email: 'billing@acmecorp.com', address: '123 Main St, New York, NY 10001' },
    { id: 2, name: 'Globex Industries', email: 'accounts@globex.com', address: '456 Park Ave, Chicago, IL 60601' },
    { id: 3, name: 'Wayne Enterprises', email: 'finance@wayne.com', address: '789 Gotham Rd, Gotham City, NJ 07001' },
    { id: 4, name: 'Stark Industries', email: 'accounting@stark.com', address: '1 Stark Tower, Malibu, CA 90265' },
    { id: 5, name: 'Umbrella Corporation', email: 'finance@umbrella.com', address: '200 Raccoon St, Raccoon City, WA 98001' }
  ]);

  // Dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    if (isEditing) {
      // In a real app, fetch invoice data from API
      // For now, use mock data
      const mockInvoice = {
        id: 'INV-2023-001',
        client: clients[0],
        issueDate: new Date('2023-06-01'),
        dueDate: new Date('2023-06-15'),
        status: 'draft',
        notes: 'Payment due within 15 days. Please include invoice number with payment.',
        items: [
          { description: 'Web Development Services', quantity: 40, unitPrice: 100, amount: 4000 },
          { description: 'UI/UX Design', quantity: 20, unitPrice: 120, amount: 2400 },
          { description: 'Server Maintenance', quantity: 10, unitPrice: 80, amount: 800 }
        ],
        subtotal: 7200,
        taxRate: 8,
        taxAmount: 576,
        total: 7776
      };
      setInvoice(mockInvoice);
    } else {
      // Generate a new invoice ID
      setInvoice(prev => ({
        ...prev,
        id: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
      }));
    }
  }, [isEditing]);

  // Calculate totals whenever items change
  useEffect(() => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (invoice.taxRate / 100);
    const total = subtotal + taxAmount;

    setInvoice(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total
    }));
  }, [invoice.items, invoice.taxRate]);

  const handleClientChange = (event, newValue) => {
    setInvoice(prev => ({ ...prev, client: newValue }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoice(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setInvoice(prev => ({ ...prev, [name]: date }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoice.items];
    updatedItems[index][field] = value;
    
    // Recalculate amount
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setInvoice(prev => ({ ...prev, items: updatedItems }));
  };

  const handleAddItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]
    }));
  };

  const handleRemoveItem = (index) => {
    const updatedItems = invoice.items.filter((_, i) => i !== index);
    setInvoice(prev => ({ ...prev, items: updatedItems }));
  };

  const handleSaveDraft = () => {
    console.log('Saving draft:', invoice);
    // In a real app, save to API
    navigate('/invoices');
  };

  const handleSendInvoice = () => {
    setConfirmDialogOpen(true);
  };

  const confirmSendInvoice = () => {
    console.log('Sending invoice:', invoice);
    // In a real app, send to API and email to client
    setConfirmDialogOpen(false);
    navigate('/invoices');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate('/invoices')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Save />}
            onClick={handleSaveDraft}
          >
            Save as Draft
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Send />}
            onClick={handleSendInvoice}
            sx={{
              fontWeight: 'bold',
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              }
            }}
          >
            {isEditing ? 'Update & Send' : 'Save & Send'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Invoice Details */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Invoice Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Invoice Number"
                    name="id"
                    value={invoice.id}
                    onChange={handleInputChange}
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Receipt fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    fullWidth
                    options={clients}
                    getOptionLabel={(option) => option.name}
                    value={invoice.client}
                    onChange={handleClientChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Client"
                        variant="outlined"
                        margin="normal"
                        required
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Issue Date"
                      value={invoice.issueDate}
                      onChange={(date) => handleDateChange('issueDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                      slotProps={{
                        textField: { 
                          fullWidth: true, 
                          margin: "normal",
                          InputProps: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarToday fontSize="small" />
                              </InputAdornment>
                            ),
                          }
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Due Date"
                      value={invoice.dueDate}
                      onChange={(date) => handleDateChange('dueDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                      slotProps={{
                        textField: { 
                          fullWidth: true, 
                          margin: "normal",
                          InputProps: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarToday fontSize="small" />
                              </InputAdornment>
                            ),
                          }
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    name="status"
                    value={invoice.status}
                    onChange={handleInputChange}
                    variant="outlined"
                    margin="normal"
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="overdue">Overdue</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card elevation={0} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Invoice Items
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Add />}
                  onClick={handleAddItem}
                  size="small"
                >
                  Add Item
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <TableContainer component={Paper} elevation={0} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width="40%">Description</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            fullWidth
                            placeholder="Item description"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            variant="outlined"
                            size="small"
                            InputProps={{ inputProps: { min: 1 } }}
                            sx={{ width: '80px' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                            variant="outlined"
                            size="small"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                              inputProps: { min: 0, step: 0.01 }
                            }}
                            sx={{ width: '120px' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            color="error" 
                            onClick={() => handleRemoveItem(index)}
                            disabled={invoice.items.length === 1}
                            size="small"
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
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                <Box sx={{ display: 'flex', width: '300px', justifyContent: 'space-between' }}>
                  <Typography variant="body1">Subtotal:</Typography>
                  <Typography variant="body1" fontWeight="medium">{formatCurrency(invoice.subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', width: '300px', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">Tax Rate:</Typography>
                  <TextField
                    type="number"
                    value={invoice.taxRate}
                    onChange={(e) => setInvoice(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      inputProps: { min: 0, max: 100, step: 0.1 }
                    }}
                    sx={{ width: '100px' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', width: '300px', justifyContent: 'space-between' }}>
                  <Typography variant="body1">Tax Amount:</Typography>
                  <Typography variant="body1" fontWeight="medium">{formatCurrency(invoice.taxAmount)}</Typography>
                </Box>
                <Divider sx={{ width: '300px', my: 1 }} />
                <Box sx={{ display: 'flex', width: '300px', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight="bold">Total:</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">{formatCurrency(invoice.total)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Client Info and Notes */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Client Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {invoice.client ? (
                <Box>
                  <Typography variant="body1" fontWeight="medium">{invoice.client.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{invoice.client.email}</Typography>
                  <Typography variant="body2" color="text.secondary">{invoice.client.address}</Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Please select a client to display information
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Notes & Terms
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Add notes or terms of service (e.g., payment terms, return policy)"
                name="notes"
                value={invoice.notes}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
              />
              
              <Button
                variant="text"
                color="primary"
                startIcon={<AttachFile />}
                sx={{ mt: 2 }}
              >
                Attach Files
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {isEditing ? "Update and Send Invoice?" : "Send Invoice to Client?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {isEditing 
              ? `This will update invoice ${invoice.id} and send it to ${invoice.client?.name || 'the client'}.`
              : `This will create invoice ${invoice.id} and send it to ${invoice.client?.name || 'the client'}.`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmSendInvoice} color="primary" variant="contained" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoiceForm;