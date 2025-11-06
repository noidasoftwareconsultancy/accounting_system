import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Paper,
  useTheme,
  alpha,
  Tab,
  Tabs,
  Avatar
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Add,
  MoreVert,
  Business,
  Email,
  Phone,
  LocationOn,
  CreditCard,
  Receipt,
  Work,
  Description,
  AttachMoney,
  CalendarToday
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import clientService from '../../services/clientService';
import { useApp } from '../../contexts/AppContext';

const ClientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const { addNotification } = useApp();

  const [client, setClient] = useState(null);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchClient();
    fetchFinancialSummary();
  }, [id]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const response = await clientService.getById(id);
      setClient(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching client:', err);
      setError('Failed to fetch client details');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch client details'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialSummary = async () => {
    try {
      const response = await clientService.getClientFinancialSummary(id);
      setFinancialSummary(response.data);
    } catch (err) {
      console.error('Error fetching financial summary:', err);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await clientService.delete(id);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Client deleted successfully'
        });
        navigate('/clients');
      } catch (err) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete client'
        });
      }
    }
    handleMenuClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: client?.currency || 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'success',
      'inactive': 'default',
      'draft': 'default',
      'sent': 'info',
      'paid': 'success',
      'partially_paid': 'warning',
      'overdue': 'error'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading client details...</Typography>
      </Box>
    );
  }

  if (error || !client) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Client not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/clients')}
        >
          Back to Clients
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/clients')}>
            <ArrowBack />
          </IconButton>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <Business />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1">
              {client.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Client Details
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/clients/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate(`/invoices/new?client=${id}`)}
          >
            Create Invoice
          </Button>
          <IconButton onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Client Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Client Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Business fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      Company Name
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {client.name}
                  </Typography>
                </Grid>

                {client.email && (
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">
                        Email
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {client.email}
                    </Typography>
                  </Grid>
                )}

                {client.phone && (
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">
                        Phone
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {client.phone}
                    </Typography>
                  </Grid>
                )}

                {client.address && (
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">
                        Address
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {client.address}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <CreditCard fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      Currency
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {client.currency}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      Payment Terms
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {client.payment_terms} days
                  </Typography>
                </Grid>

                {client.tax_id && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Tax ID
                    </Typography>
                    <Typography variant="body1">
                      {client.tax_id}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="textSecondary">
                    Created: {format(new Date(client.created_at), 'MMMM dd, yyyy HH:mm')}
                  </Typography>
                  {client.updated_at !== client.created_at && (
                    <Typography variant="body2" color="textSecondary">
                      Updated: {format(new Date(client.updated_at), 'MMMM dd, yyyy HH:mm')}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Tabs for Projects, Invoices, Contracts */}
          <Card sx={{ mt: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab label={`Projects (${client._count?.projects || 0})`} />
                <Tab label={`Invoices (${client._count?.invoices || 0})`} />
                <Tab label="Contracts" />
              </Tabs>
            </Box>

            {/* Projects Tab */}
            {activeTab === 0 && (
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Projects</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => navigate(`/projects/new?client=${id}`)}
                  >
                    New Project
                  </Button>
                </Box>
                {client.projects && client.projects.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Project Name</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Budget</TableCell>
                          <TableCell>Start Date</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {client.projects.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell>{project.name}</TableCell>
                            <TableCell>
                              <Chip
                                label={project.status}
                                color={getStatusColor(project.status)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {project.budget ? formatCurrency(project.budget) : '-'}
                            </TableCell>
                            <TableCell>
                              {project.start_date ? format(new Date(project.start_date), 'MMM dd, yyyy') : '-'}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                onClick={() => navigate(`/projects/${project.id}`)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="textSecondary" textAlign="center" py={4}>
                    No projects found for this client
                  </Typography>
                )}
              </CardContent>
            )}

            {/* Invoices Tab */}
            {activeTab === 1 && (
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Recent Invoices</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => navigate(`/invoices/new?client=${id}`)}
                  >
                    New Invoice
                  </Button>
                </Box>
                {client.invoices && client.invoices.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Invoice #</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Due Date</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {client.invoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell>{invoice.invoice_number}</TableCell>
                            <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                            <TableCell>
                              <Chip
                                label={invoice.status}
                                color={getStatusColor(invoice.status)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                onClick={() => navigate(`/invoices/${invoice.id}`)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="textSecondary" textAlign="center" py={4}>
                    No invoices found for this client
                  </Typography>
                )}
              </CardContent>
            )}

            {/* Contracts Tab */}
            {activeTab === 2 && (
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Contracts</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => navigate(`/contracts/new?client=${id}`)}
                  >
                    New Contract
                  </Button>
                </Box>
                {client.contracts && client.contracts.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Value</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Start Date</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {client.contracts.map((contract) => (
                          <TableRow key={contract.id}>
                            <TableCell>{contract.title}</TableCell>
                            <TableCell>
                              {contract.value ? formatCurrency(contract.value) : '-'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={contract.status}
                                color={getStatusColor(contract.status)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {format(new Date(contract.start_date), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                onClick={() => navigate(`/contracts/${contract.id}`)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="textSecondary" textAlign="center" py={4}>
                    No contracts found for this client
                  </Typography>
                )}
              </CardContent>
            )}
          </Card>
        </Grid>

        {/* Financial Summary */}
        <Grid item xs={12} md={4}>
          {financialSummary && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Financial Summary
                </Typography>

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Total Invoices:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {financialSummary.summary.totalInvoices}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Paid Invoices:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" color="success.main">
                    {financialSummary.summary.paidInvoices}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Pending Invoices:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" color="warning.main">
                    {financialSummary.summary.pendingInvoices}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Overdue Invoices:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" color="error.main">
                    {financialSummary.summary.overdueInvoices}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Total Revenue:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {formatCurrency(financialSummary.summary.totalRevenue)}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Pending Amount:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="warning.main">
                    {formatCurrency(financialSummary.summary.pendingAmount)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Active Projects:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {financialSummary.summary.activeProjects}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">
                    Total Contracts:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {financialSummary.summary.totalContracts}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Receipt />}
                  onClick={() => navigate(`/invoices/new?client=${id}`)}
                >
                  Create Invoice
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Work />}
                  onClick={() => navigate(`/projects/new?client=${id}`)}
                >
                  Create Project
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Description />}
                  onClick={() => navigate(`/contracts/new?client=${id}`)}
                >
                  Create Contract
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/clients/${id}/edit`)}
                >
                  Edit Client
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/clients/${id}/edit`);
          handleMenuClose();
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Client
        </MenuItem>
        
        <MenuItem onClick={() => {
          navigate(`/invoices/new?client=${id}`);
          handleMenuClose();
        }}>
          <Receipt fontSize="small" sx={{ mr: 1 }} />
          Create Invoice
        </MenuItem>
        
        <MenuItem onClick={() => {
          navigate(`/projects/new?client=${id}`);
          handleMenuClose();
        }}>
          <Work fontSize="small" sx={{ mr: 1 }} />
          Create Project
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={handleDelete}
          sx={{ color: 'error.main' }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Client
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ClientDetail;