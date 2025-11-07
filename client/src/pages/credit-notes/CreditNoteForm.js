import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import { Save, Cancel, Add, Delete } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import creditNoteService from '../../services/creditNoteService';
import invoiceService from '../../services/invoiceService';
import clientService from '../../services/clientService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CreditNoteForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNotification } = useApp();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    credit_note_number: '',
    invoice_id: '',
    client_id: '',
    credit_note_date: new Date(),
    reason: '',
    status: 'draft',
    items: []
  });

  useEffect(() => {
    fetchInvoices();
    fetchClients();
    if (isEdit) {
      fetchCreditNote();
    } else {
      generateCreditNoteNumber();
    }
  }, [id]);

  const fetchCreditNote = async () => {
    try {
      const response = await creditNoteService.getById(id);
      setFormData({
        ...response.data,
        credit_note_date: response.data.credit_note_date ? new Date(response.data.credit_note_date) : new Date(),
        items: response.data.items || []
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load credit note'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCreditNoteNumber = async () => {
    try {
      const response = await creditNoteService.generateCreditNoteNumber();
      setFormData(prev => ({ ...prev, credit_note_number: response.data.credit_note_number }));
    } catch (error) {
      console.error('Error generating credit note number:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await invoiceService.getAll(1, 100);
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await clientService.getAll(1, 100);
      setClients(response.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleInvoiceChange = (invoiceId) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setFormData(prev => ({
        ...prev,
        invoice_id: invoiceId,
        client_id: invoice.client_id,
        items: invoice.items?.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount
        })) || []
      }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit_price: 0, amount: 0 }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        total_amount: calculateTotal()
      };

      if (isEdit) {
        await creditNoteService.update(id, submitData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Credit note updated successfully'
        });
      } else {
        await creditNoteService.create(submitData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Credit note created successfully'
        });
      }
      navigate('/credit-notes');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: `Failed to ${isEdit ? 'update' : 'create'} credit note`
      });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        {isEdit ? 'Edit Credit Note' : 'New Credit Note'}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Credit Note Number"
                value={formData.credit_note_number}
                onChange={(e) => setFormData({ ...formData, credit_note_number: e.target.value })}
                required
                disabled={isEdit}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Credit Note Date"
                value={formData.credit_note_date}
                onChange={(date) => setFormData({ ...formData, credit_note_date: date })}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Invoice</InputLabel>
                <Select
                  value={formData.invoice_id}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  label="Invoice"
                >
                  {invoices.map((invoice) => (
                    <MenuItem key={invoice.id} value={invoice.id}>
                      {invoice.invoice_number} - ${invoice.total_amount?.toLocaleString()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Client</InputLabel>
                <Select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  label="Client"
                  disabled={Boolean(formData.invoice_id)}
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="issued">Issued</MenuItem>
                  <MenuItem value="applied">Applied</MenuItem>
                  <MenuItem value="void">Void</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                multiline
                rows={3}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Items</Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addItem}
                  size="small"
                >
                  Add Item
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell width="100px">Quantity</TableCell>
                      <TableCell width="120px">Unit Price</TableCell>
                      <TableCell width="120px">Amount</TableCell>
                      <TableCell width="50px"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            ${item.amount?.toLocaleString() || '0'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => removeItem(index)}
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {formData.items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="textSecondary">
                            No items added. Click "Add Item" to begin.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Typography variant="h6">
                  Total: ${calculateTotal().toLocaleString()}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate('/credit-notes')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                >
                  {isEdit ? 'Update' : 'Create'} Credit Note
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CreditNoteForm;
