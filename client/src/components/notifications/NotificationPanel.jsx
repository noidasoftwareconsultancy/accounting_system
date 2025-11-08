import { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Button,
  Divider,
  Chip
} from '@mui/material';
import {
  Notifications,
  Close,
  Delete,
  CheckCircle,
  Warning,
  Info,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <Info color="info" />;
    }
  };

  return (
    <>
      <IconButton onClick={() => setOpen(true)} color="inherit">
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 400, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Notifications</Typography>
            <IconButton onClick={() => setOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>

          {notifications.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button size="small" onClick={markAllAsRead}>
                Mark all read
              </Button>
              <Button size="small" onClick={clearAll} color="error">
                Clear all
              </Button>
            </Box>
          )}

          <Divider sx={{ mb: 2 }} />

          {notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Notifications sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            <List>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    borderRadius: 1,
                    mb: 1
                  }}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <Box sx={{ mr: 2 }}>
                    {getIcon(notification.type)}
                  </Box>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Chip label="New" size="small" color="primary" />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default NotificationPanel;
