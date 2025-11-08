
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Main Pages
import Dashboard from './pages/Dashboard';

// Revenue & Billing Pages
import InvoiceList from './pages/invoices/InvoiceList';
import InvoiceForm from './pages/invoices/InvoiceForm';
import InvoiceDetail from './pages/invoices/InvoiceDetail';
import ClientList from './pages/clients/ClientList';
import ClientForm from './pages/clients/ClientForm';
import ClientDetail from './pages/clients/ClientDetail';
import ProjectList from './pages/projects/ProjectList';
import ProjectForm from './pages/projects/ProjectForm';
import ProjectDetail from './pages/projects/ProjectDetail';

// Expense Pages
import ExpenseList from './pages/expenses/ExpenseList';
import ExpenseForm from './pages/expenses/ExpenseForm';
import ExpenseDetail from './pages/expenses/ExpenseDetail';
import CategoryList from './pages/expenses/CategoryList';
import VendorList from './pages/expenses/VendorList';

// HR & Payroll Pages
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeForm from './pages/employees/EmployeeForm';
import EmployeeDetail from './pages/employees/EmployeeDetail';
import Attendance from './pages/Attendance/Attendance';
import PayrollList from './pages/payroll/PayrollList';
import PayrollForm from './pages/payroll/PayrollForm';
import PayrollDetail from './pages/payroll/PayrollDetail';

// Accounting Pages
import AccountList from './pages/accounting/AccountList';
import JournalEntries from './pages/accounting/JournalEntries';
import TrialBalance from './pages/accounting/TrialBalance';

// Banking Pages
import BankAccountList from './pages/banking/BankAccountList';
import TransactionList from './pages/banking/TransactionList';
import Reconciliation from './pages/banking/Reconciliation';

// Payment Pages
import PaymentList from './pages/payments/PaymentList';
import PaymentForm from './pages/payments/PaymentForm';
import PaymentDetail from './pages/payments/PaymentDetail';
import PaymentGatewayList from './pages/payments/PaymentGatewayList';
import PaymentGatewayForm from './pages/payments/PaymentGatewayForm';

// Report Pages
import FinancialReports from './pages/reports/FinancialReports';
import TaxReports from './pages/tax/TaxReports';
// import TaxReportsSimple from './pages/tax/TaxReportsSimple';
import TaxRates from './pages/tax/TaxRates';
import CustomReports from './pages/reports/CustomReports';
import ReportTemplates from './pages/reports/ReportTemplates';
import SavedReports from './pages/reports/SavedReports';

// Automation Pages
import ScheduledTasks from './pages/automation/ScheduledTasks';

// Contract Pages
import ContractList from './pages/contracts/ContractList';
import ContractForm from './pages/contracts/ContractForm';
import ContractDetail from './pages/contracts/ContractDetail';

// Credit Note Pages
import CreditNoteList from './pages/credit-notes/CreditNoteList';
import CreditNoteForm from './pages/credit-notes/CreditNoteForm';
import CreditNoteDetail from './pages/credit-notes/CreditNoteDetail';

// Milestone Pages
import MilestoneList from './pages/milestones/MilestoneList';
import MilestoneForm from './pages/milestones/MilestoneForm';

// Automation Pages (additional)
import AutomationRuleList from './pages/automation/AutomationRuleList';

// HR Reports
import HRReports from './pages/reports/HRReports';

// Tax Records
import TaxRecordList from './pages/tax/TaxRecordList';

// System Pages
import AuditLogList from './pages/system/AuditLogList';
import NotificationCenter from './pages/notifications/NotificationCenter';

// Inventory Pages
import InventoryDashboard from './pages/inventory/InventoryDashboard';
import ProductsPage from './pages/inventory/ProductsPage';
import EnhancedProductsPage from './pages/inventory/EnhancedProductsPage';
import ProductDetailPage from './pages/inventory/ProductDetailPage';
import ProductFormPage from './pages/inventory/forms/ProductFormPage';
import WarehousesPage from './pages/inventory/WarehousesPage';
import WarehouseDetailPage from './pages/inventory/WarehouseDetailPage';
import WarehouseFormPage from './pages/inventory/forms/WarehouseFormPage';
import StockLevelsPage from './pages/inventory/StockLevelsPage';
import PurchaseOrdersPage from './pages/inventory/PurchaseOrdersPage';
import PurchaseOrderDetailPage from './pages/inventory/PurchaseOrderDetailPage';
import PurchaseOrderFormPage from './pages/inventory/forms/PurchaseOrderFormPage';
import StockTransfersPage from './pages/inventory/StockTransfersPage';
import StockTransferFormPage from './pages/inventory/forms/StockTransferFormPage';
import StockAdjustmentsPage from './pages/inventory/StockAdjustmentsPage';
import StockAdjustmentFormPage from './pages/inventory/forms/StockAdjustmentFormPage';
import InventoryReportsPage from './pages/inventory/InventoryReportsPage';
import AutomationDashboard from './pages/inventory/AutomationDashboard';

// Dashboard Customization
import DashboardCustomize from './pages/dashboard/DashboardCustomize';

const AppContent = () => {
  const { theme } = useApp();

  const muiTheme = createTheme({
    palette: {
      mode: theme,
      primary: {
        main: theme === 'light' ? '#2563eb' : '#3b82f6',
        dark: theme === 'light' ? '#1d4ed8' : '#2563eb',
        light: theme === 'light' ? '#60a5fa' : '#93c5fd',
        contrastText: '#ffffff',
      },
      secondary: {
        main: theme === 'light' ? '#7c3aed' : '#8b5cf6',
        dark: theme === 'light' ? '#5b21b6' : '#7c3aed',
        light: theme === 'light' ? '#a78bfa' : '#c4b5fd',
        contrastText: '#ffffff',
      },
      success: {
        main: theme === 'light' ? '#059669' : '#10b981',
        dark: theme === 'light' ? '#047857' : '#059669',
        light: theme === 'light' ? '#34d399' : '#6ee7b7',
      },
      warning: {
        main: theme === 'light' ? '#d97706' : '#f59e0b',
        dark: theme === 'light' ? '#b45309' : '#d97706',
        light: theme === 'light' ? '#fbbf24' : '#fcd34d',
      },
      error: {
        main: theme === 'light' ? '#dc2626' : '#ef4444',
        dark: theme === 'light' ? '#b91c1c' : '#dc2626',
        light: theme === 'light' ? '#f87171' : '#fca5a5',
      },
      info: {
        main: theme === 'light' ? '#0891b2' : '#06b6d4',
        dark: theme === 'light' ? '#0e7490' : '#0891b2',
        light: theme === 'light' ? '#22d3ee' : '#67e8f9',
      },
      background: {
        default: theme === 'light' ? '#f8fafc' : '#0f172a',
        paper: theme === 'light' ? '#ffffff' : '#1e293b',
      },
      text: {
        primary: theme === 'light' ? '#1e293b' : '#f1f5f9',
        secondary: theme === 'light' ? '#64748b' : '#94a3b8',
      },
      divider: theme === 'light' ? '#e2e8f0' : '#334155',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 800,
        fontSize: '2.5rem',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 700,
        fontSize: '2rem',
        lineHeight: 1.3,
      },
      h3: {
        fontWeight: 700,
        fontSize: '1.75rem',
        lineHeight: 1.3,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.125rem',
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
        fontSize: '0.875rem',
      },
    },
    shape: {
      borderRadius: 2,
    },
    shadows: theme === 'light' ? [
      'none',
      '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      '0 35px 60px -12px rgb(0 0 0 / 0.3)',
      '0 45px 70px -12px rgb(0 0 0 / 0.35)',
      '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      '0 35px 60px -12px rgb(0 0 0 / 0.3)',
      '0 45px 70px -12px rgb(0 0 0 / 0.35)',
      '0 50px 80px -12px rgb(0 0 0 / 0.4)',
      '0 55px 90px -12px rgb(0 0 0 / 0.45)',
      '0 60px 100px -12px rgb(0 0 0 / 0.5)',
      '0 65px 110px -12px rgb(0 0 0 / 0.55)',
      '0 70px 120px -12px rgb(0 0 0 / 0.6)',
      '0 75px 130px -12px rgb(0 0 0 / 0.65)',
      '0 80px 140px -12px rgb(0 0 0 / 0.7)',
      '0 85px 150px -12px rgb(0 0 0 / 0.75)'
    ] : [
      'none',
      '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
      '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
      '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
      '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
      '0 25px 50px -12px rgb(0 0 0 / 0.5)',
      '0 35px 60px -12px rgb(0 0 0 / 0.55)',
      '0 45px 70px -12px rgb(0 0 0 / 0.6)',
      '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
      '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
      '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
      '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
      '0 25px 50px -12px rgb(0 0 0 / 0.5)',
      '0 35px 60px -12px rgb(0 0 0 / 0.55)',
      '0 45px 70px -12px rgb(0 0 0 / 0.6)',
      '0 50px 80px -12px rgb(0 0 0 / 0.65)',
      '0 55px 90px -12px rgb(0 0 0 / 0.7)',
      '0 60px 100px -12px rgb(0 0 0 / 0.75)',
      '0 65px 110px -12px rgb(0 0 0 / 0.8)',
      '0 70px 120px -12px rgb(0 0 0 / 0.85)',
      '0 75px 130px -12px rgb(0 0 0 / 0.9)',
      '0 80px 140px -12px rgb(0 0 0 / 0.95)',
      '0 85px 150px -12px rgb(0 0 0 / 1.0)'
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgb(0 0 0 / 0.15)',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: '0 6px 20px rgb(0 0 0 / 0.15)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 2,
            boxShadow: theme === 'light'
              ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
              : '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
            border: theme === 'light' ? '1px solid #f1f5f9' : '1px solid #334155',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: theme === 'light' ? '1px solid #e2e8f0' : '1px solid #334155',
            borderRadius: 0,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: theme === 'light' ? '1px solid #e2e8f0' : '1px solid #334155',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 8px',
            '&:hover': {
              backgroundColor: theme === 'light' ? '#f1f5f9' : '#334155',
            },
            '&.Mui-selected': {
              backgroundColor: theme === 'light' ? '#dbeafe' : '#1e40af',
              '&:hover': {
                backgroundColor: theme === 'light' ? '#bfdbfe' : '#1d4ed8',
              },
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={muiTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

              {/* Invoice Routes */}
              <Route path="/invoices" element={<ProtectedRoute><InvoiceList /></ProtectedRoute>} />
              <Route path="/invoices/new" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} />
              <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetail /></ProtectedRoute>} />
              <Route path="/invoices/:id/edit" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} />

              {/* Client Routes */}
              <Route path="/clients" element={<ProtectedRoute><ClientList /></ProtectedRoute>} />
              <Route path="/clients/new" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />
              <Route path="/clients/:id" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
              <Route path="/clients/:id/edit" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />

              {/* Project Routes */}
              <Route path="/projects" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
              <Route path="/projects/new" element={<ProtectedRoute><ProjectForm /></ProtectedRoute>} />
              <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
              <Route path="/projects/:id/edit" element={<ProtectedRoute><ProjectForm /></ProtectedRoute>} />

              {/* Expense Routes */}
              <Route path="/expenses" element={<ProtectedRoute><ExpenseList /></ProtectedRoute>} />
              <Route path="/expenses/new" element={<ProtectedRoute><ExpenseForm /></ProtectedRoute>} />
              <Route path="/expenses/:id" element={<ProtectedRoute><ExpenseDetail /></ProtectedRoute>} />
              <Route path="/expenses/:id/edit" element={<ProtectedRoute><ExpenseForm /></ProtectedRoute>} />
              <Route path="/expenses/categories" element={<ProtectedRoute><CategoryList /></ProtectedRoute>} />
              <Route path="/expenses/vendors" element={<ProtectedRoute><VendorList /></ProtectedRoute>} />

              {/* Employee Routes */}
              <Route path="/employees" element={<ProtectedRoute><EmployeeList /></ProtectedRoute>} />
              <Route path="/employees/new" element={<ProtectedRoute><EmployeeForm /></ProtectedRoute>} />
              <Route path="/employees/:id" element={<ProtectedRoute><EmployeeDetail /></ProtectedRoute>} />
              <Route path="/employees/:id/edit" element={<ProtectedRoute><EmployeeForm /></ProtectedRoute>} />

              {/* HR Routes */}
              <Route path="/hr/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />

              {/* Payroll Routes */}
              <Route path="/payroll" element={<ProtectedRoute><PayrollList /></ProtectedRoute>} />
              <Route path="/payroll/new" element={<ProtectedRoute><PayrollForm /></ProtectedRoute>} />
              <Route path="/payroll/:id" element={<ProtectedRoute><PayrollDetail /></ProtectedRoute>} />

              {/* Accounting Routes */}
              <Route path="/accounting/accounts" element={<ProtectedRoute><AccountList /></ProtectedRoute>} />
              <Route path="/accounting/journal-entries" element={<ProtectedRoute><JournalEntries /></ProtectedRoute>} />
              <Route path="/accounting/trial-balance" element={<ProtectedRoute><TrialBalance /></ProtectedRoute>} />

              {/* Banking Routes */}
              <Route path="/banking/accounts" element={<ProtectedRoute><BankAccountList /></ProtectedRoute>} />
              <Route path="/banking/transactions" element={<ProtectedRoute><TransactionList /></ProtectedRoute>} />
              <Route path="/banking/reconciliation" element={<ProtectedRoute><Reconciliation /></ProtectedRoute>} />

              {/* Payment Routes */}
              <Route path="/payments" element={<ProtectedRoute><PaymentList /></ProtectedRoute>} />
              <Route path="/payments/new" element={<ProtectedRoute><PaymentForm /></ProtectedRoute>} />
              <Route path="/payments/:id" element={<ProtectedRoute><PaymentDetail /></ProtectedRoute>} />
              <Route path="/payments/:id/edit" element={<ProtectedRoute><PaymentForm /></ProtectedRoute>} />
              <Route path="/payments/gateways" element={<ProtectedRoute><PaymentGatewayList /></ProtectedRoute>} />
              <Route path="/payments/gateways/new" element={<ProtectedRoute><PaymentGatewayForm /></ProtectedRoute>} />
              <Route path="/payments/gateways/:id/edit" element={<ProtectedRoute><PaymentGatewayForm /></ProtectedRoute>} />

              {/* Report Routes */}
              <Route path="/reports/financial" element={<ProtectedRoute><FinancialReports /></ProtectedRoute>} />
              <Route path="/reports/custom" element={<ProtectedRoute><CustomReports /></ProtectedRoute>} />
              <Route path="/reports/templates" element={<ProtectedRoute><ReportTemplates /></ProtectedRoute>} />
              <Route path="/reports/saved" element={<ProtectedRoute><SavedReports /></ProtectedRoute>} />

              {/* Contract Routes */}
              <Route path="/contracts" element={<ProtectedRoute><ContractList /></ProtectedRoute>} />
              <Route path="/contracts/new" element={<ProtectedRoute><ContractForm /></ProtectedRoute>} />
              <Route path="/contracts/:id" element={<ProtectedRoute><ContractDetail /></ProtectedRoute>} />
              <Route path="/contracts/:id/edit" element={<ProtectedRoute><ContractForm /></ProtectedRoute>} />

              {/* Credit Note Routes */}
              <Route path="/credit-notes" element={<ProtectedRoute><CreditNoteList /></ProtectedRoute>} />
              <Route path="/credit-notes/new" element={<ProtectedRoute><CreditNoteForm /></ProtectedRoute>} />
              <Route path="/credit-notes/:id" element={<ProtectedRoute><CreditNoteDetail /></ProtectedRoute>} />
              <Route path="/credit-notes/:id/edit" element={<ProtectedRoute><CreditNoteForm /></ProtectedRoute>} />

              {/* Milestone Routes */}
              <Route path="/milestones" element={<ProtectedRoute><MilestoneList /></ProtectedRoute>} />
              <Route path="/milestones/new" element={<ProtectedRoute><MilestoneForm /></ProtectedRoute>} />
              <Route path="/milestones/:id/edit" element={<ProtectedRoute><MilestoneForm /></ProtectedRoute>} />

              {/* Automation Routes */}
              <Route path="/automation/rules" element={<ProtectedRoute><AutomationRuleList /></ProtectedRoute>} />
              <Route path="/automation/rules/new" element={<ProtectedRoute><AutomationRuleList /></ProtectedRoute>} />
              <Route path="/automation/rules/:id/edit" element={<ProtectedRoute><AutomationRuleList /></ProtectedRoute>} />
              <Route path="/automation/scheduled-tasks" element={<ProtectedRoute><ScheduledTasks /></ProtectedRoute>} />

              {/* HR Reports Routes */}
              <Route path="/reports/hr" element={<ProtectedRoute><HRReports /></ProtectedRoute>} />

              {/* Legacy redirect for old tax reports path */}
              <Route path="/reports/tax" element={<Navigate to="/tax/reports" replace />} />

              {/* Tax Routes */}
              <Route path="/tax/reports" element={<ProtectedRoute><TaxReports /></ProtectedRoute>} />
              <Route path="/tax/rates" element={<ProtectedRoute><TaxRates /></ProtectedRoute>} />
              <Route path="/tax/records" element={<ProtectedRoute><TaxRecordList /></ProtectedRoute>} />

              {/* Inventory Routes */}
              <Route path="/inventory/dashboard" element={<ProtectedRoute><InventoryDashboard /></ProtectedRoute>} />
              <Route path="/inventory/products" element={<ProtectedRoute><EnhancedProductsPage /></ProtectedRoute>} />
              <Route path="/inventory/products/new" element={<ProtectedRoute><ProductFormPage /></ProtectedRoute>} />
              <Route path="/inventory/products/:id/edit" element={<ProtectedRoute><ProductFormPage /></ProtectedRoute>} />
              <Route path="/inventory/products/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
              <Route path="/inventory/warehouses" element={<ProtectedRoute><WarehousesPage /></ProtectedRoute>} />
              <Route path="/inventory/warehouses/new" element={<ProtectedRoute><WarehouseFormPage /></ProtectedRoute>} />
              <Route path="/inventory/warehouses/:id/edit" element={<ProtectedRoute><WarehouseFormPage /></ProtectedRoute>} />
              <Route path="/inventory/warehouses/:id" element={<ProtectedRoute><WarehouseDetailPage /></ProtectedRoute>} />
              <Route path="/inventory/stock" element={<ProtectedRoute><StockLevelsPage /></ProtectedRoute>} />
              <Route path="/inventory/purchase-orders" element={<ProtectedRoute><PurchaseOrdersPage /></ProtectedRoute>} />
              <Route path="/inventory/purchase-orders/new" element={<ProtectedRoute><PurchaseOrderFormPage /></ProtectedRoute>} />
              <Route path="/inventory/purchase-orders/:id/edit" element={<ProtectedRoute><PurchaseOrderFormPage /></ProtectedRoute>} />
              <Route path="/inventory/purchase-orders/:id" element={<ProtectedRoute><PurchaseOrderDetailPage /></ProtectedRoute>} />
              <Route path="/inventory/transfers" element={<ProtectedRoute><StockTransfersPage /></ProtectedRoute>} />
              <Route path="/inventory/transfers/new" element={<ProtectedRoute><StockTransferFormPage /></ProtectedRoute>} />
              <Route path="/inventory/transfers/:id/edit" element={<ProtectedRoute><StockTransferFormPage /></ProtectedRoute>} />
              <Route path="/inventory/adjustments" element={<ProtectedRoute><StockAdjustmentsPage /></ProtectedRoute>} />
              <Route path="/inventory/adjustments/new" element={<ProtectedRoute><StockAdjustmentFormPage /></ProtectedRoute>} />
              <Route path="/inventory/automation" element={<ProtectedRoute><AutomationDashboard /></ProtectedRoute>} />
              <Route path="/inventory/reports" element={<ProtectedRoute><InventoryReportsPage /></ProtectedRoute>} />

              {/* System Routes */}
              <Route path="/system/audit-logs" element={<ProtectedRoute><AuditLogList /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationCenter /></ProtectedRoute>} />
              <Route path="/dashboard/customize" element={<ProtectedRoute><DashboardCustomize /></ProtectedRoute>} />

              {/* Catch all route */}
              {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
            </Routes>
          </Layout>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
