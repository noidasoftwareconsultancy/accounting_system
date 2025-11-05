import React from 'react';
import { Box, Grid, Paper, Typography, Button, Card, CardContent, CardActions, useTheme, useMediaQuery } from '@mui/material';
import { 
  AccountBalance as AccountingIcon,
  Receipt as InvoiceIcon,
  MonetizationOn as ExpenseIcon,
  People as EmployeeIcon,
  AccountBalanceWallet as BankingIcon,
  BarChart as AnalyticsIcon,
  AutoAwesome as AutomationIcon
} from '@mui/icons-material';

const moduleCards = [
  {
    id: 1,
    title: 'Revenue & Billing',
    description: 'Manage invoices, payments, and client billing',
    icon: <InvoiceIcon fontSize="large" color="primary" />,
    route: '/invoices',
    color: '#e3f2fd'
  },
  {
    id: 2,
    title: 'Expense Management',
    description: 'Track expenses, vendors, and purchases',
    icon: <ExpenseIcon fontSize="large" color="secondary" />,
    route: '/expenses',
    color: '#fff8e1'
  },
  {
    id: 3,
    title: 'Payroll & HR',
    description: 'Manage employee salaries and HR finances',
    icon: <EmployeeIcon fontSize="large" style={{ color: '#4caf50' }} />,
    route: '/payroll',
    color: '#e8f5e9'
  },
  {
    id: 4,
    title: 'Accounting',
    description: 'General ledger and financial statements',
    icon: <AccountingIcon fontSize="large" style={{ color: '#9c27b0' }} />,
    route: '/accounting',
    color: '#f3e5f5'
  },
  {
    id: 5,
    title: 'Banking & Payments',
    description: 'Bank accounts and payment integrations',
    icon: <BankingIcon fontSize="large" style={{ color: '#2196f3' }} />,
    route: '/banking',
    color: '#e1f5fe'
  },
  {
    id: 6,
    title: 'Financial Analytics',
    description: 'Reports, dashboards, and insights',
    icon: <AnalyticsIcon fontSize="large" style={{ color: '#ff9800' }} />,
    route: '/analytics',
    color: '#fff3e0'
  },
  {
    id: 7,
    title: 'Automation',
    description: 'Intelligent workflows and automations',
    icon: <AutomationIcon fontSize="large" style={{ color: '#f44336' }} />,
    route: '/automation',
    color: '#ffebee'
  }
];

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  return (
    <Box sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
      <Paper sx={{ p: isMobile ? 2 : 3, mb: 4 }}>
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
          Financial Management System
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Welcome to your comprehensive financial management platform. Manage invoices, expenses, payroll, accounting, and more from a single dashboard.
        </Typography>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
          Financial Overview
        </Typography>
        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
              <Typography variant={isMobile ? "subtitle1" : "h6"}>Total Revenue</Typography>
              <Typography variant={isMobile ? "h5" : "h4"}>$125,430</Typography>
              <Typography variant="body2" color="text.secondary">+12% from last month</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff8e1' }}>
              <Typography variant={isMobile ? "subtitle1" : "h6"}>Total Expenses</Typography>
              <Typography variant={isMobile ? "h5" : "h4"}>$67,890</Typography>
              <Typography variant="body2" color="text.secondary">-5% from last month</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
              <Typography variant={isMobile ? "subtitle1" : "h6"}>Net Profit</Typography>
              <Typography variant={isMobile ? "h5" : "h4"}>$57,540</Typography>
              <Typography variant="body2" color="text.secondary">+18% from last month</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
              <Typography variant={isMobile ? "subtitle1" : "h6"}>Outstanding Invoices</Typography>
              <Typography variant={isMobile ? "h5" : "h4"}>$32,150</Typography>
              <Typography variant="body2" color="text.secondary">8 invoices pending</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
        Financial Modules
      </Typography>
      <Grid container spacing={isMobile ? 2 : 3}>
        {moduleCards.map((module) => (
          <Grid item xs={12} sm={6} md={4} key={module.id}>
            <Card sx={{ bgcolor: module.color }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {module.icon}
                </Box>
                <Typography variant={isMobile ? "subtitle1" : "h6"} component="div" align="center">
                  {module.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {module.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button variant="contained" size={isMobile ? "small" : "medium"}>
                  Access Module
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
          Recent Activity
        </Typography>
        <Paper sx={{ p: isMobile ? 1.5 : 2 }}>
          <Typography variant="body1">Invoice #INV-2305-0042 created for Client XYZ - $5,200</Typography>
          <Typography variant="body2" color="text.secondary">Today at 10:23 AM</Typography>
          <Box sx={{ my: 1, borderBottom: '1px solid #eee' }}></Box>
          
          <Typography variant="body1">Payment received for Invoice #INV-2304-0038 - $3,750</Typography>
          <Typography variant="body2" color="text.secondary">Yesterday at 2:45 PM</Typography>
          <Box sx={{ my: 1, borderBottom: '1px solid #eee' }}></Box>
          
          <Typography variant="body1">Monthly payroll processed - $42,500</Typography>
          <Typography variant="body2" color="text.secondary">May 1, 2023 at 9:00 AM</Typography>
          <Box sx={{ my: 1, borderBottom: '1px solid #eee' }}></Box>
          
          <Typography variant="body1">New expense recorded: Office Supplies - $350</Typography>
          <Typography variant="body2" color="text.secondary">April 29, 2023 at 11:15 AM</Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;