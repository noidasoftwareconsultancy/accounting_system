import { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  CardActions,
  Fade,
  Skeleton,
  useTheme,
  useMediaQuery,
  Container
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  MonetizationOn,
  CreditCard,
  Receipt,
  Business,
  Add,
  ArrowForward,
  Visibility,
  People,
  Assignment,
  Analytics,
  Refresh
} from '@mui/icons-material';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import { useApp } from '../contexts/AppContext';
import WelcomeCard from '../components/dashboard/WelcomeCard';
import ProgressCard from '../components/dashboard/ProgressCard';
import NotificationCenter from '../components/dashboard/NotificationCenter';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler
);

// Enhanced Metric Card with CRO principles
const MetricCard = ({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  subtitle,
  action,
  loading = false,
  onClick,
  gradient = false
}) => {
  const theme = useTheme();

  const cardStyle = gradient ? {
    background: `linear-gradient(135deg, ${theme.palette[color].main}15 0%, ${theme.palette[color].main}25 100%)`,
    border: `1px solid ${theme.palette[color].main}30`,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.3s ease',
    '&:hover': onClick ? {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[8],
      border: `1px solid ${theme.palette[color].main}50`
    } : {}
  } : {
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.3s ease',
    '&:hover': onClick ? {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4]
    } : {}
  };

  return (
    <Card sx={cardStyle} onClick={onClick}>
      <CardContent sx={{ pb: action ? 1 : 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              color="textSecondary"
              gutterBottom
              variant="body2"
              sx={{ fontWeight: 500, mb: 1 }}
            >
              {title}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width="60%" height={40} />
            ) : (
              <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                {typeof value === 'number' && (title.toLowerCase().includes('amount') || title.toLowerCase().includes('revenue') || title.toLowerCase().includes('profit'))
                  ? `$${value.toLocaleString()}`
                  : value}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trend > 0 ? (
                  <TrendingUp sx={{ color: 'success.main', fontSize: 20, mr: 0.5 }} />
                ) : trend < 0 ? (
                  <TrendingDown sx={{ color: 'error.main', fontSize: 20, mr: 0.5 }} />
                ) : null}
                <Typography
                  variant="body2"
                  sx={{
                    color: trend > 0 ? 'success.main' : trend < 0 ? 'error.main' : 'text.secondary',
                    fontWeight: 600
                  }}
                >
                  {trend > 0 ? '+' : ''}{trend}% vs last month
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: 56,
              height: 56,
              boxShadow: theme.shadows[3]
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
      {action && (
        <CardActions sx={{ pt: 0, pb: 2, px: 2 }}>
          {action}
        </CardActions>
      )}
    </Card>
  );
};

// Quick Action Button Component
const QuickActionButton = ({ icon, label, onClick, color = 'primary', variant = 'contained' }) => (
  <Button
    variant={variant}
    color={color}
    startIcon={icon}
    onClick={onClick}
    fullWidth
    sx={{
      py: 1.5,
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
      boxShadow: variant === 'contained' ? 3 : 0,
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: variant === 'contained' ? 6 : 1
      }
    }}
  >
    {label}
  </Button>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { addNotification } = useApp();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      const response = await dashboardService.getDashboardData();
      setDashboardData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load dashboard data'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (loading && !dashboardData) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 3 }}>
          <Skeleton variant="text" width="300px" height={48} sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} lg={3} key={i}>
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert
          severity="error"
          sx={{ mt: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => fetchDashboardData()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  const { summary, recentActivities, charts } = dashboardData || {};

  // Chart configurations with enhanced styling
  const revenueExpenseChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: charts?.monthlyRevenue || Array(12).fill(0),
        borderColor: theme.palette.success.main,
        backgroundColor: `${theme.palette.success.main}20`,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: theme.palette.success.main,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: 'Expenses',
        data: charts?.monthlyExpenses || Array(12).fill(0),
        borderColor: theme.palette.error.main,
        backgroundColor: `${theme.palette.error.main}20`,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: theme.palette.error.main,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const expenseCategoryData = {
    labels: charts?.expensesByCategory?.map(item => item.category) || [],
    datasets: [
      {
        data: charts?.expensesByCategory?.map(item => item.amount) || [],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.error.main,
          theme.palette.info.main
        ],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: revenueExpenseChartData.datasets ? {
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.divider
        },
        ticks: {
          color: theme.palette.text.secondary
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: theme.palette.text.secondary
        }
      }
    } : undefined
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 11
          }
        }
      }
    }
  };

  return (
    <Container maxWidth="xl">
      <Fade in={true} timeout={800}>
        <Box sx={{ py: { xs: 2, md: 3 } }}>
          {/* Welcome Section */}
          <WelcomeCard
            onGetStarted={() => navigate('/invoices/new')}
          />

          {/* Header Section */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{ fontWeight: 700, color: 'text.primary' }}
            >
              Business Overview
            </Typography>
            <Tooltip title="Refresh data">
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': { boxShadow: 2 }
                }}
              >
                <Refresh sx={{
                  animation: refreshing ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Key Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title="Monthly Revenue"
                value={summary?.monthlyRevenue || 0}
                icon={<MonetizationOn />}
                color="success"
                trend={summary?.revenueGrowth}
                gradient={true}
                onClick={() => navigate('/invoices')}
                action={
                  <Button
                    size="small"
                    endIcon={<ArrowForward />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/invoices/new');
                    }}
                  >
                    Create Invoice
                  </Button>
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title="Monthly Expenses"
                value={summary?.monthlyExpenses || 0}
                icon={<CreditCard />}
                color="error"
                trend={summary?.expenseGrowth}
                gradient={true}
                onClick={() => navigate('/expenses')}
                action={
                  <Button
                    size="small"
                    endIcon={<ArrowForward />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/expenses/new');
                    }}
                  >
                    Add Expense
                  </Button>
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title="Net Profit"
                value={summary?.profit || 0}
                icon={<TrendingUp />}
                color={summary?.profit >= 0 ? 'success' : 'error'}
                trend={summary?.profitGrowth}
                subtitle={`${summary?.profitMargin?.toFixed(1) || 0}% margin`}
                gradient={true}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title="Active Projects"
                value={summary?.activeProjects || 0}
                icon={<Business />}
                color="info"
                gradient={true}
                onClick={() => navigate('/projects')}
                action={
                  <Button
                    size="small"
                    endIcon={<ArrowForward />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/projects/new');
                    }}
                  >
                    New Project
                  </Button>
                }
              />
            </Grid>
          </Grid>

          {/* Quick Actions Section */}
          <Paper sx={{
            p: { xs: 2, md: 3 },
            mb: 4,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.main}08 100%)`
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={6} md={3}>
                <QuickActionButton
                  icon={<Add />}
                  label={isMobile ? "Invoice" : "Create Invoice"}
                  onClick={() => navigate('/invoices/new')}
                  color="primary"
                />
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <QuickActionButton
                  icon={<CreditCard />}
                  label={isMobile ? "Expense" : "Add Expense"}
                  onClick={() => navigate('/expenses/new')}
                  color="secondary"
                />
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <QuickActionButton
                  icon={<People />}
                  label={isMobile ? "Client" : "Add Client"}
                  onClick={() => navigate('/clients/new')}
                  color="info"
                />
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <QuickActionButton
                  icon={<Analytics />}
                  label={isMobile ? "Reports" : "View Reports"}
                  onClick={() => navigate('/reports/financial')}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Progress Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <ProgressCard
                title="Monthly Target"
                description="Revenue goal for this month"
                current={summary?.monthlyRevenue || 0}
                target={summary?.monthlyTarget || 100000}
                unit=""
                color="success"
                actionLabel="View Details"
                onAction={() => navigate('/reports/financial')}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ProgressCard
                title="Invoice Collection"
                description="Outstanding invoices collected"
                current={summary?.collectedInvoicesPercentage || 0}
                target={100}
                unit="%"
                color="primary"
                actionLabel="Follow Up"
                onAction={() => navigate('/invoices?status=pending')}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <NotificationCenter />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Charts Section */}
            <Grid item xs={12} lg={8}>
              <Paper sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                height: { xs: 350, sm: 400, md: 450 },
                boxShadow: theme.shadows[2],
                '&:hover': { boxShadow: theme.shadows[4] }
              }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: { xs: 2, md: 3 },
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1
                }}>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: 600 }}>
                    Revenue vs Expenses Trend
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip label="Last 12 months" size="small" variant="outlined" />
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => navigate('/reports/financial')}
                      sx={{ minWidth: 'auto', px: 1 }}
                    >
                      <Visibility fontSize="small" />
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ height: 'calc(100% - 80px)' }}>
                  <Line data={revenueExpenseChartData} options={chartOptions} />
                </Box>
              </Paper>
            </Grid>

            {/* Expense Categories */}
            <Grid item xs={12} lg={4}>
              <Paper sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                height: { xs: 350, sm: 400, md: 450 },
                boxShadow: theme.shadows[2],
                '&:hover': { boxShadow: theme.shadows[4] }
              }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: 600 }}>
                    Expense Breakdown
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => navigate('/expenses/categories')}
                    sx={{ minWidth: 'auto' }}
                  >
                    <ArrowForward fontSize="small" />
                  </Button>
                </Box>
                <Box sx={{ height: 'calc(100% - 60px)' }}>
                  {charts?.expensesByCategory?.length > 0 ? (
                    <Doughnut data={expenseCategoryData} options={doughnutOptions} />
                  ) : (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      flexDirection: 'column',
                      gap: 2
                    }}>
                      <Assignment sx={{ fontSize: 48, color: 'text.secondary' }} />
                      <Typography variant="body2" color="textSecondary" textAlign="center">
                        No expense data available
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Add />}
                        onClick={() => navigate('/expenses/new')}
                        sx={{ borderRadius: 2 }}
                      >
                        Add First Expense
                      </Button>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Recent Activities */}
            <Grid item xs={12} md={6}>
              <Paper sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                boxShadow: theme.shadows[2],
                '&:hover': { boxShadow: theme.shadows[4] }
              }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1
                }}>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: 600 }}>
                    Recent Invoices
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/invoices')}
                    sx={{ textTransform: 'none' }}
                  >
                    View All ({summary?.totalInvoices || 0})
                  </Button>
                </Box>
                <List sx={{
                  maxHeight: { xs: 250, md: 300 },
                  overflow: 'auto',
                  '& .MuiListItem-root': {
                    borderRadius: 1,
                    mb: 0.5
                  }
                }}>
                  {recentActivities?.invoices?.slice(0, 5).map((invoice) => (
                    <ListItem
                      key={invoice.id}
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                          <Receipt />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" component="span" sx={{ fontWeight: 600 }}>
                            {invoice.invoice_number}
                          </Typography>
                        }
                        secondary={
                          <span>
                            <Typography variant="body2" component="span" color="textSecondary">
                              {invoice.client?.name} • ${invoice.total_amount?.toLocaleString()}
                            </Typography>
                            <br />
                            <Typography variant="caption" component="span" color="textSecondary">
                              {new Date(invoice.created_at).toLocaleDateString()}
                            </Typography>
                          </span>
                        }
                      />
                      {invoice.status && (
                        <Chip
                          label={invoice.status}
                          size="small"
                          color={
                            invoice.status === 'paid' || invoice.status === 'approved' ? 'success' :
                              invoice.status === 'overdue' || invoice.status === 'rejected' ? 'error' : 'default'
                          }
                        />
                      )}
                    </ListItem>
                  )) || (
                      <Box sx={{ textAlign: 'center', py: { xs: 3, md: 4 } }}>
                        <Receipt sx={{ fontSize: { xs: 40, md: 48 }, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          No recent invoices
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Add />}
                          onClick={() => navigate('/invoices/new')}
                          sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                          Create First Invoice
                        </Button>
                      </Box>
                    )}
                </List>
              </Paper>
            </Grid>

            {/* Recent Expenses */}
            <Grid item xs={12} md={6}>
              <Paper sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                boxShadow: theme.shadows[2],
                '&:hover': { boxShadow: theme.shadows[4] }
              }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1
                }}>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: 600 }}>
                    Recent Expenses
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/expenses')}
                    sx={{ textTransform: 'none' }}
                  >
                    View All ({summary?.totalExpenses || 0})
                  </Button>
                </Box>
                <List sx={{
                  maxHeight: { xs: 250, md: 300 },
                  overflow: 'auto',
                  '& .MuiListItem-root': {
                    borderRadius: 1,
                    mb: 0.5
                  }
                }}>
                  {recentActivities?.expenses?.slice(0, 5).map((expense) => (
                    <ListItem
                      key={expense.id}
                      onClick={() => navigate(`/expenses/${expense.id}/edit`)}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                          <CreditCard />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" component="span" sx={{ fontWeight: 600 }}>
                            {expense.description}
                          </Typography>
                        }
                        secondary={
                          <span>
                            <Typography variant="body2" component="span" color="textSecondary">
                              {expense.category?.name || 'Uncategorized'} • ${expense.amount?.toLocaleString()}
                            </Typography>
                            <br />
                            <Typography variant="caption" component="span" color="textSecondary">
                              {new Date(expense.created_at).toLocaleDateString()}
                            </Typography>
                          </span>
                        }
                      />
                      {expense.status && (
                        <Chip
                          label={expense.status}
                          size="small"
                          color={
                            expense.status === 'paid' || expense.status === 'approved' ? 'success' :
                              expense.status === 'overdue' || expense.status === 'rejected' ? 'error' : 'default'
                          }
                        />
                      )}
                    </ListItem>
                  )) || (
                      <Box sx={{ textAlign: 'center', py: { xs: 3, md: 4 } }}>
                        <CreditCard sx={{ fontSize: { xs: 40, md: 48 }, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          No recent expenses
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Add />}
                          onClick={() => navigate('/expenses/new')}
                          sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                          Add First Expense
                        </Button>
                      </Box>
                    )}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Container>
  );
};

export default Dashboard;