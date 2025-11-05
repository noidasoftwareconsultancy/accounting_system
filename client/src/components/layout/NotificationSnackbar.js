import { Snackbar, Alert, AlertTitle, Slide, useTheme, alpha } from '@mui/material';
import { useApp } from '../../contexts/AppContext';

const SlideTransition = (props) => {
  return <Slide {...props} direction="left" />;
};

const NotificationSnackbar = () => {
  const { notifications, removeNotification } = useApp();
  const theme = useTheme();

  return (
    <>
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.duration || 6000}
          onClose={() => removeNotification(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          TransitionComponent={SlideTransition}
          sx={{
            mt: index * 7, // Stack notifications
            '& .MuiSnackbar-root': {
              position: 'relative'
            }
          }}
        >
          <Alert
            onClose={() => removeNotification(notification.id)}
            severity={notification.type || 'info'}
            variant="filled"
            sx={{ 
              width: '100%',
              minWidth: 300,
              maxWidth: 400,
              borderRadius: 2,
              boxShadow: theme.shadows[8],
              border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
              '& .MuiAlert-icon': {
                fontSize: '1.2rem'
              },
              '& .MuiAlert-message': {
                fontSize: '0.9rem',
                fontWeight: 500
              },
              '& .MuiAlert-action': {
                paddingTop: 0
              }
            }}
          >
            {notification.title && (
              <AlertTitle sx={{ 
                fontSize: '1rem', 
                fontWeight: 600,
                mb: 0.5
              }}>
                {notification.title}
              </AlertTitle>
            )}
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default NotificationSnackbar;