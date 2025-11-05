import React, { useState, useEffect } from 'react';
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
  TablePagination,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Divider,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Visibility,
  Edit,
  Delete,
  GetApp,
  Send
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from 'axios';

const InvoiceList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  // Mock data for development
  const mockInvoices = [
    {
      id: 'INV-2023-001',
      client: 'Acme Corporation',
      amount: 5200.00,
      issueDate: '2023-06-01',
      dueDate: '2023-06-15',
      status: 'paid',
      email: 'billing@acmecorp.com'
    },
    {
      id: 'INV-2023-002',
      client: 'Globex Industries',
      amount: 3750.00,
      issueDate: '2023-06-05',
      dueDate: '2023-06-20',
      status: 'pending',
      email: 'accounts@globex.com'
    },
    {
      id: 'INV-2023-003',
      client: 'Wayne Enterprises',
      amount: 12000.00,
      issueDate: '2023-06-10',
      dueDate: '2023-06-25',
      status: 'pending',
      email: 'finance@wayne.com'
    },
    {
      id: 'INV-2023-004',
      client: 'Stark Industries',
      amount: 8500.00,
      issueDate: '2023-05-20',
      dueDate: '2023-06-05',
      status: 'overdue',
      email: 'accounting@stark.com'
    },
    {
      id: 'INV-2023-005',
      client: 'Umbrella Corporation',
      amount: 4200.00,
      issueDate: '2023-05-25',
      dueDate: '2023-06-10',
      status: 'paid',
      email: 'finance@umbrella.com'
    },
    {
      id: 'INV-2023-006',
      client: 'Cyberdyne Systems',
      amount: 9800.00,
      issueDate: '2023-06-15',
      dueDate: '2023-06-30',
      status: 'draft',
      email: 'accounts@cyberdyne.com'
    },
    {
      id: 'INV-2023-007',
      client: 'Oscorp Industries',
      amount: 6300.00,
      issueDate: '2023-06-12',
      dueDate: '2023-06-27',
      status: 'pending',
      email: 'billing@oscorp.com'
    },
    {
      id: 'INV-2023-008',
      client: 'LexCorp',
      amount: 15000.00,
      issueDate: '2023-05-15',
      dueDate: '2023-05-30',
      status: 'overdue',
      email: 'finance@lexcorp.com'
    }
  ];

  useEffect(() => {
    // In a real app, fetch from API
    // For now, use mock data
    setLoading(true);
    setTimeout(() => {
      setInvoices(mockInvoices);
      setTotalCount(mockInvoices.length);
      setLoading(false);
    }, 500);
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setPage(0);
  };

  const handleMenuOpen = (event, invoiceId) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoiceId(invoiceId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoiceId(null);
  };

  const handleViewInvoice = () => {
    console.log('View invoice:', selectedInvoiceId);
    handleMenuClose();
  };

  const handleEditInvoice = () => {
    console.log('Edit invoice:', selectedInvoiceId);
    handleMenuClose();
  };

  const handleDeleteInvoice = () => {
    console.log('Delete invoice:', selectedInvoiceId);
    handleMenuClose();
  };

  const handleDownloadInvoice = () => {
    console.log('Download invoice:', selectedInvoiceId);
    handleMenuClose();
  };

  const handleSendInvoice = () => {
    console.log('Send invoice:', selectedInvoiceId);
    handleMenuClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return theme.palette.success;
      case 'pending':
        return theme.palette.warning;
      case 'overdue':
        return theme.palette.error;
      case 'draft':
        return theme.palette.info;
      default:
        return theme.palette.info;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    // Apply search filter
    const matchesSearch = searchTerm === '' || 
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    // Apply date filter
    const invoiceDate = new Date(invoice.issueDate);
    const matchesStartDate = !startDate || invoiceDate >= startDate;
    const matchesEndDate = !endDate || invoiceDate <= endDate;
    
    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
  });

  const displayedInvoices = filteredInvoices
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Invoices
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          sx={{
            fontWeight: 'bold',
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            }
          }}
        >
          Create Invoice
        </Button>
      </Box>

      {/* Filters */}
      <Card elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label="All" 
                  onClick={() => handleStatusFilterChange('all')}
                  color={statusFilter === 'all' ? 'primary' : 'default'}
                  variant={statusFilter === 'all' ? 'filled' : 'outlined'}
                />
                <Chip 
                  label="Paid" 
                  onClick={() => handleStatusFilterChange('paid')}
                  color={statusFilter === 'paid' ? 'success' : 'default'}
                  variant={statusFilter === 'paid' ? 'filled' : 'outlined'}
                />
                <Chip 
                  label="Pending" 
                  onClick={() => handleStatusFilterChange('pending')}
                  color={statusFilter === 'pending' ? 'warning' : 'default'}
                  variant={statusFilter === 'pending' ? 'filled' : 'outlined'}
                />
                <Chip 
                  label="Overdue" 
                  onClick={() => handleStatusFilterChange('overdue')}
                  color={statusFilter === 'overdue' ? 'error' : 'default'}
                  variant={statusFilter === 'overdue' ? 'filled' : 'outlined'}
                />
                <Chip 
                  label="Draft" 
                  onClick={() => handleStatusFilterChange('draft')}
                  color={statusFilter === 'draft' ? 'info' : 'default'}
                  variant={statusFilter === 'draft' ? 'filled' : 'outlined'}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="From Date"
                  value={startDate}
                  onChange={setStartDate}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  slotProps={{
                    textField: { size: 'small', fullWidth: true }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="To Date"
                  value={endDate}
                  onChange={setEndDate}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  slotProps={{
                    textField: { size: 'small', fullWidth: true }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<FilterList />}
                fullWidth
              >
                Apply Filters
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="text" 
                color="inherit"
                fullWidth
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setStartDate(null);
                  setEndDate(null);
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card elevation={0} sx={{ borderRadius: 2 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Invoice #</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Issue Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Loading...</TableCell>
                </TableRow>
              ) : displayedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No invoices found</TableCell>
                </TableRow>
              ) : (
                displayedInvoices.map((invoice) => (
                  <TableRow 
                    key={invoice.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                      {invoice.id}
                    </TableCell>
                    <TableCell>{invoice.client}</TableCell>
                    <TableCell sx={{ fontWeight: 'medium' }}>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{invoice.issueDate}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell>
                      <Chip 
                        label={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)} 
                        size="small"
                        sx={{ 
                          bgcolor: getStatusColor(invoice.status).light,
                          color: getStatusColor(invoice.status).main,
                          fontWeight: 'medium'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small"
                        onClick={(event) => handleMenuOpen(event, invoice.id)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredInvoices.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 1,
          sx: { borderRadius: 2, minWidth: 180 }
        }}
      >
        <MenuItem onClick={handleViewInvoice}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditInvoice}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Invoice
        </MenuItem>
        <MenuItem onClick={handleDownloadInvoice}>
          <GetApp fontSize="small" sx={{ mr: 1 }} />
          Download PDF
        </MenuItem>
        <MenuItem onClick={handleSendInvoice}>
          <Send fontSize="small" sx={{ mr: 1 }} />
          Send to Client
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteInvoice} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Invoice
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default InvoiceList;