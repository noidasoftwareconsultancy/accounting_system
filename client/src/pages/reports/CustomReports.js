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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Menu,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as ExecuteIcon,
  Visibility as ViewIcon,
  Assessment as ReportIcon,
  MoreVert as MoreVertIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import reportsService from '../../services/reportsService';
import { useAuth } from '../../contexts/AuthContext';
import { canManageAccounting } from '../../utils/permissions';

const CustomReports = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [reportTemplates, setReportTemplates] = useState([]);
  const [savedReports, setSavedReports] = useState([]);
  const [reportTypes, setReportTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [openExecuteDialog, setOpenExecuteDialog] = useState(false);
  const [openResultDialog, setOpenResultDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [executingTemplate, setExecutingTemplate] = useState(null);
  const [reportResult, setReportResult] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Form states
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    report_type: '',
    query_template: '',
    parameters: {}
  });

  const [executionParams, setExecutionParams] = useState({});
  const [saveExecution, setSaveExecution] = useState(false);

  // Check if user can manage reports
  const canManage = canManageAccounting(user);

  console.log('CustomReports component loaded', { user, canManage });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (tabValue === 0) {
      loadReportTemplates();
    } else {
      loadSavedReports();
    }
  }, [tabValue]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading report data...');
      
      // Load report types first
      try {
        const typesRes = await reportsService.getReportTypes();
        console.log('Report types loaded:', typesRes);
        setReportTypes(typesRes.data || []);
      } catch (typeErr) {
        console.warn('Failed to load report types, using fallback:', typeErr);
        // Fallback report types
        setReportTypes([
          { id: 'financial_summary', name: 'Financial Summary', description: 'Overview of revenue, expenses, and net income' },
          { id: 'income_statement', name: 'Income Statement', description: 'Detailed profit and loss statement' },
          { id: 'balance_sheet', name: 'Balance Sheet', description: 'Assets, liabilities, and equity' },
          { id: 'cash_flow', name: 'Cash Flow Statement', description: 'Cash inflows and outflows' }
        ]);
      }
      
      // Load templates or saved reports based on current tab
      if (tabValue === 0) {
        await loadReportTemplates();
      } else {
        await loadSavedReports();
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(`Failed to load data: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadReportTemplates = async () => {
    try {
      console.log('Loading report templates...');
      const response = await reportsService.getReportTemplates();
      console.log('Report templates response:', response);
      setReportTemplates(response.data?.templates || []);
    } catch (err) {
      console.error('Error loading report templates:', err);
      // Don't show error for templates, just show empty state
      setReportTemplates([]);
      console.warn('No report templates available or API error:', err.message);
    }
  };

  const loadSavedReports = async () => {
    try {
      console.log('Loading saved reports...');
      const response = await reportsService.getSavedReports();
      console.log('Saved reports response:', response);
      setSavedReports(response.data?.reports || []);
    } catch (err) {
      console.error('Error loading saved reports:', err);
      // Don't show error for saved reports, just show empty state
      setSavedReports([]);
      console.warn('No saved reports available or API error:', err.message);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      if (editingTemplate) {
        await reportsService.updateReportTemplate(editingTemplate.id, templateForm);
        setSuccess('Report template updated successfully');
      } else {
        await reportsService.createReportTemplate(templateForm);
        setSuccess('Report template created successfully');
      }
      
      handleCloseTemplateDialog();
      loadReportTemplates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save report template');
    }
  };

  const handleExecuteReport = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      
      const result = await reportsService.executeReport(
        executingTemplate.id, 
        executionParams, 
        saveExecution
      );
      
      setReportResult(result.data);
      setOpenResultDialog(true);
      setOpenExecuteDialog(false);
      
      if (saveExecution) {
        setSuccess('Report executed and saved successfully');
        loadSavedReports();
      } else {
        setSuccess('Report executed successfully');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to execute report');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description || '',
      report_type: template.report_type,
      query_template: template.query_template || '',
      parameters: template.parameters || {}
    });
    setOpenTemplateDialog(true);
    setAnchorEl(null);
  };

  const handleDeleteTemplate = async (template) => {
    if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      try {
        await reportsService.deleteReportTemplate(template.id);
        setSuccess('Report template deleted successfully');
        loadReportTemplates();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete report template');
      }
    }
    setAnchorEl(null);
  };

  const handleExecuteTemplate = (template) => {
    setExecutingTemplate(template);
    setExecutionParams({});
    setSaveExecution(false);
    setOpenExecuteDialog(true);
    setAnchorEl(null);
  };

  const handleViewSavedReport = async (report) => {
    try {
      const response = await reportsService.getSavedReport(report.id);
      setReportResult(response.data.result_data);
      setOpenResultDialog(true);
    } catch (err) {
      setError('Failed to load saved report');
    }
    setAnchorEl(null);
  };

  const handleDeleteSavedReport = async (report) => {
    if (window.confirm(`Are you sure you want to delete "${report.name}"?`)) {
      try {
        await reportsService.deleteSavedReport(report.id);
        setSuccess('Saved report deleted successfully');
        loadSavedReports();
      } catch (err) {
        setError('Failed to delete saved report');
      }
    }
    setAnchorEl(null);
  };

  const handleExportReport = (format) => {
    if (!reportResult || !reportResult.data) {
      setError('No data to export');
      return;
    }

    const filename = `report_${new Date().toISOString().split('T')[0]}`;
    
    try {
      if (format === 'csv') {
        // Try to find tabular data in the report result
        let dataToExport = [];
        
        if (Array.isArray(reportResult.data)) {
          dataToExport = reportResult.data;
        } else if (reportResult.data.detailed_expenses) {
          dataToExport = reportResult.data.detailed_expenses;
        } else if (reportResult.data.receivables) {
          dataToExport = reportResult.data.receivables;
        } else if (reportResult.data.transactions) {
          dataToExport = reportResult.data.transactions;
        }
        
        if (dataToExport.length > 0) {
          reportsService.exportToCsv(dataToExport, filename);
        } else {
          setError('No tabular data found to export as CSV');
        }
      } else if (format === 'json') {
        reportsService.exportToJson(reportResult.data, filename);
      }
    } catch (err) {
      setError('Failed to export report');
    }
  };

  const handleCloseTemplateDialog = () => {
    setOpenTemplateDialog(false);
    setEditingTemplate(null);
    setTemplateForm({
      name: '',
      description: '',
      report_type: '',
      query_template: '',
      parameters: {}
    });
  };

  const renderParameterInput = (param, value, onChange) => {
    switch (param.type) {
      case 'date':
        return (
          <DatePicker
            label={param.label}
            value={value ? new Date(value) : null}
            onChange={(newValue) => onChange(param.name, newValue?.toISOString().split('T')[0])}
            slots={{ textField: TextField }}
            slotProps={{ 
              textField: { 
                fullWidth: true, 
                required: param.required,
                error: param.required && !value,
                helperText: param.required && !value ? 'This field is required' : ''
              } 
            }}
          />
        );
      case 'select':
        return (
          <FormControl fullWidth required={param.required}>
            <InputLabel>{param.label}</InputLabel>
            <Select
              value={value || ''}
              label={param.label}
              onChange={(e) => onChange(param.name, e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {/* Options would be loaded dynamically based on param.options */}
            </Select>
          </FormControl>
        );
      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label={param.label}
            value={value || ''}
            onChange={(e) => onChange(param.name, e.target.value)}
            required={param.required}
            error={param.required && !value}
            helperText={param.required && !value ? 'This field is required' : ''}
          />
        );
      default:
        return (
          <TextField
            fullWidth
            label={param.label}
            value={value || ''}
            onChange={(e) => onChange(param.name, e.target.value)}
            required={param.required}
            error={param.required && !value}
            helperText={param.required && !value ? 'This field is required' : ''}
          />
        );
    }
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

  if (loading && reportTemplates.length === 0 && savedReports.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const selectedReportType = reportTypes.find(type => type.id === templateForm.report_type);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Custom Reports</Typography>
          {canManage && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setOpenTemplateDialog(true)}
            >
              Create Template
            </Button>
          )}
        </Box>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
            <Typography variant="caption">
              Debug: Templates: {reportTemplates.length}, Types: {reportTypes.length}, 
              User: {user?.email}, Can Manage: {canManage ? 'Yes' : 'No'}
            </Typography>
          </Paper>
        )}

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

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Report Templates" />
            <Tab label="Saved Reports" />
          </Tabs>
        </Paper>

        {/* Content */}
        {tabValue === 0 ? (
          /* Report Templates */
          <Box>
            {reportTemplates.length === 0 && !loading ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <ReportIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Report Templates Found
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {canManage 
                    ? "Create your first report template to get started with custom reporting."
                    : "No report templates are available. Contact your administrator to create report templates."
                  }
                </Typography>
                {canManage && (
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button 
                      variant="contained" 
                      startIcon={<AddIcon />}
                      onClick={() => setOpenTemplateDialog(true)}
                    >
                      Create First Template
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={async () => {
                        try {
                          console.log('Testing API connection...');
                          const response = await reportsService.testConnection();
                          console.log('API test successful:', response);
                          setSuccess(`API test successful! ${response.message}`);
                        } catch (err) {
                          console.error('API test failed:', err);
                          setError(`API test failed: ${err.response?.data?.message || err.message}`);
                        }
                      }}
                    >
                      Test API
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={async () => {
                        try {
                          const sampleTemplate = {
                            name: 'Sample Financial Summary',
                            description: 'A sample financial summary report for testing',
                            report_type: 'financial_summary',
                            parameters: {}
                          };
                          console.log('Creating sample template:', sampleTemplate);
                          await reportsService.createReportTemplate(sampleTemplate);
                          setSuccess('Sample template created successfully');
                          loadReportTemplates();
                        } catch (err) {
                          console.error('Sample template creation error:', err);
                          setError(`Failed to create sample template: ${err.response?.data?.message || err.message}`);
                        }
                      }}
                    >
                      Create Sample Template
                    </Button>
                  </Box>
                )}
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {reportTemplates.map(template => (
                  <Grid item xs={12} md={6} lg={4} key={template.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <ReportIcon color="primary" />
                          <Typography variant="h6" component="div">
                            {template.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {template.description}
                        </Typography>
                        <Chip 
                          label={reportTypes.find(t => t.id === template.report_type)?.name || template.report_type}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          Created by {template.creator?.first_name} {template.creator?.last_name}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          startIcon={<ExecuteIcon />}
                          onClick={() => handleExecuteTemplate(template)}
                        >
                          Execute
                        </Button>
                        {canManage && (
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              setAnchorEl(e.currentTarget);
                              setSelectedItem(template);
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        ) : (
          /* Saved Reports */
          <Box>
            {savedReports.length === 0 && !loading ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <ReportIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Saved Reports Found
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Execute reports and choose to save them to see them here.
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => setTabValue(0)}
                >
                  Go to Templates
                </Button>
              </Paper>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Report Name</TableCell>
                      <TableCell>Template</TableCell>
                      <TableCell>Created By</TableCell>
                      <TableCell>Created Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {savedReports.map(report => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ReportIcon fontSize="small" />
                            {report.name}
                          </Box>
                        </TableCell>
                        <TableCell>{report.template?.name}</TableCell>
                        <TableCell>
                          {report.creator?.first_name} {report.creator?.last_name}
                        </TableCell>
                        <TableCell>{formatDate(report.created_at)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Report">
                              <IconButton size="small" onClick={() => handleViewSavedReport(report)}>
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteSavedReport(report)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItemComponent onClick={() => handleExecuteTemplate(selectedItem)}>
            <ListItemIcon><ExecuteIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Execute</ListItemText>
          </MenuItemComponent>
          {canManage && (
            <>
              <MenuItemComponent onClick={() => handleEditTemplate(selectedItem)}>
                <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItemComponent>
              <MenuItemComponent onClick={() => handleDeleteTemplate(selectedItem)}>
                <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItemComponent>
            </>
          )}
        </Menu>

        {/* Template Dialog */}
        <Dialog open={openTemplateDialog} onClose={handleCloseTemplateDialog} maxWidth="md" fullWidth>
          <form onSubmit={handleCreateTemplate}>
            <DialogTitle>
              {editingTemplate ? 'Edit Report Template' : 'Create Report Template'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Template Name"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Report Type</InputLabel>
                    <Select
                      value={templateForm.report_type}
                      label="Report Type"
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, report_type: e.target.value }))}
                    >
                      {reportTypes.map(type => (
                        <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </Grid>
                {templateForm.report_type === 'custom_query' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="SQL Query Template"
                      multiline
                      rows={6}
                      value={templateForm.query_template}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, query_template: e.target.value }))}
                      placeholder="SELECT * FROM table_name WHERE date >= '{{start_date}}'"
                      helperText="Use {{parameter_name}} for dynamic parameters. Only SELECT queries are allowed."
                      required
                    />
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseTemplateDialog}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editingTemplate ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Execute Report Dialog */}
        <Dialog open={openExecuteDialog} onClose={() => setOpenExecuteDialog(false)} maxWidth="sm" fullWidth>
          <form onSubmit={handleExecuteReport}>
            <DialogTitle>Execute Report: {executingTemplate?.name}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {selectedReportType?.parameters?.map(param => (
                  <Grid item xs={12} key={param.name}>
                    {renderParameterInput(
                      param,
                      executionParams[param.name],
                      (name, value) => setExecutionParams(prev => ({ ...prev, [name]: value }))
                    )}
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={saveExecution}
                        onChange={(e) => setSaveExecution(e.target.checked)}
                      />
                    }
                    label="Save this report execution"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenExecuteDialog(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={20} /> : 'Execute'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Report Result Dialog */}
        <Dialog open={openResultDialog} onClose={() => setOpenResultDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Report Results</Typography>
              <Box>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExportReport('csv')}
                  sx={{ mr: 1 }}
                >
                  CSV
                </Button>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExportReport('json')}
                >
                  JSON
                </Button>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            {reportResult && (
              <Box>
                {/* Report Summary */}
                {reportResult.data?.summary && (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Summary</Typography>
                      <Grid container spacing={2}>
                        {Object.entries(reportResult.data.summary).map(([key, value]) => (
                          <Grid item xs={6} md={3} key={key}>
                            <Typography variant="body2" color="text.secondary">
                              {key.replace(/_/g, ' ').toUpperCase()}
                            </Typography>
                            <Typography variant="h6">
                              {typeof value === 'number' && key.includes('amount') ? 
                                formatCurrency(value) : value}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* Raw Data Display */}
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Data</Typography>
                  <pre style={{ 
                    whiteSpace: 'pre-wrap', 
                    fontSize: '0.875rem',
                    maxHeight: '400px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(reportResult.data, null, 2)}
                  </pre>
                </Paper>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenResultDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default CustomReports;