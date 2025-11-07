import { useState, useEffect, useCallback } from 'react';
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
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Skeleton,
  useTheme,
  useMediaQuery,
  Fade,
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
  Payment,
  Schedule,
  People,
  AttachMoney,
  CalendarToday,
  CheckCircle,
  Warning,
  PlayArrow,
  GetApp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import payrollService from '../../services/payrollService';
import { useApp } from '../../contexts/AppContext';

const PayrollList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { addNotification } = useApp();

  // State management
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchPayrollRuns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm || undefined,
        status: statusFilter || undefined
      };
      const response = await payrollService.getAll(params.page, params.limit);
      setPayrollRuns(response.data.payrollRuns || []);
      setTotalCount(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching payroll runs:', error);
      setError('Failed to load payroll runs');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch payroll runs'
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, statusFilter, addNotification]);

  const fetchStats = async () => {
    try {
      const response = await payrollService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching payroll stats:', error);
    }
  };

  useEffect(() => {
    fetchPayrollRuns();
  }, [fetchPayrollRuns]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleMenuClick = (event, run) => {
    setAnchorEl(event.currentTarget);
    setSelectedRun(run);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRun(null);
  };

  const handleDelete = async () => {
    try {
      await payrollService.delete(selectedRun.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Payroll run deleted successfully'
      });
      fetchPayrollRuns();
      fetchStats();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to delete payroll run'
      });
    } finally {
      setDeleteDialogOpen(false);
      handleMenuClose();
    }
  };

  const handleProcessPayroll = async (run) => {
    try {
      // Navigate to process payroll page
      navigate(`/payroll/${run.id}/process`);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to process payroll'
      });
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'draft': return 'default';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle fontSize="small" />;
      case 'processing': return <Schedule fontSize="small" />;
      case 'draft': return <Edit fontSize="small" />;
      case 'failed': return <Warning fontSize="small" />;
      default: return <Schedule fontSize="small" />;
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

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading && payrollRuns.length === 0) {
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
              Payroll Management
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Manage payroll runs, process salaries, and track payments
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/payroll/new')}
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
            Create Payroll Run
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
                  <Schedule sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                    {stats.totalRuns || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Runs
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
                    {stats.completedRuns || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.main}25 100%)`,
                border: `1px solid ${theme.palette.info.main}30`
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <People sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main', mb: 1 }}>
                    {stats.totalEmployees || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Employees
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
                  <AttachMoney sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main', mb: 1 }}>
                    {formatCurrency(stats.totalPayroll || 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    This Month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters and Search */}
        <Card sx={{ borderRadius: 3, mb: 4, p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search payroll runs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            <Grid item xs={12} sm={4} md={3}>
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
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={8} md={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={fetchPayrollRuns}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600
                }}
              >
                Search
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

        {/* Payroll Runs Table */}
        <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: theme.palette.primary.main + '0A' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Run Details</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Period</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Employees</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payrollRuns.map((run, index) => (
                  <TableRow
                    key={run.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.main + '05'
                      }
                    }}
                    onClick={() => navigate(`/payroll/${run.id}`)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, backgroundColor: 'primary.main', fontSize: '0.8rem' }}>
                          <Schedule fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {run.run_name || `Payroll ${run.month}/${run.year}`}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Created: {formatDate(run.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2">
                            {formatDate(run.start_date)} - {formatDate(run.end_date)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {run.month}/{run.year}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <People fontSize="small" color="action" />
                        <Typography variant="body2">
                          {run.employee_count || 0} employees
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(run.total_amount)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(run.status)}
                        label={run.status?.toUpperCase() || 'DRAFT'}
                        color={getStatusColor(run.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuClick(e, run);
                        }}
                        sx={{
                          '&:hover': {
                            backgroundColor: theme.palette.primary.main + '20'
                          }
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Empty State */}
            {!loading && payrollRuns.length === 0 && (
              <Box sx={{
                textAlign: 'center',
                py: 8,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.main}08 100%)`
              }}>
                <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  No payroll runs found
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  {searchTerm || statusFilter
                    ? 'Try adjusting your search criteria'
                    : 'Get started by creating your first payroll run'
                  }
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/payroll/new')}
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  Create Payroll Run
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
            navigate(`/payroll/${selectedRun?.id}`);
            handleMenuClose();
          }}>
            <Visibility fontSize="small" sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={() => {
            navigate(`/payroll/${selectedRun?.id}/edit`);
            handleMenuClose();
          }}>
            <Edit fontSize="small" sx={{ mr: 1 }} />
            Edit Run
          </MenuItem>
          {selectedRun?.status === 'draft' && (
            <MenuItem onClick={() => handleProcessPayroll(selectedRun)}>
              <PlayArrow fontSize="small" sx={{ mr: 1 }} />
              Process Payroll
            </MenuItem>
          )}
          <MenuItem onClick={() => {
            // Download payslips functionality
            handleMenuClose();
          }}>
            <GetApp fontSize="small" sx={{ mr: 1 }} />
            Download Payslips
          </MenuItem>
          <MenuItem onClick={() => {
            // Payment status functionality
            handleMenuClose();
          }}>
            <Payment fontSize="small" sx={{ mr: 1 }} />
            Update Payments
          </MenuItem>
          <MenuItem
            onClick={() => {
              setDeleteDialogOpen(true);
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Delete fontSize="small" sx={{ mr: 1 }} />
            Delete Run
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Delete Payroll Run</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this payroll run? This action cannot be undone.
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

export default PayrollList;