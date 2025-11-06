import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  DatePicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  TrendingUp as RevenueIcon,
  TrendingDown as ExpenseIcon,
  AccountBalance as ProfitIcon,
  Timeline as TrendsIcon,
  People as ClientsIcon,
  Assessment as DashboardIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import financialReportsService from '../../services/financialReportsService';

const FinancialReports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Data
  const [dashboardData, setDashboardData] = useState({});
  const [revenueData, setRevenueData] = useState({});
  const [expenseData, setExpenseData] = useState({});
  const [profitLossData, setProfitLossData] = useState({});
  const [cashFlowData, setCashFlowData] = useState({});
  const [clientPerformanceData, setClientPerformanceData] = useState([]);
  const [monthlyTrendsData, setMonthlyTrendsData] = useState([]);

  useEffect(() => {
    loadFinancialReports();
  }, [startDate, endDate, selectedYear]);

  const loadFinancialReports = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      };

      const [
        dashboardRes,
        revenueRes,
        expenseRes,
        profitLossRes,
        cashFlowRes,
        clientPerformanceRes,
        monthlyTrendsRes
      ] = await Promise.all([
        financialReportsService.getFinancialDashboard(),
        financialReportsService.getRevenueSummary(params),
        financialReportsService.getExpenseSummary(params),
        financialReportsService.getProfitLossReport(params),
        financialReportsService.getCashFlowReport(params),
        financialReportsService.getClientPerformanceReport(params),
        financialReportsService.getMonthlyTrendsReport({ year: selectedYear })
      ]);

      setDashboardData(dashboardRes.data || {});
      setRevenueData(revenueRes.data || {});
      setExpenseData(expenseRes.data || {});
      setProfitLossData(profitLossRes.data || {});
      setCashFlowData(cashFlowRes.data || {});
      setClientPerformanceData(clientPerformanceRes.data || []);
      setMonthlyTrendsData(monthlyTrendsRes.data || []);

    } catch (err) {
      console.error('Load financial reports error:', err);
      setError(err.response?.data?.message || 'Failed to load financial reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (data, filename, format = 'csv') => {
    try {
      if (format === 'csv') {
        financialReportsService.exportToCsv(data, filename);
      } else if (format === 'json') {
        financialReportsService.exportToJson(data, filename);
      }
      setSuccess(`Report exported successfully as ${format.toUpperCase()}`);
    } catch (err) {
      setError('Failed to export report');
    }
  };

  const renderDashboardTab = () => (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RevenueIcon color="success" />
                <Typography variant="h6">Yearly Revenue</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {financialReportsService.formatCurrency(dashboardData.yearly_summary?.revenue || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboardData.yearly_summary?.invoices || 0} invoices
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ExpenseIcon color="error" />
                <Typography variant="h6">Yearly Expenses</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {financialReportsService.formatCurrency(dashboardData.yearly_summary?.expenses || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ProfitIcon color="primary" />
                <Typography variant="h6">Yearly Profit</Typography>
              </Box>
              <Typography 
                variant="h4" 
                color={dashboardData.yearly_summary?.profit >= 0 ? 'success.main' : 'error.main'}
              >
                {financialReportsService.formatCurrency(dashboardData.yearly_summary?.profit || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RevenueIcon color="info" />
                <Typography variant="h6">Monthly Revenue</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {financialReportsService.formatCurrency(dashboardData.monthly_summary?.revenue || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboardData.monthly_summary?.invoices || 0} invoices this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Clients */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Top Clients</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Outstanding</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(dashboardData.top_clients || []).map((client, index) => (
                    <TableRow key={index}>
                      <TableCell>{client.client_name}</TableCell>
                      <TableCell align="right">
                        {financialReportsService.formatCurrency(client.total_revenue)}
                      </TableCell>
                      <TableCell align="right">
                        {financialReportsService.formatCurrency(client.total_outstanding)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Monthly Trends Chart Placeholder */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Monthly Trends</Typography>
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Chart visualization would go here
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const renderRevenueTab = () => (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Revenue Summary</Typography>
          <Button
            startIcon={<DownloadIcon />}
            onClick={() => handleExport(revenueData.invoices || [], 'revenue-summary')}
            disabled={!revenueData.invoices?.length}
          >
            Export CSV
          </Button>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="success.main">
                  {financialReportsService.formatCurrency(revenueData.summary?.total_revenue || 0)}
                </Typography>
                <Typography variant="body2">Total Revenue</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary.main">
                  {financialReportsService.formatCurrency(revenueData.summary?.total_paid || 0)}
                </Typography>
                <Typography variant="body2">Total Paid</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  {financialReportsService.formatCurrency(revenueData.summary?.total_outstanding || 0)}
                </Typography>
                <Typography variant="body2">Outstanding</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">
                  {revenueData.summary?.invoice_count || 0}
                </Typography>
                <Typography variant="body2">Total Invoices</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(revenueData.invoices || []).map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.client?.name}</TableCell>
                  <TableCell>{invoice.project?.name || '-'}</TableCell>
                  <TableCell>{financialReportsService.formatDate(invoice.issue_date)}</TableCell>
                  <TableCell align="right">
                    {financialReportsService.formatCurrency(invoice.total_amount)}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={invoice.status} 
                      size="small" 
                      color={invoice.status === 'paid' ? 'success' : 'warning'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  const renderProfitLossTab = () => (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Profit & Loss Statement</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Period: {financialReportsService.formatDate(startDate)} - {financialReportsService.formatDate(endDate)}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="success.main" gutterBottom>Revenue</Typography>
            <Box sx={{ pl: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Total Revenue</Typography>
                <Typography fontWeight="bold">
                  {financialReportsService.formatCurrency(profitLossData.revenue?.total_revenue || 0)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  ({profitLossData.revenue?.invoice_count || 0} invoices)
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="error.main" gutterBottom>Expenses</Typography>
            <Box sx={{ pl: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Total Expenses</Typography>
                <Typography fontWeight="bold">
                  {financialReportsService.formatCurrency(profitLossData.expenses?.total_expenses || 0)}
                </Typography>
              </Box>
              {(profitLossData.expenses?.by_category || []).map((category, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    {category.category}
                  </Typography>
                  <Typography variant="body2">
                    {financialReportsService.formatCurrency(category.amount)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider />
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Profit Summary</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Gross Profit</Typography>
                <Typography 
                  fontWeight="bold"
                  color={profitLossData.profit?.gross_profit >= 0 ? 'success.main' : 'error.main'}
                >
                  {financialReportsService.formatCurrency(profitLossData.profit?.gross_profit || 0)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Net Profit</Typography>
                <Typography 
                  variant="h6"
                  color={profitLossData.profit?.net_profit >= 0 ? 'success.main' : 'error.main'}
                >
                  {financialReportsService.formatCurrency(profitLossData.profit?.net_profit || 0)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Profit Margin</Typography>
                <Typography fontWeight="bold">
                  {financialReportsService.formatPercentage(profitLossData.profit?.profit_margin || 0)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Financial Reports
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={loadFinancialReports}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                slots={{ textField: TextField }}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                slots={{ textField: TextField }}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Year"
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Dashboard" icon={<DashboardIcon />} />
            <Tab label="Revenue" icon={<RevenueIcon />} />
            <Tab label="Profit & Loss" icon={<ProfitIcon />} />
            <Tab label="Client Performance" icon={<ClientsIcon />} />
            <Tab label="Monthly Trends" icon={<TrendsIcon />} />
          </Tabs>
        </Paper>

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Tab Content */}
        {!loading && (
          <>
            {activeTab === 0 && renderDashboardTab()}
            {activeTab === 1 && renderRevenueTab()}
            {activeTab === 2 && renderProfitLossTab()}
            {activeTab === 3 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6">Client Performance - Coming Soon</Typography>
              </Box>
            )}
            {activeTab === 4 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6">Monthly Trends - Coming Soon</Typography>
              </Box>
            )}
          </>
        )}

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
    </LocalizationProvider>
  );
};

export default FinancialReports;