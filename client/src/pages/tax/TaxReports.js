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
    IconButton,
    Tooltip,
    CircularProgress
} from '@mui/material';
import {
    DatePicker,
    LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
    Assessment as ReportIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    TrendingUp as TrendingUpIcon,
    AccountBalance as TaxIcon,
    Receipt as ReceiptIcon,
    Gavel as ComplianceIcon
} from '@mui/icons-material';
import taxService from '../../services/taxService';
import { usePermissions } from '../../utils/permissions';

const TaxReports = () => {
    const { canManage } = usePermissions();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Filters
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1)); // Start of year
    const [endDate, setEndDate] = useState(new Date());
    const [transactionType, setTransactionType] = useState('');
    const [groupBy, setGroupBy] = useState('month');

    // Data
    const [taxSummary, setTaxSummary] = useState([]);
    const [taxCollection, setTaxCollection] = useState([]);
    const [taxLiability, setTaxLiability] = useState({});
    const [taxCompliance, setTaxCompliance] = useState([]);
    const [taxRecords, setTaxRecords] = useState([]);

    useEffect(() => {
        loadTaxReports();
    }, [startDate, endDate, transactionType, groupBy]);

    const loadTaxReports = async () => {
        try {
            setLoading(true);
            setError('');

            const params = {
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                transaction_type: transactionType || undefined,
                group_by: groupBy
            };

            const [summaryRes, collectionRes, liabilityRes, complianceRes, recordsRes] = await Promise.all([
                taxService.getTaxSummaryReport(params),
                taxService.getTaxCollectionReport(params),
                taxService.getTaxLiabilityReport(params),
                taxService.getTaxComplianceReport(params),
                taxService.getTaxRecords({ ...params, limit: 100 })
            ]);

            setTaxSummary(summaryRes.data || []);
            setTaxCollection(collectionRes.data || []);
            setTaxLiability(liabilityRes.data || {});
            setTaxCompliance(complianceRes.data || []);
            setTaxRecords(recordsRes.data?.taxRecords || []);

        } catch (err) {
            console.error('Load tax reports error:', err);
            setError(err.response?.data?.message || 'Failed to load tax reports');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (data, filename, format = 'csv') => {
        try {
            if (format === 'csv') {
                taxService.exportToCsv(data, filename);
            } else if (format === 'json') {
                taxService.exportToJson(data, filename);
            }
            setSuccess(`Report exported successfully as ${format.toUpperCase()}`);
        } catch (err) {
            setError('Failed to export report');
        }
    };

    const renderTaxSummaryTab = () => (
        <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
                {/* Summary Cards */}
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TaxIcon color="primary" />
                                <Typography variant="h6">Tax Collected</Typography>
                            </Box>
                            <Typography variant="h4" color="primary">
                                {taxService.formatCurrency(taxLiability.tax_collected || 0)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ReceiptIcon color="secondary" />
                                <Typography variant="h6">Tax Paid</Typography>
                            </Box>
                            <Typography variant="h4" color="secondary">
                                {taxService.formatCurrency(taxLiability.tax_paid || 0)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TrendingUpIcon color="info" />
                                <Typography variant="h6">Payroll Tax</Typography>
                            </Box>
                            <Typography variant="h4" color="info">
                                {taxService.formatCurrency(taxLiability.payroll_tax || 0)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ComplianceIcon color={taxLiability.net_tax_liability >= 0 ? 'error' : 'success'} />
                                <Typography variant="h6">Net Liability</Typography>
                            </Box>
                            <Typography
                                variant="h4"
                                color={taxLiability.net_tax_liability >= 0 ? 'error' : 'success'}
                            >
                                {taxService.formatCurrency(taxLiability.net_tax_liability || 0)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Tax Summary Table */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Tax Summary by Rate</Typography>
                            <Button
                                startIcon={<DownloadIcon />}
                                onClick={() => handleExport(taxSummary, 'tax-summary')}
                                disabled={taxSummary.length === 0}
                            >
                                Export CSV
                            </Button>
                        </Box>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Tax Name</TableCell>
                                        <TableCell>Tax Type</TableCell>
                                        <TableCell>Rate</TableCell>
                                        <TableCell align="right">Total Amount</TableCell>
                                        <TableCell align="right">Total Tax</TableCell>
                                        <TableCell align="right">Transactions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {taxSummary.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.tax_rate?.name}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.tax_rate?.type}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>{taxService.formatPercentage(item.tax_rate?.rate)}</TableCell>
                                            <TableCell align="right">
                                                {taxService.formatCurrency(item.total_amount)}
                                            </TableCell>
                                            <TableCell align="right">
                                                {taxService.formatCurrency(item.total_tax)}
                                            </TableCell>
                                            <TableCell align="right">{item.transaction_count}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );

    const renderTaxCollectionTab = () => (
        <Box sx={{ mt: 3 }}>
            <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Tax Collection by Period</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Group By</InputLabel>
                            <Select
                                value={groupBy}
                                label="Group By"
                                onChange={(e) => setGroupBy(e.target.value)}
                            >
                                <MenuItem value="day">Daily</MenuItem>
                                <MenuItem value="week">Weekly</MenuItem>
                                <MenuItem value="month">Monthly</MenuItem>
                                <MenuItem value="quarter">Quarterly</MenuItem>
                                <MenuItem value="year">Yearly</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            startIcon={<DownloadIcon />}
                            onClick={() => handleExport(taxCollection, 'tax-collection')}
                            disabled={taxCollection.length === 0}
                        >
                            Export CSV
                        </Button>
                    </Box>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Period</TableCell>
                                <TableCell>Transaction Type</TableCell>
                                <TableCell align="right">Total Amount</TableCell>
                                <TableCell align="right">Total Tax</TableCell>
                                <TableCell align="right">Transactions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {taxCollection.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.period}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={item.transaction_type}
                                            size="small"
                                            color={
                                                item.transaction_type === 'invoice' ? 'success' :
                                                    item.transaction_type === 'expense' ? 'warning' : 'info'
                                            }
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        {taxService.formatCurrency(parseFloat(item.total_amount))}
                                    </TableCell>
                                    <TableCell align="right">
                                        {taxService.formatCurrency(parseFloat(item.total_tax))}
                                    </TableCell>
                                    <TableCell align="right">{item.transaction_count}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );

    const renderTaxComplianceTab = () => (
        <Box sx={{ mt: 3 }}>
            <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Tax Compliance Report</Typography>
                    <Button
                        startIcon={<DownloadIcon />}
                        onClick={() => handleExport(taxCompliance, 'tax-compliance')}
                        disabled={taxCompliance.length === 0}
                    >
                        Export CSV
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Month</TableCell>
                                <TableCell>Tax Name</TableCell>
                                <TableCell>Tax Type</TableCell>
                                <TableCell>Rate</TableCell>
                                <TableCell>Transaction Type</TableCell>
                                <TableCell align="right">Total Amount</TableCell>
                                <TableCell align="right">Total Tax</TableCell>
                                <TableCell align="right">Transactions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {taxCompliance.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.month}</TableCell>
                                    <TableCell>{item.tax_name}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={item.tax_type}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>{taxService.formatPercentage(item.tax_rate)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={item.transaction_type}
                                            size="small"
                                            color={
                                                item.transaction_type === 'invoice' ? 'success' :
                                                    item.transaction_type === 'expense' ? 'warning' : 'info'
                                            }
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        {taxService.formatCurrency(parseFloat(item.total_amount))}
                                    </TableCell>
                                    <TableCell align="right">
                                        {taxService.formatCurrency(parseFloat(item.total_tax))}
                                    </TableCell>
                                    <TableCell align="right">{item.transaction_count}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );

    const renderTaxRecordsTab = () => (
        <Box sx={{ mt: 3 }}>
            <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Tax Records</Typography>
                    <Button
                        startIcon={<DownloadIcon />}
                        onClick={() => handleExport(taxRecords, 'tax-records')}
                        disabled={taxRecords.length === 0}
                    >
                        Export CSV
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Tax Rate</TableCell>
                                <TableCell>Transaction Type</TableCell>
                                <TableCell>Transaction ID</TableCell>
                                <TableCell align="right">Amount</TableCell>
                                <TableCell align="right">Tax Amount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {taxRecords.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell>{taxService.formatDate(record.date)}</TableCell>
                                    <TableCell>{record.tax_rate?.name}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={record.transaction_type}
                                            size="small"
                                            color={
                                                record.transaction_type === 'invoice' ? 'success' :
                                                    record.transaction_type === 'expense' ? 'warning' : 'info'
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>{record.transaction_id}</TableCell>
                                    <TableCell align="right">
                                        {taxService.formatCurrency(record.amount)}
                                    </TableCell>
                                    <TableCell align="right">
                                        {taxService.formatCurrency(record.tax_amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Tax Reports
                    </Typography>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={loadTaxReports}
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
                            <FormControl fullWidth size="small">
                                <InputLabel>Transaction Type</InputLabel>
                                <Select
                                    value={transactionType}
                                    label="Transaction Type"
                                    onChange={(e) => setTransactionType(e.target.value)}
                                >
                                    <MenuItem value="">All Types</MenuItem>
                                    <MenuItem value="invoice">Invoice</MenuItem>
                                    <MenuItem value="expense">Expense</MenuItem>
                                    <MenuItem value="payroll">Payroll</MenuItem>
                                </Select>
                            </FormControl>
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
                        <Tab label="Tax Summary" icon={<ReportIcon />} />
                        <Tab label="Tax Collection" icon={<TrendingUpIcon />} />
                        <Tab label="Tax Compliance" icon={<ComplianceIcon />} />
                        <Tab label="Tax Records" icon={<ReceiptIcon />} />
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
                        {activeTab === 0 && renderTaxSummaryTab()}
                        {activeTab === 1 && renderTaxCollectionTab()}
                        {activeTab === 2 && renderTaxComplianceTab()}
                        {activeTab === 3 && renderTaxRecordsTab()}
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

export default TaxReports;