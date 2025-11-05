import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Badge, Menu, MenuItem, useMediaQuery, Box } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: 240,
    width: `calc(100% - 240px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const AppHeader = ({ open, toggleDrawer }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const isNotificationsMenuOpen = Boolean(notificationsAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenuOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsMenuClose = () => {
    setNotificationsAnchorEl(null);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
      <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
    </Menu>
  );

  const notificationsMenuId = 'notifications-menu';
  const renderNotificationsMenu = (
    <Menu
      anchorEl={notificationsAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={notificationsMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isNotificationsMenuOpen}
      onClose={handleNotificationsMenuClose}
    >
      <MenuItem onClick={handleNotificationsMenuClose}>New invoice payment received</MenuItem>
      <MenuItem onClick={handleNotificationsMenuClose}>Expense approval required</MenuItem>
      <MenuItem onClick={handleNotificationsMenuClose}>System update available</MenuItem>
    </Menu>
  );

  return (
    <>
      <AppBarStyled position="absolute" open={open}>
        <Toolbar sx={{ pr: { xs: 1, sm: 2 } }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: { xs: '16px', sm: '36px' },
              ...(open && { display: 'none' }),
            }}
            size={isMobile ? "small" : "medium"}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {isMobile ? 'FMS' : 'Financial Management System'}
          </Typography>
          
          <Box sx={{ display: 'flex' }}>
            <IconButton 
              color="inherit"
              size={isMobile ? "small" : "medium"}
              aria-label="show notifications"
              aria-controls={notificationsMenuId}
              aria-haspopup="true"
              onClick={handleNotificationsMenuOpen}
            >
              <Badge badgeContent={4} color="secondary">
                <NotificationsIcon fontSize={isMobile ? "small" : "medium"} />
              </Badge>
            </IconButton>
            
            {!isMobile && (
              <IconButton 
                color="inherit"
                size={isMobile ? "small" : "medium"}
              >
                <SettingsIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            )}
            
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
              size={isMobile ? "small" : "medium"}
            >
              <AccountCircle fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBarStyled>
      {renderMenu}
      {renderNotificationsMenu}
    </>
  );
};

export default AppHeader;