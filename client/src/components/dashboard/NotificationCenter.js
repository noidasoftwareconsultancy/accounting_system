import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Badge,
  Collapse,
  Button,
  Divider,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  Notifications,
  ExpandMore,
  ExpandLess,
  Warning,
  Info,
  CheckCircle,
  AttachMoney,
  Receipt,
  CreditCard,
  Clear,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';

const NotificationCenter = () => {
  const [expanded, setExpanded] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (expanded && notifications.length === 0) {
      fetchNotifications();
    }
  }, [expanded]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.getNotifications(10);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationAction = (notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await dashboardService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await dashboardService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <Warning sx={{ color: 'warning.main' }} />;
      case 'success':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'error':
        return <Warning sx={{ color: 'error.main' }} />;
      case 'payment':
        return <AttachMoney sx={{ color: 'success.main' }} />;
      case 'invoice':
        return <Receipt sx={{ color: 'primary.main' }} />;
      case 'expense':
        return <CreditCard sx={{ color: 'secondary.main' }} />;
      default:
        return <Info sx={{ color: 'info.main' }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'warning':
        return 'warning.main';
      case 'success':
        return 'success.main';
      case 'error':
        return 'error.main';
      default:
        return 'info.main';
    }
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ pb: expanded ? 2 : 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer'
        }} onClick={() => setExpanded(!expanded)}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={unreadCount} color="error">
              <Notifications color="primary" />
            </Badge>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
          </Box>
          <IconButton size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <ErrorIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
                <Typography variant="body2" color="error" gutterBottom>
                  {error}
                </Typography>
                <Button size="small" onClick={fetchNotifications}>
                  Retry
                </Button>
              </Box>
            ) : notifications.length > 0 ? (
              <List sx={{ p: 0 }}>
                {notifications.slice(0, 5).map((notification, index) => (
                  <div key={notification.id}>
                    <ListItem
                      sx={{
                        px: 0,
                        py: 1,
                        borderRadius: 1,
                        opacity: notification.read ? 0.7 : 1,
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: `${getNotificationColor(notification.type)}15`
                          }}
                        >
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: notification.read ? 400 : 600,
                              cursor: notification.actionUrl ? 'pointer' : 'default'
                            }}
                            onClick={() => handleNotificationAction(notification)}
                          >
                            {notification.title}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {notification.time}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {notification.action && notification.actionUrl && (
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => handleNotificationAction(notification)}
                          >
                            {notification.action}
                          </Button>
                        )}
                        {!notification.read && (
                          <Button 
                            size="small" 
                            variant="text"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                        <IconButton 
                          size="small"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          <Clear fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </div>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Notifications sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  No notifications yet
                </Typography>
              </Box>
            )}
            
            {notifications.length > 5 && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button size="small" variant="text">
                  View All Notifications ({notifications.length})
                </Button>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;