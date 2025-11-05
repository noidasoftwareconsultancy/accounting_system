import { Box, CssBaseline, Toolbar, useTheme, useMediaQuery, Fade } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationSnackbar from './NotificationSnackbar';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { sidebarOpen, mobileOpen } = useApp();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  if (!isAuthenticated) {
    return (
      <>
        <CssBaseline />
        <Box sx={{ 
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}10 100%)`,
        }}>
          {children}
        </Box>
        <NotificationSnackbar />
      </>
    );
  }

  const drawerWidth = isMobile ? 10 : (sidebarOpen ? 10 : 72);

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default
    }}>
      <CssBaseline />
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          width: { 
            xs: '100%',
            md: `calc(100% - ${drawerWidth}px)` 
          },
          ml: { 
            xs: 0,
            md: `${drawerWidth}px` 
          },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
          backgroundColor: 'transparent',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Toolbar sx={{ mb: { xs: 1, sm: 2 } }} />
        <Fade in={true} timeout={600}>
          <Box sx={{
            maxWidth: '100%',
            mx: 'auto',
            position: 'relative',
            zIndex: 1
          }}>
            {children}
          </Box>
        </Fade>
        
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '300px',
            background: `radial-gradient(circle, ${theme.palette.primary.main}08 0%, transparent 70%)`,
            borderRadius: '50%',
            transform: 'translate(50%, -50%)',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '200px',
            height: '200px',
            background: `radial-gradient(circle, ${theme.palette.secondary.main}06 0%, transparent 70%)`,
            borderRadius: '50%',
            transform: 'translate(-50%, 50%)',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
      </Box>
      <NotificationSnackbar />
    </Box>
  );
};

export default Layout;