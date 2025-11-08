import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);

  // Connect to WebSocket
  useEffect(() => {
    const connectWebSocket = () => {
      const websocket = new WebSocket(process.env.REACT_APP_WS_URL || 'ws://localhost:5000/ws');

      websocket.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleNotification(data);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      websocket.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        // Reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      setWs(websocket);
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const handleNotification = useCallback((data) => {
    const notification = {
      id: Date.now(),
      ...data,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [notification, ...prev]);

    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification(data.title, {
        body: data.message,
        icon: '/logo192.png'
      });
    }
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const value = {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    connected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
