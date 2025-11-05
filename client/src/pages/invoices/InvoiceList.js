import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Avatar,
  Alert,
  Skeleton,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
  Receipt,
  AttachMoney,
  CalendarToday,
  Business,
  Schedule,
  CheckCircle,
  Warning,
  Send,
  Payment,
  Download,
  Print
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import invoiceService from '../../services/invoiceService';
import { useApp } from '../../contexts/AppContext';

const InvoiceList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { addNotification } = useApp();

  // State management
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);



  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        date_filter: dateFilter || undefined
      };
      const response = await invoiceService.getInvoices(params);
      setInvoices(response.data.invoices || []);
      setTotalCount(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Failed to load invoices');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch invoices'
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, statusFilter, dateFilter, addNotification]);

  const fetchStats = async () => {
    try {
      const response = await invoiceService.getInvoiceStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
    }
  };
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    fetchStats();
  }, []);
  const handleMenuClick = (event, invoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };

  const handleDelete = async () => {
    try {
      await invoiceService.deleteInvoice(selectedInvoice.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Invoice deleted successfully'
      });
      fetchInvoices();
      fetchStats();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete invoice'
      });
    } finally {
      setDeleteDialogOpen(false);
      handleMenuClose();
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchInvoices();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'overdue': return 'error';
      case 'sent': return 'info';
      case 'partial': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle fontSize="small" />;
      case 'overdue': return <Warning fontSize="small" />;
      case 'sent': return <Send fontSize="small" />;
      case 'partial': return <Schedule fontSize="small" />;
      case 'draft': return <Edit fontSize="small" />;
      default: return <Receipt fontSize="small" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate, status) => {
    return status !== 'paid' && new Date(dueDate) < new Date();
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading && invoices.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="300px" height={48} sx={{ mb: 3 }} />
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header Section */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          mb: 4
        }}>
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700, mb: 1 }}>
              Invoice Management
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Create, manage, and track your invoices and payments
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/invoices/new')}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              boxShadow: theme.shadows[4],
              '&:hover': {
                boxShadow: theme.shadows[8],
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Create Invoice
          </Button>
        </Box>

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={3}>
              <Card sx={{
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}25 100%)`,
                border: `1px solid ${theme.palette.primary.main}30`
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Receipt sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Invoices
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.main}25 100%)`,
                border: `1px solid ${theme.palette.success.main}30`
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircle sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                    {stats.paid}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Paid
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.warning.main}15 0%, ${theme.palette.warning.main}25 100%)`,
                border: `1px solid ${theme.palette.warning.main}30`
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Schedule sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main', mb: 1 }}>
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pending
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.error.main}15 0%, ${theme.palette.error.main}25 100%)`,
                border: `1px solid ${theme.palette.error.main}30`
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Warning sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main', mb: 1 }}>
                    {stats.overdue}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Overdue
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters and Search */}
        <Card sx={{ borderRadius: 3, mb: 4, p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="partial">Partial</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  label="Date Range"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="quarter">This Quarter</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600
                }}
              >
                Search
              </Button>
            </Grid>
            <Grid item xs={12} sm={8} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600
                }}
              >
                Filters
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Invoice Table */}
        <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Invoice #</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Issue Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice, index) => (
                  <Zoom in={true} timeout={400 + index * 50} key={invoice.id}>
                    <TableRow
                      hover
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.02)
                        }
                      }}
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, backgroundColor: 'primary.main', fontSize: '0.8rem' }}>
                            <Receipt fontSize="small" />
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {invoice.invoice_number}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Business fontSize="small" color="action" />
                          <Typography variant="body2">
                            {invoice.client?.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday fontSize="small" color="action" />
                          <Typography variant="body2">
                            {formatDate(invoice.issue_date)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday fontSize="small" color={isOverdue(invoice.due_date, invoice.status) ? "error" : "action"} />
                          <Typography
                            variant="body2"
                            sx={{
                              color: isOverdue(invoice.due_date, invoice.status) ? 'error.main' : 'text.primary',
                              fontWeight: isOverdue(invoice.due_date, invoice.status) ? 600 : 400
                            }}
                          >
                            {formatDate(invoice.due_date)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoney fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(invoice.total_amount)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(invoice.status)}
                          label={invoice.status.toUpperCase()}
                          color={getStatusColor(invoice.status)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuClick(e, invoice);
                          }}
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1)
                            }
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  </Zoom>
                ))}
              </TableBody>
            </Table>

            {/* Empty State */}
            {!loading && invoices.length === 0 && (
              <Box sx={{
                textAlign: 'center',
                py: 8,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.main}08 100%)`
              }}>
                <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  No invoices found
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  {searchTerm || statusFilter || dateFilter
                    ? 'Try adjusting your search criteria'
                    : 'Get started by creating your first invoice'
                  }
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/invoices/new')}
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  Create Invoice
                </Button>
              </Box>
            )}

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: `1px solid ${theme.palette.divider}`,
                '& .MuiTablePagination-toolbar': {
                  px: 3
                }
              }}
            />
          </TableContainer>
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          sx={{
            '& .MuiPaper-root': {
              borderRadius: 2,
              minWidth: 200,
              boxShadow: theme.shadows[8]
            }
          }}
        >
          <MenuItem onClick={() => {
            navigate(`/invoices/${selectedInvoice?.id}`);
            handleMenuClose();
          }}>
            <Visibility fontSize="small" sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={() => {
            navigate(`/invoices/${selectedInvoice?.id}/edit`);
            handleMenuClose();
          }}>
            <Edit fontSize="small" sx={{ mr: 1 }} />
            Edit Invoice
          </MenuItem>
          <MenuItem onClick={() => {
            // Send invoice functionality
            handleMenuClose();
          }}>
            <Send fontSize="small" sx={{ mr: 1 }} />
            Send Invoice
          </MenuItem>
          <MenuItem onClick={() => {
            // Record payment functionality
            handleMenuClose();
          }}>
            <Payment fontSize="small" sx={{ mr: 1 }} />
            Record Payment
          </MenuItem>
          <MenuItem onClick={() => {
            // Download functionality
            handleMenuClose();
          }}>
            <Download fontSize="small" sx={{ mr: 1 }} />
            Download PDF
          </MenuItem>
          <MenuItem onClick={() => {
            // Print functionality
            handleMenuClose();
          }}>
            <Print fontSize="small" sx={{ mr: 1 }} />
            Print Invoice
          </MenuItem>
          <MenuItem
            onClick={() => {
              setDeleteDialogOpen(true);
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Delete fontSize="small" sx={{ mr: 1 }} />
            Delete Invoice
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Delete Invoice</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete invoice "{selectedInvoice?.invoice_number}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default InvoiceList;