require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/invoices', require('./routes/invoice.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/expenses', require('./routes/expense.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/vendors', require('./routes/vendor.routes'));
app.use('/api/clients', require('./routes/client.routes'));
app.use('/api/projects', require('./routes/project.routes'));
app.use('/api/employees', require('./routes/employee.routes'));
app.use('/api/payroll', require('./routes/payroll.routes'));
app.use('/api/accounting', require('./routes/accounting.routes'));
app.use('/api/banking', require('./routes/banking.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/financial-reports', require('./routes/financial-reports.routes'));
app.use('/api/hr-reports', require('./routes/hr-reports.routes'));
app.use('/api/tax', require('./routes/tax.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// New Enhanced API Routes
app.use('/api/contracts', require('./routes/contract.routes'));
app.use('/api/milestones', require('./routes/milestone.routes'));
app.use('/api/credit-notes', require('./routes/credit-note.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/automation', require('./routes/automation.routes'));
app.use('/api/dashboard-widgets', require('./routes/dashboard-widget.routes'));
app.use('/api/audit-logs', require('./routes/audit-log.routes'));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Financial Management System API',
    version: '1.0.0',
    modules: {
      auth: '/api/auth',
      invoices: '/api/invoices',
      payments: '/api/payments',
      expenses: '/api/expenses',
      categories: '/api/categories',
      vendors: '/api/vendors',
      clients: '/api/clients',
      projects: '/api/projects',
      employees: '/api/employees',
      payroll: '/api/payroll',
      accounting: '/api/accounting',
      banking: '/api/banking',
      reports: '/api/reports',
      financial_reports: '/api/financial-reports',
      hr_reports: '/api/hr-reports',
      tax: '/api/tax',
      dashboard: '/api/dashboard',
      contracts: '/api/contracts',
      milestones: '/api/milestones',
      credit_notes: '/api/credit-notes',
      notifications: '/api/notifications',
      automation: '/api/automation',
      dashboard_widgets: '/api/dashboard-widgets',
      audit_logs: '/api/audit-logs'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});

module.exports = app;

