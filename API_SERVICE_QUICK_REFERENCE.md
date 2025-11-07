# API Service Quick Reference Guide

## Overview
This guide provides a quick reference for all available client services and their corresponding server API endpoints.

---

## 📋 Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Employee Management](#employee-management)
3. [Payroll Management](#payroll-management)
4. [Client Management](#client-management)
5. [Project Management](#project-management)
6. [Contract Management](#contract-management)
7. [Milestone Management](#milestone-management)
8. [Invoice Management](#invoice-management)
9. [Credit Note Management](#credit-note-management)
10. [Expense Management](#expense-management)
11. [Payment Management](#payment-management)
12. [Banking Management](#banking-management)
13. [Accounting](#accounting)
14. [Tax Management](#tax-management)
15. [Reports](#reports)
16. [Financial Reports](#financial-reports)
17. [HR Reports](#hr-reports)
18. [Dashboard](#dashboard)
19. [Dashboard Widgets](#dashboard-widgets)
20. [Automation](#automation)
21. [Notifications](#notifications)
22. [Audit Logs](#audit-logs)

---

## Authentication & Authorization

### Service: `authService`
```javascript
import authService from './services/authService';

// Login
await authService.login({ email, password });

// Register
await authService.register({ name, email, password, role });

// Get profile
await authService.getProfile();
```

---

## Employee Management

### Service: `employeeService`
```javascript
import employeeService from './services/employeeService';

// CRUD Operations
await employeeService.getAll(page, limit, filters);
await employeeService.getById(id);
await employeeService.create(employeeData);
await employeeService.update(id, employeeData);
await employeeService.delete(id);

// Salary Structure
await employeeService.createSalaryStructure(salaryData);
await employeeService.getSalaryHistory(employeeId);
await employeeService.updateSalaryStructure(employeeId, salaryData);

// Attendance
await employeeService.recordAttendance(attendanceData);
await employeeService.bulkRecordAttendance(attendanceRecords);
await employeeService.getAttendance(employeeId, startDate, endDate);
await employeeService.getAttendanceSummary(employeeId, month, year);

// Analytics
await employeeService.getStats();
await employeeService.getDepartmentAnalytics();
await employeeService.getByDepartment(department);
await employeeService.search(query);
```

---

## Payroll Management

### Service: `payrollService`
```javascript
import payrollService from './services/payrollService';

// Payroll Runs
await payrollService.getAll(page, limit);
await payrollService.getById(id);
await payrollService.create(runData);
await payrollService.update(id, runData);
await payrollService.delete(id);

// Process Payroll
await payrollService.generatePayrollData(runId, employeeIds);
await payrollService.processPayroll(runId, employeePayslips);

// Payslips
await payrollService.getPayslipById(id);
await payrollService.getEmployeePayslips(employeeId, page, limit);
await payrollService.updatePaymentStatus(payslipId, status, paymentDate);
await payrollService.bulkUpdatePaymentStatus(payslipIds, status, paymentDate);

// Analytics
await payrollService.getAnalytics(period);
await payrollService.getStats();
```

---

## Client Management

### Service: `clientService`
```javascript
import clientService from './services/clientService';

// CRUD Operations
await clientService.getAll(page, limit, search);
await clientService.getById(id);
await clientService.create(clientData);
await clientService.update(id, clientData);
await clientService.delete(id);

// Relationships
await clientService.getClientProjects(clientId, params);
await clientService.getClientInvoices(clientId, params);
await clientService.getClientContracts(clientId, params);
await clientService.getClientFinancialSummary(clientId);

// Statistics
await clientService.getStats();
```

---

## Project Management

### Service: `projectService`
```javascript
import projectService from './services/projectService';

// CRUD Operations
await projectService.getAll(page, limit, filters);
await projectService.getProject(id);
await projectService.createProject(projectData);
await projectService.updateProject(id, projectData);
await projectService.deleteProject(id);

// Financial
await projectService.getProjectFinancialSummary(id);
await projectService.getProjectStats();
```

---

## Contract Management

### Service: `contractService`
```javascript
import contractService from './services/contractService';

// CRUD Operations
await contractService.getAll(page, limit, filters);
await contractService.getById(id);
await contractService.create(contractData);
await contractService.update(id, contractData);
await contractService.delete(id);

// Status & Relationships
await contractService.updateStatus(id, status);
await contractService.getExpiringContracts(days);
await contractService.getByClient(clientId, params);
await contractService.getByProject(projectId, params);

// Documents
await contractService.uploadDocument(id, file);
await contractService.getDocument(id);
await contractService.deleteDocument(id);

// Statistics
await contractService.getStats();
```

---

## Milestone Management

### Service: `milestoneService`
```javascript
import milestoneService from './services/milestoneService';

// CRUD Operations
await milestoneService.getAll(page, limit, filters);
await milestoneService.getById(id);
await milestoneService.create(milestoneData);
await milestoneService.update(id, milestoneData);
await milestoneService.delete(id);

// Status & Operations
await milestoneService.updateStatus(id, status);
await milestoneService.markComplete(id);
await milestoneService.generateInvoice(id);

// Queries
await milestoneService.getUpcoming(days);
await milestoneService.getOverdue();
await milestoneService.getByProject(projectId, params);

// Statistics
await milestoneService.getStats();
```

---

## Invoice Management

### Service: `invoiceService`
```javascript
import invoiceService from './services/invoiceService';

// CRUD Operations
await invoiceService.getAll(page, limit, filters);
await invoiceService.getInvoice(id);
await invoiceService.createInvoice(invoiceData);
await invoiceService.updateInvoice(id, invoiceData);
await invoiceService.deleteInvoice(id);

// Operations
await invoiceService.sendInvoice(id);
await invoiceService.markAsPaid(id);
await invoiceService.duplicateInvoice(id);
await invoiceService.recordPayment(paymentData);

// Queries
await invoiceService.getOverdueInvoices();
await invoiceService.getInvoicesByClient(clientId, params);
await invoiceService.getInvoicesByProject(projectId, params);

// Utilities
await invoiceService.generateInvoiceNumber();
await invoiceService.getInvoicePDF(id);
await invoiceService.getInvoiceStats();
```

---

## Credit Note Management

### Service: `creditNoteService`
```javascript
import creditNoteService from './services/creditNoteService';

// CRUD Operations
await creditNoteService.getAll(page, limit, filters);
await creditNoteService.getById(id);
await creditNoteService.create(creditNoteData);
await creditNoteService.update(id, creditNoteData);
await creditNoteService.delete(id);

// Operations
await creditNoteService.updateStatus(id, status);
await creditNoteService.applyCreditNote(id);

// Queries
await creditNoteService.getByInvoice(invoiceId, params);

// Utilities
await creditNoteService.getCreditNotePDF(id);
await creditNoteService.generateCreditNoteNumber();
await creditNoteService.getStats();
```

---

## Expense Management

### Service: `expenseService`
```javascript
import expenseService from './services/expenseService';

// CRUD Operations
await expenseService.getAll(page, limit, filters);
await expenseService.getById(id);
await expenseService.create(expenseData);
await expenseService.update(id, expenseData);
await expenseService.delete(id);

// Approval Workflow
await expenseService.approve(id);
await expenseService.reject(id, reason);
await expenseService.markAsPaid(id);

// Categories
await expenseService.getCategories();
await expenseService.createCategory(categoryData);
await expenseService.updateCategory(id, categoryData);
await expenseService.deleteCategory(id);

// Vendors
await expenseService.getVendors();
await expenseService.createVendor(vendorData);
await expenseService.updateVendor(id, vendorData);
await expenseService.deleteVendor(id);

// Queries
await expenseService.getByCategory(categoryId, params);
await expenseService.getByVendor(vendorId, params);
await expenseService.getByProject(projectId, params);
await expenseService.getRecurringExpenses();

// Analytics
await expenseService.getSummaryByCategory(startDate, endDate);
await expenseService.getSummaryByMonth(year);
await expenseService.getAnalytics(period);
await expenseService.getStats();

// Documents
await expenseService.uploadReceipt(id, file);
```

---

## Payment Management

### Service: `paymentService`
```javascript
import paymentService from './services/paymentService';

// CRUD Operations
await paymentService.getAll(page, limit, filters);
await paymentService.getById(id);
await paymentService.create(paymentData);
await paymentService.update(id, paymentData);
await paymentService.delete(id);

// Queries
await paymentService.getByInvoice(invoiceId);

// Statistics
await paymentService.getStats();
```

---

## Banking Management

### Service: `bankingService`
```javascript
import bankingService from './services/bankingService';

// Bank Accounts
await bankingService.getBankAccounts(params);
await bankingService.getBankAccount(id);
await bankingService.createBankAccount(accountData);
await bankingService.updateBankAccount(id, accountData);
await bankingService.deleteBankAccount(id);

// Transactions
await bankingService.getTransactions(params);
await bankingService.createTransaction(transactionData);
await bankingService.transferBetweenAccounts(transferData);

// Reconciliation
await bankingService.reconcileTransaction(transactionId);
await bankingService.bulkReconcileTransactions(transactionIds);
await bankingService.getUnreconciledTransactions(accountId);

// Payment Gateways
await bankingService.getPaymentGateways();
await bankingService.createPaymentGateway(gatewayData);

// Analytics
await bankingService.getAccountBalanceHistory(id, days);
await bankingService.getCashFlowSummary(accountId, period);
await bankingService.getBankingStats();
```

---

## Accounting

### Service: `accountingService`
```javascript
import { accountingService } from './services/accountingService';

// Chart of Accounts
await accountingService.getAccounts(params);
await accountingService.getChartOfAccounts();
await accountingService.getAccount(id);
await accountingService.createAccount(accountData);
await accountingService.updateAccount(id, accountData);
await accountingService.deleteAccount(id);

// Account Types
await accountingService.getAccountTypes();
await accountingService.getAccountsByType(typeId);

// Journal Entries
await accountingService.getJournalEntries(params);
await accountingService.getJournalEntry(id);
await accountingService.createJournalEntry(entryData);
await accountingService.updateJournalEntry(id, entryData);
await accountingService.postJournalEntry(id);

// Reports
await accountingService.getTrialBalance();

// Search
await accountingService.searchAccounts(query);
await accountingService.getAccountBalance(id);
```

---

## Tax Management

### Service: `taxService`
```javascript
import taxService from './services/taxService';

// Tax Rates
await taxService.getTaxRates(params);
await taxService.getTaxRate(id);
await taxService.createTaxRate(taxRateData);
await taxService.updateTaxRate(id, taxRateData);
await taxService.deleteTaxRate(id);

// Tax Records
await taxService.getTaxRecords(params);
await taxService.createTaxRecord(taxRecordData);

// Tax Reports
await taxService.getTaxSummaryReport(params);
await taxService.getTaxCollectionReport(params);
await taxService.getTaxLiabilityReport(params);
await taxService.getTaxComplianceReport(params);

// Utilities
await taxService.getTaxTypes();

// Export
taxService.exportToCsv(data, filename);
taxService.exportToJson(data, filename);

// Formatting
taxService.formatCurrency(amount, currency);
taxService.formatPercentage(value, decimals);
taxService.formatDate(date);
```

---

## Reports

### Service: `reportsService`
```javascript
import reportsService from './services/reportsService';

// Report Templates
await reportsService.getReportTemplates(params);
await reportsService.getReportTemplate(id);
await reportsService.createReportTemplate(templateData);
await reportsService.updateReportTemplate(id, templateData);
await reportsService.deleteReportTemplate(id);

// Report Execution
await reportsService.executeReport(templateId, parameters, saveReport);

// Saved Reports
await reportsService.getSavedReports(params);
await reportsService.getSavedReport(id);
await reportsService.deleteSavedReport(id);

// Utilities
await reportsService.getReportTypes();
await reportsService.getParameterOptions(type);

// Export
reportsService.exportToCsv(data, filename);
reportsService.exportToJson(data, filename);
```

---

## Financial Reports

### Service: `financialReportsService`
```javascript
import financialReportsService from './services/financialReportsService';

// Reports
await financialReportsService.getRevenueSummary(params);
await financialReportsService.getExpenseSummary(params);
await financialReportsService.getProfitLossReport(params);
await financialReportsService.getCashFlowReport(params);
await financialReportsService.getClientPerformanceReport(params);
await financialReportsService.getMonthlyTrendsReport(params);
await financialReportsService.getFinancialDashboard(params);

// Export
financialReportsService.exportToCsv(data, filename);
financialReportsService.exportToJson(data, filename);

// Formatting
financialReportsService.formatCurrency(amount, currency);
financialReportsService.formatPercentage(value, decimals);
```

---

## HR Reports

### Service: `hrReportsService`
```javascript
import hrReportsService from './services/hrReportsService';

// Reports
await hrReportsService.getEmployeeSummary(params);
await hrReportsService.getPayrollSummary(params);
await hrReportsService.getAttendanceReport(params);
await hrReportsService.getDepartmentPerformance(params);
await hrReportsService.getEmployeeLifecycleReport(params);
await hrReportsService.getHRDashboard(params);

// Export
hrReportsService.exportToCsv(data, filename);
hrReportsService.exportToJson(data, filename);

// Formatting
hrReportsService.formatCurrency(amount, currency);
hrReportsService.formatPercentage(value, decimals);
```

---

## Dashboard

### Service: `dashboardService`
```javascript
import dashboardService from './services/dashboardService';

// Dashboard Data
await dashboardService.getDashboardData();
await dashboardService.getFinancialOverview(period);

// Notifications
await dashboardService.getNotifications(limit);
await dashboardService.markNotificationAsRead(notificationId);
await dashboardService.deleteNotification(notificationId);
```

---

## Dashboard Widgets

### Service: `dashboardWidgetService`
```javascript
import dashboardWidgetService from './services/dashboardWidgetService';

// Dashboards
await dashboardWidgetService.getAllDashboards(params);
await dashboardWidgetService.getMyDashboards();
await dashboardWidgetService.getDefaultDashboard();
await dashboardWidgetService.getDashboardById(id);
await dashboardWidgetService.createDashboard(dashboardData);
await dashboardWidgetService.updateDashboard(id, dashboardData);
await dashboardWidgetService.setDefaultDashboard(id);
await dashboardWidgetService.deleteDashboard(id);
await dashboardWidgetService.duplicateDashboard(id);

// Widgets
await dashboardWidgetService.getAllWidgets(params);
await dashboardWidgetService.getWidgetsByDashboard(dashboardId);
await dashboardWidgetService.getWidgetById(id);
await dashboardWidgetService.getWidgetData(id, params);
await dashboardWidgetService.createWidget(widgetData);
await dashboardWidgetService.updateWidget(id, widgetData);
await dashboardWidgetService.updateWidgetPosition(id, position);
await dashboardWidgetService.deleteWidget(id);
await dashboardWidgetService.bulkUpdateWidgetPositions(widgets);

// Metadata
await dashboardWidgetService.getAvailableWidgetTypes();
await dashboardWidgetService.getAvailableDataSources();
```

---

## Automation

### Service: `automationService`
```javascript
import automationService from './services/automationService';

// Automation Rules
await automationService.getAllRules(page, limit, filters);
await automationService.getActiveRules();
await automationService.getRuleById(id);
await automationService.createRule(ruleData);
await automationService.updateRule(id, ruleData);
await automationService.toggleRule(id);
await automationService.deleteRule(id);
await automationService.getRulesStats();

// Scheduled Tasks
await automationService.getAllTasks(page, limit, filters);
await automationService.getUpcomingTasks(days);
await automationService.getTaskById(id);
await automationService.createTask(taskData);
await automationService.updateTask(id, taskData);
await automationService.toggleTask(id);
await automationService.runTask(id);
await automationService.deleteTask(id);
await automationService.getTasksStats();

// Utilities
await automationService.getAvailableEvents();
await automationService.getAvailableActions();
await automationService.testRule(ruleData);
```

---

## Notifications

### Service: `notificationService`
```javascript
import notificationService from './services/notificationService';

// CRUD Operations
await notificationService.getAll(page, limit);
await notificationService.getMyNotifications(page, limit);
await notificationService.getUnreadNotifications();
await notificationService.getById(id);
await notificationService.create(notificationData);
await notificationService.createBulk(bulkData);

// Operations
await notificationService.markAsRead(id);
await notificationService.markAllAsRead();
await notificationService.delete(id);
await notificationService.deleteBulk(notificationIds);

// System Notifications (Admin)
await notificationService.broadcastToAll(notificationData);
await notificationService.broadcastToDepartment(department, notificationData);

// Statistics
await notificationService.getStats();
```

---

## Audit Logs

### Service: `auditLogService`
```javascript
import auditLogService from './services/auditLogService';

// Query Operations
await auditLogService.getAll(page, limit, filters);
await auditLogService.getMyAuditLogs(page, limit);
await auditLogService.getById(id);
await auditLogService.getByEntity(entityType, entityId, params);
await auditLogService.getByUser(userId, params);

// Statistics
await auditLogService.getStats(filters);

// Admin Operations
await auditLogService.createLog(logData);
await auditLogService.cleanup(daysToKeep);
await auditLogService.exportLogs(filters);
```

---

## 🔐 Authentication Headers

All API requests automatically include the authentication token from localStorage:

```javascript
// Handled automatically by api.js
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## 🚨 Error Handling

All services use consistent error handling:

```javascript
try {
  const result = await service.method(params);
  // Handle success
} catch (error) {
  // error.response.data.message contains the error message
  // error.response.status contains the HTTP status code
  console.error('Error:', error.response?.data?.message);
}
```

---

## 📝 Common Patterns

### Pagination
```javascript
const page = 1;
const limit = 10;
const result = await service.getAll(page, limit);
// result.data contains the items
// result.pagination contains { page, limit, total, totalPages }
```

### Filtering
```javascript
const filters = {
  status: 'active',
  startDate: '2025-01-01',
  endDate: '2025-12-31'
};
const result = await service.getAll(page, limit, filters);
```

### File Upload
```javascript
const file = document.getElementById('fileInput').files[0];
await service.uploadDocument(id, file);
```

### Export Data
```javascript
const data = await service.getReport(params);
service.exportToCsv(data.data, 'report-name');
// or
service.exportToJson(data.data, 'report-name');
```

---

## 📚 Additional Resources

- [Full API Alignment Report](./CLIENT_SERVER_API_ALIGNMENT_COMPLETE.md)
- [Developer Quick Reference](./DEVELOPER_QUICK_REFERENCE.md)
- [Testing Guide](./BANKING_TESTING_GUIDE.md)

---

**Last Updated:** November 7, 2025
