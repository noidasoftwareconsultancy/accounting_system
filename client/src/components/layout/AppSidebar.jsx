import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  AutoAwesome as AutomationIcon,
  Settings as SettingsIcon,
  Help as HelpIcon
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
  
  const renderNavItem = (to, icon, text) => {
    return (
      <ListItem 
        button 
        component={RouterLink} 
        to={to}
        sx={{
          minHeight: 48,
          px: 2.5,
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
        {renderNavItem("/expenses", <ExpenseIcon />, "Expenses")}
        {renderNavItem("/payroll", <EmployeeIcon />, "Payroll & HR")}
        {renderNavItem("/accounting", <AccountingIcon />, "Accounting")}
        {renderNavItem("/banking", <BankingIcon />, "Banking")}
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