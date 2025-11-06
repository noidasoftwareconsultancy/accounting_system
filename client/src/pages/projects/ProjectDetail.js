import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Avatar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Skeleton,
  useTheme,
  useMediaQuery,
  Fade,
  alpha
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  MoreVert,
  Business,
  CalendarToday,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  Assignment,
  CheckCircle,
  Schedule,
  PlayArrow,
  Pause,
  Assessment,
  Add,
  Visibility
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import projectService from '../../services/projectService';
import { useApp } from '../../contexts/AppContext';

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { addNotification } = useApp();

  // State management
  const [project, setProject] = useState(null);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    loadProject();
    loadFinancialSummary();
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProject(id);
      setProject(response.data);
      setError(null);
    } catch (error) {
      console.error('Error loading project:', error);
      setError('Failed to load project details');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load project details'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFinancialSummary = async () => {
    try {
      const response = await projectService.getProjectFinancialSummary(id);
      setFinancialSummary(response.data);
    } catch (error) {
      console.error('Error loading financial summary:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'on_hold': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <PlayArrow fontSize="small" />;
      case 'completed': return <CheckCircle fontSize="small" />;
      case 'on_hold': return <Pause fontSize="small" />;
      case 'cancelled': return <Delete fontSize="small" />;
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
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateProgress = () => {
    if (!project?.budget || !financialSummary) return 0;
    return Math.min((financialSummary.totalExpenses / project.budget) * 100, 100);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="300px" height={48} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error || 'Project not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          mb: 4 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/projects')}
              sx={{ 
                borderRadius: 2,
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              Back to Projects
            </Button>
            <Box>
              <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700, mb: 1 }}>
                {project.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={getStatusIcon(project.status)}
                  label={project.status.replace('_', ' ').toUpperCase()}
                  color={getStatusColor(project.status)}
                  sx={{ fontWeight: 600 }}
                />
                <Typography variant="body2" color="textSecondary">
                  Client: {project.client?.name}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate(`/projects/${id}/edit`)}
              sx={{ borderRadius: 2 }}
            >
              Edit
            </Button>
            <IconButton onClick={handleMenuClick}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        {/* Project Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Basic Info Card */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Project Overview
                </Typography>
                
                {project.description && (
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                    {project.description}
                  </Typography>
                )}

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <CalendarToday color="action" fontSize="small" />
                      <Typography variant="body2" color="textSecondary">
                        Start Date
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {project.start_date ? formatDate(project.start_date) : 'Not set'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <CalendarToday color="action" fontSize="small" />
                      <Typography variant="body2" color="textSecondary">
                        End Date
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {project.end_date ? formatDate(project.end_date) : 'Not set'}
                    </Typography>
                  </Grid>

                  {project.department && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Business color="action" fontSize="small" />
                        <Typography variant="body2" color="textSecondary">
                          Department
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                        {project.department}
                      </Typography>
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Created by
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                        {project.creator?.first_name?.charAt(0)}
                      </Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {project.creator?.first_name} {project.creator?.last_name}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Financial Summary Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              borderRadius: 3, 
              height: '100%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Financial Summary
                </Typography>

                {project.budget && (
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Budget Usage
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {calculateProgress().toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={calculateProgress()}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: `${theme.palette.primary.main}15`,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4
                        }
                      }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 700, mt: 2, color: 'primary.main' }}>
                      {formatCurrency(project.budget)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Total Budget
                    </Typography>
                  </Box>
                )}

                {financialSummary && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        Revenue
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {formatCurrency(financialSummary.totalRevenue)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        Expenses
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'error.main' }}>
                        {formatCurrency(financialSummary.totalExpenses)}
                      </Typography>
                    </Box>
                    
                    <Divider />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Profit
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 700,
                          color: financialSummary.profit >= 0 ? 'success.main' : 'error.main'
                        }}
                      >
                        {financialSummary.profit >= 0 ? '+' : ''}{formatCurrency(financialSummary.profit)}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs Section */}
        <Card sx={{ borderRadius: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ px: 3 }}
            >
              <Tab label="Milestones" />
              <Tab label="Invoices" />
              <Tab label="Expenses" />
              <Tab label="Contracts" />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 3 }}>
            {/* Milestones Tab */}
            {activeTab === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Project Milestones
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Add Milestone
                  </Button>
                </Box>

                {project.milestones?.length > 0 ? (
                  <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Due Date</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {project.milestones.map((milestone) => (
                          <TableRow key={milestone.id}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {milestone.title}
                              </Typography>
                              {milestone.description && (
                                <Typography variant="caption" color="textSecondary">
                                  {milestone.description}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {milestone.due_date ? formatDate(milestone.due_date) : 'Not set'}
                            </TableCell>
                            <TableCell>
                              {milestone.amount ? formatCurrency(milestone.amount) : '-'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={milestone.status}
                                color={milestone.status === 'completed' ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton size="small">
                                <Edit fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Assignment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="textSecondary">
                      No milestones created yet
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Invoices Tab */}
            {activeTab === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Project Invoices
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    size="small"
                    sx={{ borderRadius: 2 }}
                    onClick={() => navigate(`/invoices/new?project_id=${id}`)}
                  >
                    Create Invoice
                  </Button>
                </Box>

                {project.invoices?.length > 0 ? (
                  <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Invoice #</TableCell>
                          <TableCell>Issue Date</TableCell>
                          <TableCell>Due Date</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {project.invoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {invoice.invoice_number}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {formatDate(invoice.issue_date)}
                            </TableCell>
                            <TableCell>
                              {formatDate(invoice.due_date)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(invoice.total_amount)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={invoice.status}
                                color={invoice.status === 'paid' ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                size="small"
                                onClick={() => navigate(`/invoices/${invoice.id}`)}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Receipt sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="textSecondary">
                      No invoices created yet
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Expenses Tab */}
            {activeTab === 2 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Project Expenses
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    size="small"
                    sx={{ borderRadius: 2 }}
                    onClick={() => navigate(`/expenses/new?project_id=${id}`)}
                  >
                    Add Expense
                  </Button>
                </Box>

                {project.expenses?.length > 0 ? (
                  <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Description</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {project.expenses.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {expense.description}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {formatDate(expense.expense_date)}
                            </TableCell>
                            <TableCell>
                              {expense.category?.name || 'Uncategorized'}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(expense.amount)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={expense.status}
                                color={expense.status === 'approved' ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                size="small"
                                onClick={() => navigate(`/expenses/${expense.id}`)}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CreditCard sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="textSecondary">
                      No expenses recorded yet
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Contracts Tab */}
            {activeTab === 3 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Project Contracts
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Add Contract
                  </Button>
                </Box>

                {project.contracts?.length > 0 ? (
                  <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Start Date</TableCell>
                          <TableCell>End Date</TableCell>
                          <TableCell>Value</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {project.contracts.map((contract) => (
                          <TableRow key={contract.id}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {contract.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {formatDate(contract.start_date)}
                            </TableCell>
                            <TableCell>
                              {contract.end_date ? formatDate(contract.end_date) : 'Ongoing'}
                            </TableCell>
                            <TableCell>
                              {contract.value ? formatCurrency(contract.value) : '-'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={contract.status}
                                color={contract.status === 'active' ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton size="small">
                                <Visibility fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Assignment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="textSecondary">
                      No contracts added yet
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => {
            navigate(`/projects/${id}/financial`);
            handleMenuClose();
          }}>
            <Assessment fontSize="small" sx={{ mr: 1 }} />
            Financial Report
          </MenuItem>
          <MenuItem onClick={() => {
            // Export functionality
            handleMenuClose();
          }}>
            <Receipt fontSize="small" sx={{ mr: 1 }} />
            Export Data
          </MenuItem>
          <MenuItem 
            onClick={() => {
              // Delete functionality
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Delete fontSize="small" sx={{ mr: 1 }} />
            Delete Project
          </MenuItem>
        </Menu>
      </Box>
    </Fade>
  );
};

export default ProjectDetail;