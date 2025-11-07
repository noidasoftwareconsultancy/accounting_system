import { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Toolbar,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  alpha,
  Chip,
  Tooltip,
  Fade,
  Slide
} from '@mui/material';
import {
  Dashboard,
  Receipt,
  Payment,
  People,
  Business,
  Work,
  AccountBalance,
  Analytics,
  Settings,
  ExpandLess,
  ExpandMore,
  MonetizationOn,
  CreditCard,
  PersonAdd,
  AccountBalanceWallet,
  Assessment,
  Close,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

const menuItems = [
  {
    title: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard'
  },
  {
    title: 'Revenue & Billing',
    icon: <MonetizationOn />,
    children: [
      { title: 'Invoices', icon: <Receipt />, path: '/invoices' },
      { title: 'Payments', icon: <Payment />, path: '/payments' },
      { title: 'Clients', icon: <Business />, path: '/clients' },
      { title: 'Projects', icon: <Work />, path: '/projects' }
    ]
  },
  {
    title: 'Expenses',
    icon: <CreditCard />,
    children: [
      { title: 'All Expenses', icon: <CreditCard />, path: '/expenses' },
      { title: 'Categories', icon: <Settings />, path: '/expenses/categories' },
      { title: 'Vendors', icon: <Business />, path: '/expenses/vendors' }
    ]
  },
  {
    title: 'HR & Payroll',
    icon: <PersonAdd />,
    children: [
      { title: 'Employees', icon: <People />, path: '/employees' },
      { title: 'Payroll', icon: <AccountBalanceWallet />, path: '/payroll' },
      { title: 'Attendance', icon: <Assessment />, path: '/hr/attendance' }
    ]
  },
  {
    title: 'Accounting',
    icon: <AccountBalance />,
    children: [
      { title: 'Chart of Accounts', icon: <AccountBalance />, path: '/accounting/accounts' },
      { title: 'Journal Entries', icon: <Receipt />, path: '/accounting/journal-entries' },
      { title: 'Trial Balance', icon: <Analytics />, path: '/accounting/trial-balance' }
    ]
  },
  {
    title: 'Banking',
    icon: <AccountBalanceWallet />,
    children: [
      { title: 'Bank Accounts', icon: <AccountBalance />, path: '/banking/accounts' },
      { title: 'Transactions', icon: <Payment />, path: '/banking/transactions' },
      { title: 'Reconciliation', icon: <Analytics />, path: '/banking/reconciliation' }
    ]
  },
  {
    title: 'Reports',
    icon: <Assessment />,
    children: [
      { title: 'Financial Reports', icon: <Analytics />, path: '/reports/financial' },
      { title: 'Tax Reports', icon: <Receipt />, path: '/reports/tax' },
      { title: 'Custom Reports', icon: <Settings />, path: '/reports/custom' },
      { title: 'Report Templates', icon: <Assessment />, path: '/reports/templates' },
      { title: 'Saved Reports', icon: <Analytics />, path: '/reports/saved' }
    ]
  },
  {
    title: 'Automation',
    icon: <Settings />,
    children: [
      { title: 'Scheduled Tasks', icon: <Settings />, path: '/automation/scheduled-tasks' }
    ]
  }
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, mobileOpen, toggleMobileSidebar } = useApp();
  const [openItems, setOpenItems] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleItemClick = (item) => {
    if (item.children) {
      setOpenItems(prev => ({
        ...prev,
        [item.title]: !prev[item.title]
      }));
    } else {
      navigate(item.path);
      if (isMobile) {
        toggleMobileSidebar();
      }
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isParentActive = (children) => {
    return children?.some(child => isActive(child.path));
  };

  const drawerWidth = isMobile ? 280 : (sidebarOpen ? 280 : 72);
  const isExpanded = isMobile ? mobileOpen : sidebarOpen;

  const drawer = (
    <Box sx={{ 
      height: '100%',
      background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
      borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`
    }}>
      <Toolbar sx={{ 
        px: 2,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`
      }}>
        <Fade in={isExpanded} timeout={300}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            width: '100%'
          }}>
            <Box sx={{
              p: 1,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            {isExpanded && (
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  FinanceHub
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                  Business Management
                </Typography>
              </Box>
            )}
            {isMobile && (
              <Box sx={{ ml: 'auto' }}>
                <Tooltip title="Close menu">
                  <Box
                    component="button"
                    onClick={toggleMobileSidebar}
                    sx={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      p: 1,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.action.hover, 0.1)
                      }
                    }}
                  >
                    <Close sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                  </Box>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Fade>
      </Toolbar>
      
      <Box sx={{ px: 1, py: 2 }}>
        <List sx={{ px: 0 }}>
          {menuItems.map((item, index) => (
            <Slide key={item.title} direction="right" in={true} timeout={400 + index * 100}>
              <Box>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <Tooltip 
                    title={!isExpanded ? item.title : ''} 
                    placement="right"
                    arrow
                  >
                    <ListItemButton
                      onClick={() => handleItemClick(item)}
                      selected={item.path ? isActive(item.path) : isParentActive(item.children)}
                      sx={{
                        minHeight: 52,
                        justifyContent: isExpanded ? 'initial' : 'center',
                        px: 2,
                        mx: 1,
                        borderRadius: 2,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          transform: 'translateX(4px)',
                          '& .MuiListItemIcon-root': {
                            color: theme.palette.primary.main,
                            transform: 'scale(1.1)'
                          }
                        },
                        '&.Mui-selected': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.12),
                          borderLeft: `3px solid ${theme.palette.primary.main}`,
                          '& .MuiListItemIcon-root': {
                            color: theme.palette.primary.main
                          },
                          '& .MuiListItemText-primary': {
                            color: theme.palette.primary.main,
                            fontWeight: 600
                          },
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.15)
                          }
                        }
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: isExpanded ? 2 : 'auto',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {isExpanded && (
                        <ListItemText 
                          primary={item.title}
                          primaryTypographyProps={{
                            fontSize: '0.9rem',
                            fontWeight: 500
                          }}
                        />
                      )}
                      {item.children && isExpanded && (
                        <Box sx={{ 
                          transition: 'transform 0.2s ease-in-out',
                          transform: openItems[item.title] ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>
                          <ExpandMore sx={{ fontSize: 20 }} />
                        </Box>
                      )}
                      {item.badge && isExpanded && (
                        <Chip 
                          label={item.badge} 
                          size="small" 
                          color="primary"
                          sx={{ 
                            height: 20, 
                            fontSize: '0.7rem',
                            fontWeight: 600
                          }} 
                        />
                      )}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
                
                {item.children && isExpanded && (
                  <Collapse in={openItems[item.title]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 1 }}>
                      {item.children.map((child, childIndex) => (
                        <Slide key={child.title} direction="right" in={true} timeout={200 + childIndex * 50}>
                          <ListItem disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                              onClick={() => {
                                navigate(child.path);
                                if (isMobile) toggleMobileSidebar();
                              }}
                              selected={isActive(child.path)}
                              sx={{
                                pl: 4,
                                pr: 2,
                                py: 1,
                                mx: 1,
                                borderRadius: 2,
                                minHeight: 44,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.secondary.main, 0.08),
                                  transform: 'translateX(4px)',
                                  '& .MuiListItemIcon-root': {
                                    color: theme.palette.secondary.main,
                                    transform: 'scale(1.1)'
                                  }
                                },
                                '&.Mui-selected': {
                                  backgroundColor: alpha(theme.palette.secondary.main, 0.12),
                                  borderLeft: `3px solid ${theme.palette.secondary.main}`,
                                  '& .MuiListItemIcon-root': {
                                    color: theme.palette.secondary.main
                                  },
                                  '& .MuiListItemText-primary': {
                                    color: theme.palette.secondary.main,
                                    fontWeight: 600
                                  }
                                }
                              }}
                            >
                              <ListItemIcon sx={{ 
                                minWidth: 36,
                                transition: 'all 0.2s ease-in-out'
                              }}>
                                {child.icon}
                              </ListItemIcon>
                              <ListItemText 
                                primary={child.title}
                                primaryTypographyProps={{
                                  fontSize: '0.85rem',
                                  fontWeight: 500
                                }}
                              />
                              {child.badge && (
                                <Chip 
                                  label={child.badge} 
                                  size="small" 
                                  color="secondary"
                                  variant="outlined"
                                  sx={{ 
                                    height: 18, 
                                    fontSize: '0.65rem',
                                    fontWeight: 600
                                  }} 
                                />
                              )}
                            </ListItemButton>
                          </ListItem>
                        </Slide>
                      ))}
                    </List>
                  </Collapse>
                )}
              </Box>
            </Slide>
          ))}
        </List>
      </Box>

      {/* Footer */}
      {isExpanded && (
        <Box sx={{ 
          mt: 'auto', 
          p: 2, 
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: alpha(theme.palette.background.default, 0.5)
        }}>
          <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
            © 2024 FinanceHub
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block">
            Version 2.1.0
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleMobileSidebar}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              boxShadow: theme.shadows[8]
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        /* Desktop Drawer */
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.standard,
              }),
              overflowX: 'hidden',
              border: 'none',
              boxShadow: `4px 0 20px ${alpha(theme.palette.common.black, 0.05)}`
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;