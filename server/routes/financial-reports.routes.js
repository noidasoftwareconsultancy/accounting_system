const express = require('express');
const router = express.Router();
const financialReportsController = require('../controllers/financial-reports.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Financial Reports Routes (all authenticated users can view reports)
router.get('/revenue-summary', financialReportsController.getRevenueSummary);
router.get('/expense-summary', financialReportsController.getExpenseSummary);
router.get('/profit-loss', financialReportsController.getProfitLossReport);
router.get('/cash-flow', financialReportsController.getCashFlowReport);
router.get('/client-performance', financialReportsController.getClientPerformanceReport);
router.get('/monthly-trends', financialReportsController.getMonthlyTrendsReport);
router.get('/dashboard', financialReportsController.getFinancialDashboard);

module.exports = router;