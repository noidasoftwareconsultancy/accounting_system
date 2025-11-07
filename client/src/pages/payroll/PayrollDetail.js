import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  GetApp,
  Print,
  Payment,
  MoreVert,
  People,
  AttachMoney,
  CalendarToday,
  CheckCircle,
  Schedule,
  Warning,
  Email,
  Visibility
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import payrollService from '../../services/payrollService';
import { useApp } from '../../contexts/AppContext';

const PayrollDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNotification } = useApp();

  // State management
  const [payrollRun, setPayrollRun] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    status: 'paid',
    payment_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadPayrollRun();
  }, [id]);

  const loadPayrollRun = async () => {
    try {
      setLoading(true);
      const response = await payrollService.getById(id);
      setPayrollRun(response.data);
      
      // Load payslips if run is processed
      if (response.data.status === 'completed') {
        // Note: This would need a specific endpoint to get payslips by run ID
        // For now, we'll simulate the data structure
        setPayslips(response.data.payslips || []);
      }
    } catch (error) {
      console.error('Error loading payroll run:', error);
      setError('Failed to load payroll run details');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, payslip) => {
    setAnchorEl(event.currentTarget);
    setSelectedPayslip(payslip);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPayslip(null);
  };

  const handleUpdatePaymentStatus = async () => {
    try {
      await payrollService.updatePaymentStatus(
        selectedPayslip.id,
        paymentData.status,
        paymentData.payment_date
      );
      
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Payment status updated successfully'
      });
      
      loadPayrollRun();
      setPaymentDialogOpen(false);
    } catch (error) {
      console.error('Error updating payment status:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update payment status'
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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
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
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTotals = () => {
    if (!payslips.length) return { totalGross: 0, totalDeductions: 0, totalNet: 0 };
    
    return payslips.reduce(
      (acc, payslip) => ({
        totalGross: acc.totalGross + (payslip.gross_salary || 0),
        totalDeductions: acc.totalDeductions + (payslip.total_deductions || 0),
        totalNet: acc.totalNet + (payslip.net_salary || 0)
      }),
      { totalGross: 0, totalDeductions: 0, totalNet: 0 }
    );
  };

  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* Run Information */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payroll Run Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Run Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {payrollRun.run_name || `Payroll ${payrollRun.month}/${payrollRun.year}`}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Period
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatDate(payrollRun.start_date)} - {formatDate(payrollRun.end_date)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Month/Year
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {payrollRun.month}/{payrollRun.year}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Status
                </Typography>
                <Chip
                  label={payrollRun.status?.toUpperCase() || 'DRAFT'}
                  color={getStatusColor(payrollRun.status)}
                  size="small"
                />
              </Grid>
              {payrollRun.description && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {payrollRun.description}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Statistics */}
      <Grid item xs={12} md={4}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {payslips.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Employees
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <AttachMoney sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {formatCurrency(calculateTotals().totalNet)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Payout
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Summary Table */}
      {payslips.length > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payroll Summary
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Gross Salary</TableCell>
                      <TableCell align="right">
                        {formatCurrency(calculateTotals().totalGross)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Deductions</TableCell>
                      <TableCell align="right">
                        {formatCurrency(calculateTotals().totalDeductions)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Total Net Salary</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(calculateTotals().totalNet)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );

  const renderPayslipsTab = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Employee Payslips
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              size="small"
            >
              Export All
            </Button>
            <Button
              variant="outlined"
              startIcon={<Email />}
              size="small"
            >
              Send All
            </Button>
          </Box>
        </Box>

        {payslips.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell align="right">Basic Salary</TableCell>
                  <TableCell align="right">Allowances</TableCell>
                  <TableCell align="right">Gross Salary</TableCell>
                  <TableCell align="right">Deductions</TableCell>
                  <TableCell align="right">Net Salary</TableCell>
                  <TableCell>Payment Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payslips.map((payslip) => (
                  <TableRow key={payslip.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {payslip.employee?.user?.first_name?.[0] || 'E'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {payslip.employee?.user?.first_name} {payslip.employee?.user?.last_name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {payslip.employee?.employee_id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(payslip.basic_salary)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(payslip.allowances || 0)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(payslip.gross_salary)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(payslip.total_deductions)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(payslip.net_salary)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payslip.payment_status?.toUpperCase() || 'PENDING'}
                        color={getPaymentStatusColor(payslip.payment_status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, payslip)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            No payslips generated yet. Process the payroll run to generate payslips.
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!payrollRun) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Payroll run not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/payroll')}
            sx={{ mr: 2 }}
          >
            Back to Payroll
          </Button>
          <Box>
            <Typography variant="h4">
              {payrollRun.run_name || `Payroll ${payrollRun.month}/${payrollRun.year}`}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Created on {formatDate(payrollRun.created_at)}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {payrollRun.status === 'draft' && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate(`/payroll/${id}/edit`)}
            >
              Edit
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<Print />}
          >
            Print
          </Button>
          <Button
            variant="contained"
            startIcon={<GetApp />}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Status Alert */}
      {payrollRun.status === 'draft' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          This payroll run is still in draft status. Complete the setup to process payroll.
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab label="Overview" />
          <Tab label="Payslips" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {currentTab === 0 && renderOverviewTab()}
      {currentTab === 1 && renderPayslipsTab()}

      {/* Payslip Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          // View payslip details
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 1 }} fontSize="small" />
          View Payslip
        </MenuItem>
        <MenuItem onClick={() => {
          // Download payslip
          handleMenuClose();
        }}>
          <GetApp sx={{ mr: 1 }} fontSize="small" />
          Download PDF
        </MenuItem>
        <MenuItem onClick={() => {
          // Send payslip via email
          handleMenuClose();
        }}>
          <Email sx={{ mr: 1 }} fontSize="small" />
          Send Email
        </MenuItem>
        <MenuItem onClick={() => {
          setPaymentDialogOpen(true);
          handleMenuClose();
        }}>
          <Payment sx={{ mr: 1 }} fontSize="small" />
          Update Payment
        </MenuItem>
      </Menu>

      {/* Payment Status Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Payment Status</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={paymentData.status}
                  label="Payment Status"
                  onChange={(e) => setPaymentData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                value={paymentData.payment_date}
                onChange={(e) => setPaymentData(prev => ({ ...prev, payment_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdatePaymentStatus} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayrollDetail;