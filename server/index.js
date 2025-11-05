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
app.use('/api/clients', require('./routes/client.routes'));
app.use('/api/projects', require('./routes/project.routes'));
app.use('/api/employees', require('./routes/employee.routes'));
app.use('/api/payroll', require('./routes/payroll.routes'));
app.use('/api/accounting', require('./routes/accounting.routes'));
app.use('/api/banking', require('./routes/banking.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

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
      clients: '/api/clients',
      projects: '/api/projects',
      employees: '/api/employees',
      payroll: '/api/payroll',
      accounting: '/api/accounting',
      banking: '/api/banking',
      dashboard: '/api/dashboard'
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