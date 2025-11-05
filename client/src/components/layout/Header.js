import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText,
  alpha,
  Slide
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Notifications,
  Settings,
  Logout,
  DarkMode,
  LightMode,
  Search,
  Help,
  Business,
  Close
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar, toggleMobileSidebar, notifications, theme: appTheme, setTheme } = useApp();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenu = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const toggleTheme = () => {
    setTheme(appTheme === 'light' ? 'dark' : 'light');
  };

  const handleSidebarToggle = () => {
    if (isMobile) {
      toggleMobileSidebar();
    } else {
      toggleSidebar();
    }
  };

  return (
    <Slide direction="down" in={true} timeout={800}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
          borderRadius: 0
        }}
      >
        <Toolbar sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleSidebarToggle}
            edge="start"
            sx={{ 
              mr: 2,
              p: 1.5,
              borderRadius: 0,
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.1),
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Business sx={{ mr: 1, fontSize: { xs: 24, md: 28 } }} />
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.common.white} 30%, ${alpha(theme.palette.common.white, 0.8)} 90%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              FinanceHub
            </Typography>
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 700,
                color: 'white',
                display: { xs: 'block', sm: 'none' }
              }}
            >
              FH
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
            {!isMobile && (
              <Tooltip title="Search" arrow>
                <IconButton 
                  color="inherit"
                  sx={{
                    p: 1.5,
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <Search />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title={`Switch to ${appTheme === 'light' ? 'dark' : 'light'} mode`} arrow>
              <IconButton 
                color="inherit" 
                onClick={toggleTheme}
                sx={{
                  p: 1.5,
                  borderRadius: 0,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.1),
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {appTheme === 'light' ? <DarkMode /> : <LightMode />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications" arrow>
              <IconButton 
                color="inherit"
                onClick={handleNotificationMenu}
                sx={{
                  p: 1.5,
                  borderRadius: 0,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.1),
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <Badge 
                  badgeContent={notifications?.length || 0} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: theme.palette.error.main,
                      color: theme.palette.error.contrastText,
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }
                  }}
                >
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
              {!isMobile && (
                <Box sx={{ mr: 2, textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                    {user?.first_name} {user?.last_name}
                  </Typography>
                  <Chip 
                    label={user?.role || 'User'} 
                    size="small" 
                    sx={{ 
                      backgroundColor: alpha(theme.palette.common.white, 0.2),
                      color: 'white',
                      fontWeight: 500,
                      fontSize: '0.7rem'
                    }} 
                  />
                </Box>
              )}
              
              <Tooltip title="Account menu" arrow>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  sx={{
                    p: 0.5,
                    '&:hover': {
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: { xs: 36, sm: 40 }, 
                      height: { xs: 36, sm: 40 },
                      backgroundColor: alpha(theme.palette.common.white, 0.2),
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`
                    }}
                  >
                    {user?.first_name?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>

            {/* Account Menu */}
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              sx={{
                '& .MuiPaper-root': {
                  borderRadius: 0,
                  minWidth: 200,
                  boxShadow: theme.shadows[8],
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {user?.email}
                </Typography>
              </Box>
              
              <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              
              <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
              
              <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <Help fontSize="small" />
                </ListItemIcon>
                <ListItemText>Help & Support</ListItemText>
              </MenuItem>
              
              <Divider />
              
              <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
                <ListItemIcon>
                  <Logout fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>

            {/* Notifications Menu */}
            <Menu
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={handleNotificationClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              sx={{
                '& .MuiPaper-root': {
                  borderRadius: 0,
                  minWidth: 320,
                  maxWidth: 400,
                  boxShadow: theme.shadows[8],
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Notifications
                  </Typography>
                  <IconButton size="small" onClick={handleNotificationClose}>
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              
              {notifications?.length > 0 ? (
                notifications.slice(0, 5).map((notification, index) => (
                  <MenuItem key={index} sx={{ py: 1.5, whiteSpace: 'normal' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {notification.message}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              ) : (
                <MenuItem sx={{ py: 3, justifyContent: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    No new notifications
                  </Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </Slide>
  );
};

export default Header;