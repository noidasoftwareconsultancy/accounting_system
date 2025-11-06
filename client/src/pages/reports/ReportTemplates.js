import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as ExecuteIcon,
  GetApp as InstallIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import reportTemplateService from '../../services/reportTemplateService';
import savedReportService from '../../services/savedReportService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ReportTemplates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [predefinedTemplates, setPredefinedTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openExecuteDialog, setOpenExecuteDialog] = useState(false);
  const [openPredefinedDialog, setOpenPredefinedDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    report_type: '',
    query_template: '',
    parameters: {}
  });
  
  const [executeParams, setExecuteParams] = useState({});
  const [reportName, setReportName] = useState('');

  const reportTypes = [
    { value: 'financial', label: 'Financial' },
    { value: 'expense', label: 'Expense' },
    { value: 'payroll', label: 'Payroll' },
    { value: 'accounting', label: 'Accounting' },
    { value: 'tax', label: 'Tax' },
    { value: 'custom', label: 'Custom' }
  ];

  useEffect(() => {
    fetchTemplates();
    fetchPredefinedTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await reportTemplateService.getAll();
      setTemplates(response.data.templates || []);
    } catch (err) {
      setError('Failed to fetch report templates');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPredefinedTemplates = async () => {
    try {
      const response = await reportTemplateService.getPredefinedTemplates();
      setPredefinedTemplates(response.data || []);
    } catch (err) {
      console.error('Error fetching predefined templates:', err);
    }
  };

  const handleOpenDialog = (template = null) => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || '',
        report_type: template.report_type,
        query_template: template.query_template || '',
        parameters: template.parameters || {}
      });
      setSelectedTemplate(template);
      setIsEditing(true);
    } else {
      setFormData({
        name: '',
        description: '',
        report_type: '',
        query_template: '',
        parameters: {}
      });
      setSelectedTemplate(null);
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTemplate(null);
    setFormData({
      name: '',
      description: '',
      report_type: '',
      query_template: '',
      parameters: {}
    });
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await reportTemplateService.update(selectedTemplate.id, formData);
        setSuccess('Template updated successfully');
      } else {
        await reportTemplateService.create(formData);
        setSuccess('Template created successfully');
      }
      handleCloseDialog();
      fetchTemplates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save template');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await reportTemplateService.delete(id);
        setSuccess('Template deleted successfully');
        fetchTemplates();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete template');
      }
    }
  };

  const handleExecute = (template) => {
    setSelectedTemplate(template);
    setExecuteParams({});
    setReportName(`${template.name} - ${new Date().toLocaleDateString()}`);
    setOpenExecuteDialog(true);
  };

  const handleExecuteSubmit = async () => {
    try {
      await savedReportService.executeAndSave(
        selectedTemplate.id,
        executeParams,
        reportName
      );
      setSuccess('Report executed and saved successfully');
      setOpenExecuteDialog(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to execute report');
    }
  };

  const handleInstallPredefined = async (index) => {
    try {
      await reportTemplateService.installPredefinedTemplate(index);
      setSuccess('Predefined template installed successfully');
      fetchTemplates();
      setOpenPredefinedDialog(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to install template');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      financial: 'primary',
      expense: 'secondary',
      payroll: 'success',
      accounting: 'info',
      tax: 'warning',
      custom: 'default'
    };
    return colors[type] || 'default';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Report Templates
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<InstallIcon />}
            onClick={() => setOpenPredefinedDialog(true)}
            sx={{ mr: 2 }}
          >
            Install Predefined
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Create Template
          </Button>
        </Box>
      </Box>

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

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Reports</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {template.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={template.report_type}
                        color={getTypeColor(template.report_type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {template.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {template.creator?.first_name} {template.creator?.last_name}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={template._count?.saved_reports || 0}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Execute Template">
                        <IconButton
                          size="small"
                          onClick={() => handleExecute(template)}
                          color="primary"
                        >
                          <ExecuteIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Template">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(template)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Template">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(template.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create/Edit Template Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Template' : 'Create Template'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Template Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Report Type"
                value={formData.report_type}
                onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
                required
              >
                {reportTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="SQL Query Template"
                value={formData.query_template}
                onChange={(e) => setFormData({ ...formData, query_template: e.target.value })}
                multiline
                rows={6}
                placeholder="SELECT * FROM table WHERE date >= '{{start_date}}' AND date <= '{{end_date}}'"
                helperText="Use {{parameter_name}} for dynamic parameters"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Execute Template Dialog */}
      <Dialog open={openExecuteDialog} onClose={() => setOpenExecuteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Execute Report Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Report Name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                required
              />
            </Grid>
            {selectedTemplate?.parameters && Object.keys(selectedTemplate.parameters).map((param) => (
              <Grid item xs={12} key={param}>
                <TextField
                  fullWidth
                  label={selectedTemplate.parameters[param].label || param}
                  type={selectedTemplate.parameters[param].type === 'date' ? 'date' : 'text'}
                  value={executeParams[param] || ''}
                  onChange={(e) => setExecuteParams({ ...executeParams, [param]: e.target.value })}
                  InputLabelProps={selectedTemplate.parameters[param].type === 'date' ? { shrink: true } : {}}
                  required={selectedTemplate.parameters[param].required}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExecuteDialog(false)}>Cancel</Button>
          <Button onClick={handleExecuteSubmit} variant="contained">
            Execute & Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Predefined Templates Dialog */}
      <Dialog open={openPredefinedDialog} onClose={() => setOpenPredefinedDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Install Predefined Templates</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {predefinedTemplates.map((template, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6">{template.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {template.description}
                        </Typography>
                        <Chip
                          label={template.report_type}
                          color={getTypeColor(template.report_type)}
                          size="small"
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        startIcon={<InstallIcon />}
                        onClick={() => handleInstallPredefined(index)}
                      >
                        Install
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPredefinedDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportTemplates;