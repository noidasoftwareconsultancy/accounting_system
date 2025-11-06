import React, { useState, useEffect } from 'react';
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
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Tooltip,
  Autocomplete,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  PostAdd as PostIcon,
  Receipt as ReceiptIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { accountingService } from '../../services/accountingService';
import { useAuth } from '../../contexts/AuthContext';
import { canManageAccounting } from '../../utils/permissions';

const JournalEntries = () => {
  const { user } = useAuth();
  const [journalEntries, setJournalEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Check if user can manage accounting operations
  const canManage = canManageAccounting(user);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    entry_number: '',
    date: new Date(),
    description: '',
    reference: '',
    ledger_entries: [
      { account_id: '', description: '', debit: '', credit: '' },
      { account_id: '', description: '', debit: '', credit: '' }
    ]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [journalRes, accountsRes] = await Promise.all([
        accountingService.getJournalEntries(),
        accountingService.getAccounts()
      ]);
      
      setJournalEntries(journalRes.data?.journalEntries || []);
      setAccounts(accountsRes.data?.accounts || []);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateEntryNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `JE-${year}${month}${day}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      // Validate ledger entries
      const validEntries = formData.ledger_entries.filter(entry => 
        entry.account_id && (entry.debit || entry.credit)
      );
      
      if (validEntries.length < 2) {
        setError('At least two ledger entries are required');
        return;
      }
      
      // Check if debits equal credits
      const totalDebits = validEntries.reduce((sum, entry) => sum + parseFloat(entry.debit || 0), 0);
      const totalCredits = validEntries.reduce((sum, entry) => sum + parseFloat(entry.credit || 0), 0);
      
      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        setError('Total debits must equal total credits');
        return;
      }
      
      const entryData = {
        ...formData,
        ledger_entries: validEntries
      };
      
      if (editingEntry) {
        if (accountingService.updateJournalEntry) {
          await accountingService.updateJournalEntry(editingEntry.id, entryData);
          setSuccess('Journal entry updated successfully');
        } else {
          setError('Update functionality not available');
          return;
        }
      } else {
        await accountingService.createJournalEntry(entryData);
        setSuccess('Journal entry created successfully');
      }
      
      handleCloseDialog();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save journal entry');
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      entry_number: entry.entry_number,
      date: new Date(entry.date),
      description: entry.description || '',
      reference: entry.reference || '',
      ledger_entries: entry.ledger_entries?.map(le => ({
        account_id: le.account_id,
        description: le.description || '',
        debit: le.debit || '',
        credit: le.credit || ''
      })) || [
        { account_id: '', description: '', debit: '', credit: '' },
        { account_id: '', description: '', debit: '', credit: '' }
      ]
    });
    setOpenDialog(true);
  };

  const handlePost = async (entry) => {
    if (window.confirm(`Are you sure you want to post journal entry "${entry.entry_number}"? This action cannot be undone.`)) {
      try {
        await accountingService.postJournalEntry(entry.id);
        setSuccess('Journal entry posted successfully');
        loadData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to post journal entry');
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEntry(null);
    setFormData({
      entry_number: '',
      date: new Date(),
      description: '',
      reference: '',
      ledger_entries: [
        { account_id: '', description: '', debit: '', credit: '' },
        { account_id: '', description: '', debit: '', credit: '' }
      ]
    });
  };

  const handleOpenDialog = () => {
    setFormData(prev => ({
      ...prev,
      entry_number: generateEntryNumber()
    }));
    setOpenDialog(true);
  };

  const addLedgerEntry = () => {
    setFormData(prev => ({
      ...prev,
      ledger_entries: [
        ...prev.ledger_entries,
        { account_id: '', description: '', debit: '', credit: '' }
      ]
    }));
  };

  const removeLedgerEntry = (index) => {
    if (formData.ledger_entries.length > 2) {
      setFormData(prev => ({
        ...prev,
        ledger_entries: prev.ledger_entries.filter((_, i) => i !== index)
      }));
    }
  };

  const updateLedgerEntry = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ledger_entries: prev.ledger_entries.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const calculateTotals = () => {
    const totalDebits = formData.ledger_entries.reduce((sum, entry) => 
      sum + parseFloat(entry.debit || 0), 0
    );
    const totalCredits = formData.ledger_entries.reduce((sum, entry) => 
      sum + parseFloat(entry.credit || 0), 0
    );
    return { totalDebits, totalCredits };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const { totalDebits, totalCredits } = calculateTotals();
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Journal Entries</Typography>
          {canManage && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Create Entry
            </Button>
          )}
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Journal Entries Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Entry Number</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {journalEntries.map(entry => {
                const totalAmount = entry.ledger_entries?.reduce((sum, le) => 
                  sum + parseFloat(le.debit || 0), 0
                ) || 0;
                
                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ReceiptIcon fontSize="small" />
                        {entry.entry_number}
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>{entry.reference}</TableCell>
                    <TableCell align="right">{formatCurrency(totalAmount)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={entry.is_posted ? 'Posted' : 'Draft'} 
                        color={entry.is_posted ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {canManage && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {!entry.is_posted && (
                            <>
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => handleEdit(entry)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Post Entry">
                                <IconButton size="small" onClick={() => handlePost(entry)} color="primary">
                                  <PostIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Journal Entry Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {editingEntry ? 'Edit Journal Entry' : 'Create New Journal Entry'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Entry Number"
                    value={formData.entry_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, entry_number: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Date"
                    value={formData.date}
                    onChange={(newValue) => setFormData(prev => ({ ...prev, date: newValue }))}
                    slots={{
                      textField: TextField
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Reference"
                    value={formData.reference}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Ledger Entries</Typography>
                <Button startIcon={<AddIcon />} onClick={addLedgerEntry}>
                  Add Line
                </Button>
              </Box>

              {formData.ledger_entries.map((entry, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Autocomplete
                        options={accounts}
                        getOptionLabel={(option) => `${option.account_number} - ${option.name}`}
                        value={accounts.find(acc => acc.id === entry.account_id) || null}
                        onChange={(e, newValue) => updateLedgerEntry(index, 'account_id', newValue?.id || '')}
                        renderInput={(params) => (
                          <TextField {...params} label="Account" required />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={entry.description}
                        onChange={(e) => updateLedgerEntry(index, 'description', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Debit"
                        type="number"
                        inputProps={{ step: 0.01, min: 0 }}
                        value={entry.debit}
                        onChange={(e) => {
                          updateLedgerEntry(index, 'debit', e.target.value);
                          if (e.target.value) updateLedgerEntry(index, 'credit', '');
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Credit"
                        type="number"
                        inputProps={{ step: 0.01, min: 0 }}
                        value={entry.credit}
                        onChange={(e) => {
                          updateLedgerEntry(index, 'credit', e.target.value);
                          if (e.target.value) updateLedgerEntry(index, 'debit', '');
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={1}>
                      {formData.ledger_entries.length > 2 && (
                        <IconButton 
                          color="error" 
                          onClick={() => removeLedgerEntry(index)}
                        >
                          <RemoveIcon />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              ))}

              {/* Totals */}
              <Paper sx={{ p: 2, bgcolor: isBalanced ? 'success.light' : 'error.light' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">
                      Total Debits: {formatCurrency(totalDebits)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">
                      Total Credits: {formatCurrency(totalCredits)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography 
                      variant="subtitle1" 
                      color={isBalanced ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {isBalanced ? 'Entry is balanced ✓' : `Out of balance by ${formatCurrency(Math.abs(totalDebits - totalCredits))}`}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={!isBalanced}>
                {editingEntry ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default JournalEntries;