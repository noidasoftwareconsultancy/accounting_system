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
  Grid,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import savedReportService from '../../services/savedReportService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SavedReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuReport, setMenuReport] = useState(null);
  
  // Form states
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await savedReportService.getMyReports();
      setReports(response.data.reports || []);
    } catch (err) {
      setError('Failed to fetch saved reports');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, report) => {
    setAnchorEl(event.currentTarget);
    setMenuReport(report);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuReport(null);
  };

  const handleView = (report) => {
    setSelectedReport(report);
    setOpenViewDialog(true);
    handleMenuClose();
  };

  const handleEdit = (report) => {
    setSelectedReport(report);
    setEditName(report.name);
    setOpenEditDialog(true);
    handleMenuClose();
  };

  const handleUpdateName = async () => {
    try {
      await savedReportService.update(selectedReport.id, { name: editName });
      setSuccess('Report name updated successfully');
      setOpenEditDialog(false);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update report');
    }
  };

  const handleRegenerate = async (report) => {
    try {
      setLoading(true);
      await savedReportService.regenerate(report.id);
      setSuccess('Report data regenerated successfully');
      fetchReports();
      handleMenuClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to regenerate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (report) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await savedReportService.delete(report.id);
        setSuccess('Report deleted successfully');
        fetchReports();
        handleMenuClose();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete report');
      }
    }
  };

  const handleExport = async (report, format) => {
    try {
      await savedReportService.exportData(report.id, format);
      setSuccess(`Report exported as ${format.toUpperCase()} successfully`);
      handleMenuClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export report');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRowCount = (report) => {
    return report.result_data?.rowCount || 0;
  };

  const renderReportData = (data) => {
    if (!data || !Array.isArray(data)) {
      return <Typography>No data available</Typography>;
    }

    if (data.length === 0) {
      return <Typography>No records found</Typography>;
    }

    const headers = Object.keys(data[0]);
    
    return (
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header}>
                  <Typography variant="subtitle2">
                    {header.replace(/_/g, ' ').toUpperCase()}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(0, 100).map((row, index) => (
              <TableRow key={index}>
                {headers.map((header) => (
                  <TableCell key={header}>
                    {typeof row[header] === 'number' 
                      ? row[header].toLocaleString()
                      : String(row[header] || '')
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Saved Reports
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchReports}
        >
          Refresh
        </Button>
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
                  <TableCell>Report Name</TableCell>
                  <TableCell>Template</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Records</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {report.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {report.template?.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.template?.report_type}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRowCount(report)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(report.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(report.updated_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, report)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleView(menuReport)}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Data</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEdit(menuReport)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Name</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleRegenerate(menuReport)}>
          <ListItemIcon>
            <RefreshIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Regenerate</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport(menuReport, 'csv')}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport(menuReport, 'json')}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export JSON</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDelete(menuReport)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* View Report Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedReport?.name}
          <Typography variant="body2" color="text.secondary">
            Template: {selectedReport?.template?.name} | 
            Records: {getRowCount(selectedReport)} | 
            Generated: {selectedReport && formatDate(selectedReport.created_at)}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedReport?.result_data?.data && renderReportData(selectedReport.result_data.data)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
          <Button
            variant="outlined"
            onClick={() => handleExport(selectedReport, 'csv')}
          >
            Export CSV
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Name Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Report Name</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Report Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateName} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SavedReports;