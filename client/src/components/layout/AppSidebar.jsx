import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { usePermissions } from '../../utils/permissions';
import { 
  Drawer, 
  List, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  ListSubheader,
  styled,
  useTheme,
  useMediaQuery,
  Tooltip,
  Box
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Receipt as InvoiceIcon,
  MonetizationOn as ExpenseIcon,
  People as EmployeeIcon,
  AccountBalance as AccountingIcon,
  AccountBalanceWallet as BankingIcon,
  BarChart as AnalyticsIcon,
  Assessment as TaxIcon,
  AutoAwesome as AutomationIcon,
  Settings as SettingsIcon,
  Percent as TaxRateIcon,
  TrendingUp as TrendingUpIcon,
  Help as HelpIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
  ExpandLess,
  ExpandMore,
  Work as WorkIcon,
  Payment as PayrollIcon,
  Schedule as AttendanceIcon,
  AccountCircle as ProfileIcon,
  Inventory as InventoryIcon,
  Warehouse as WarehouseIcon,
  ShoppingCart as PurchaseIcon,
  SwapHoriz as TransferIcon,
  Tune as AdjustmentIcon,
  LocalShipping as ProductIcon
} from '@mui/icons-material';

const drawerWidth = 240;
const collapsedDrawerWidth = 56; // 7 spacing units

const DrawerStyled = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      overflowX: 'hidden',
      '& .MuiDrawer-paper': {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        boxSizing: 'border-box',
        boxShadow: theme.shadows[3],
        overflowX: 'hidden',
      },
    }),
    ...(!open && {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: 'hidden',
      width: collapsedDrawerWidth,
      '& .MuiDrawer-paper': {
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: collapsedDrawerWidth,
        boxSizing: 'border-box',
        boxShadow: theme.shadows[2],
        [theme.breakpoints.down('sm')]: {
          width: theme.spacing(7),
        },
      },
    }),
  }),
);

const AppSidebar = ({ open }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { canManage } = usePermissions();
  const [expenseMenuOpen, setExpenseMenuOpen] = React.useState(false);
  const [hrMenuOpen, setHrMenuOpen] = React.useState(false);
  const [taxMenuOpen, setTaxMenuOpen] = React.useState(false);
  const [reportsMenuOpen, setReportsMenuOpen] = React.useState(false);
  const [inventoryMenuOpen, setInventoryMenuOpen] = React.useState(false);
  
  const renderNavItem = (to, icon, text, isSubItem = false) => {
    return (
      <ListItem 
        button 
        component={RouterLink} 
        to={to}
        sx={{
          minHeight: 48,
          px: isSubItem ? 4 : 2.5,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        {!open && isMobile ? (
          <Tooltip title={text} placement="right">
            <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
              {icon}
            </ListItemIcon>
          </Tooltip>
        ) : (
          <>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText 
              primary={text} 
              primaryTypographyProps={{ 
                fontSize: isMobile ? '0.875rem' : '1rem',
                fontWeight: 'medium'
              }} 
            />
          </>
        )}
      </ListItem>
    );
  };

  return (
    <DrawerStyled
      variant="permanent"
      open={open}
    >
      <List
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          pt: 8, // Offset for AppBar
        }}
      >
        <ListSubheader 
          component="div" 
          inset
          sx={{ 
            display: open ? 'block' : 'none',
            fontSize: isMobile ? '0.75rem' : '0.875rem'
          }}
        >
          Core Modules
        </ListSubheader>
        
        {renderNavItem("/", <DashboardIcon />, "Dashboard")}
        {renderNavItem("/invoices", <InvoiceIcon />, "Invoices")}
        
        {/* Expenses with submenu */}
        <ListItem 
          button 
          onClick={() => setExpenseMenuOpen(!expenseMenuOpen)}
          sx={{
            minHeight: 48,
            px: 2.5,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          {!open && isMobile ? (
            <Tooltip title="Expenses" placement="right">
              <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
                <ExpenseIcon />
              </ListItemIcon>
            </Tooltip>
          ) : (
            <>
              <ListItemIcon><ExpenseIcon /></ListItemIcon>
              <ListItemText 
                primary="Expenses" 
                primaryTypographyProps={{ 
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  fontWeight: 'medium'
                }} 
              />
              {expenseMenuOpen ? <ExpandLess /> : <ExpandMore />}
            </>
          )}
        </ListItem>
        
        {/* Expense submenu items */}
        {expenseMenuOpen && open && (
          <>
            {renderNavItem("/expenses", <ExpenseIcon />, "All Expenses", true)}
            {renderNavItem("/expenses/categories", <CategoryIcon />, "Categories", true)}
            {renderNavItem("/expenses/vendors", <BusinessIcon />, "Vendors", true)}
          </>
        )}
        
        {/* HR & Payroll with submenu */}
        <ListItem 
          button 
          onClick={() => setHrMenuOpen(!hrMenuOpen)}
          sx={{
            minHeight: 48,
            px: 2.5,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          {!open && isMobile ? (
            <Tooltip title="HR & Payroll" placement="right">
              <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
                <WorkIcon />
              </ListItemIcon>
            </Tooltip>
          ) : (
            <>
              <ListItemIcon><WorkIcon /></ListItemIcon>
              <ListItemText 
                primary="HR & Payroll" 
                primaryTypographyProps={{ 
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  fontWeight: 'medium'
                }} 
              />
              {hrMenuOpen ? <ExpandLess /> : <ExpandMore />}
            </>
          )}
        </ListItem>
        
        {/* HR & Payroll submenu items */}
        {hrMenuOpen && open && (
          <>
            {renderNavItem("/employees", <EmployeeIcon />, "Employees", true)}
            {renderNavItem("/payroll", <PayrollIcon />, "Payroll", true)}
            {renderNavItem("/hr/attendance", <AttendanceIcon />, "Attendance", true)}
          </>
        )}
        {renderNavItem("/accounting", <AccountingIcon />, "Accounting")}
        {renderNavItem("/banking", <BankingIcon />, "Banking")}
        
        {/* Inventory Management with submenu */}
        <ListItem 
          button 
          onClick={() => setInventoryMenuOpen(!inventoryMenuOpen)}
          sx={{
            minHeight: 48,
            px: 2.5,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          {!open && isMobile ? (
            <Tooltip title="Inventory" placement="right">
              <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
                <InventoryIcon />
              </ListItemIcon>
            </Tooltip>
          ) : (
            <>
              <ListItemIcon><InventoryIcon /></ListItemIcon>
              <ListItemText 
                primary="Inventory" 
                primaryTypographyProps={{ 
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  fontWeight: 'medium'
                }} 
              />
              {inventoryMenuOpen ? <ExpandLess /> : <ExpandMore />}
            </>
          )}
        </ListItem>
        
        {/* Inventory submenu items */}
        {inventoryMenuOpen && open && (
          <>
            {renderNavItem("/inventory/dashboard", <DashboardIcon />, "Overview", true)}
            {renderNavItem("/inventory/products", <ProductIcon />, "Products", true)}
            {renderNavItem("/inventory/warehouses", <WarehouseIcon />, "Warehouses", true)}
            {renderNavItem("/inventory/stock", <InventoryIcon />, "Stock Levels", true)}
            {renderNavItem("/inventory/purchase-orders", <PurchaseIcon />, "Purchase Orders", true)}
            {renderNavItem("/inventory/transfers", <TransferIcon />, "Stock Transfers", true)}
            {renderNavItem("/inventory/adjustments", <AdjustmentIcon />, "Adjustments", true)}
            {renderNavItem("/inventory/reports", <AnalyticsIcon />, "Reports", true)}
          </>
        )}
        
        {/* Tax with submenu */}
        <ListItem 
          button 
          onClick={() => setTaxMenuOpen(!taxMenuOpen)}
          sx={{
            minHeight: 48,
            px: 2.5,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          {!open && isMobile ? (
            <Tooltip title="Tax Management" placement="right">
              <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
                <TaxIcon />
              </ListItemIcon>
            </Tooltip>
          ) : (
            <>
              <ListItemIcon><TaxIcon /></ListItemIcon>
              <ListItemText 
                primary="Tax Management" 
                primaryTypographyProps={{ 
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  fontWeight: 'medium'
                }} 
              />
              {taxMenuOpen ? <ExpandLess /> : <ExpandMore />}
            </>
          )}
        </ListItem>
        
        {/* Tax submenu items */}
        {taxMenuOpen && open && (
          <>
            {renderNavItem("/tax/reports", <AnalyticsIcon />, "Tax Reports", true)}
            {canManage && renderNavItem("/tax/rates", <TaxRateIcon />, "Tax Rates", true)}
          </>
        )}
        
        {/* Reports with submenu */}
        <ListItem 
          button 
          onClick={() => setReportsMenuOpen(!reportsMenuOpen)}
          sx={{
            minHeight: 48,
            px: 2.5,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          {!open && isMobile ? (
            <Tooltip title="Reports" placement="right">
              <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
                <AnalyticsIcon />
              </ListItemIcon>
            </Tooltip>
          ) : (
            <>
              <ListItemIcon><AnalyticsIcon /></ListItemIcon>
              <ListItemText 
                primary="Reports" 
                primaryTypographyProps={{ 
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  fontWeight: 'medium'
                }} 
              />
              {reportsMenuOpen ? <ExpandLess /> : <ExpandMore />}
            </>
          )}
        </ListItem>
        
        {/* Reports submenu items */}
        {reportsMenuOpen && open && (
          <>
            {renderNavItem("/reports/financial", <TrendingUpIcon />, "Financial Reports", true)}
            {renderNavItem("/reports/custom", <SettingsIcon />, "Custom Reports", true)}
          </>
        )}
        
        {renderNavItem("/analytics", <AnalyticsIcon />, "Analytics")}
        {renderNavItem("/automation", <AutomationIcon />, "Automation")}
        
        <Divider sx={{ my: 1 }} />
        
        <ListSubheader 
          component="div" 
          inset
          sx={{ 
            display: open ? 'block' : 'none',
            fontSize: isMobile ? '0.75rem' : '0.875rem'
          }}
        >
          System
        </ListSubheader>
        
        {renderNavItem("/settings", <SettingsIcon />, "Settings")}
        {renderNavItem("/help", <HelpIcon />, "Help")}
      </List>
    </DrawerStyled>
  );
};

export default AppSidebar;