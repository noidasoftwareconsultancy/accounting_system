import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Button,
  Badge,
  Divider
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  Delete,
  DoneAll,
  Info,
  Warning,
  Error,
  CheckCircle,
  Refresh
} from '@mui/icons-material';
import { format } from 'date-fns';
import notificationService from '../../services/notificationService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const NotificationCenter = () => {
  const { addNotification } = useApp();
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [tabValue]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      if (tabValue === 0) {
        const response = await notificationService.getMyNotifications(1, 50);
        setNotifications(Array.isArray(response.data) ? response.data : []);
      } else {
        const response = await notificationService.getUnreadNotifications();
        setUnreadNotifications(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      // Silently handle error - server endpoint may not be configured yet
      if (tabValue === 0) {
        setNotifications([]);
      } else {
        setUnreadNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await notificationService.getStats();
      setStats(response.data);
    } catch (error) {
      // Silently handle error - server endpoint may not be configured yet
      setStats({ total_count: 0, unread_count: 0 });
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
      fetchStats();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to mark notification as read'
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'All notifications marked as read'
      });
      fetchNotifications();
      fetchStats();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to mark all as read'
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Notification deleted'
      });
      fetchNotifications();
      fetchStats();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete notification'
      });
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      info: <Info color="info" />,
      warning: <Warning color="warning" />,
      error: <Error color="error" />,
      success: <CheckCircle color="success" />
    };
    return icons[type] || <Info />;
  };

  const displayNotifications = tabValue === 0 ? notifications : unreadNotifications;

  if (loading && displayNotifications.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Notification Center
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DoneAll />}
            onClick={handleMarkAllAsRead}
            disabled={stats?.unread_count === 0}
          >
            Mark All Read
          </Button>
          <IconButton onClick={fetchNotifications}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab
            label={
              <Badge badgeContent={stats?.total_count || 0} color="primary">
                All Notifications
              </Badge>
            }
            icon={<Notifications />}
            iconPosition="start"
          />
          <Tab
            label={
              <Badge badgeContent={stats?.unread_count || 0} color="error">
                Unread
              </Badge>
            }
            icon={<NotificationsActive />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      <Paper>
        <List>
          {displayNotifications.map((notification, index) => (
            <Box key={notification.id}>
              <ListItem
                sx={{
                  bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {notification.title}
                      </Typography>
                      {!notification.is_read && (
                        <Chip label="New" size="small" color="primary" />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {!notification.is_read && (
                    <IconButton
                      size="small"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <DoneAll fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(notification.id)}
                    color="error"
                    title="Delete"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
              {index < displayNotifications.length - 1 && <Divider />}
            </Box>
          ))}
          {displayNotifications.length === 0 && (
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Notifications sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="textSecondary">
                      {tabValue === 0 ? 'No notifications' : 'No unread notifications'}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default NotificationCenter;
