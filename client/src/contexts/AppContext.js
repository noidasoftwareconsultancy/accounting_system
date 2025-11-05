import { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  sidebarOpen: true,
  mobileOpen: false,
  notifications: [],
  loading: false,
  error: null,
  theme: localStorage.getItem('theme') || 'light'
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      };
    case 'SET_SIDEBAR':
      return {
        ...state,
        sidebarOpen: action.payload
      };
    case 'TOGGLE_MOBILE_SIDEBAR':
      return {
        ...state,
        mobileOpen: !state.mobileOpen
      };
    case 'SET_MOBILE_SIDEBAR':
      return {
        ...state,
        mobileOpen: action.payload
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload
      };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const setSidebar = (open) => {
    dispatch({ type: 'SET_SIDEBAR', payload: open });
  };

  const toggleMobileSidebar = () => {
    dispatch({ type: 'TOGGLE_MOBILE_SIDEBAR' });
  };

  const setMobileSidebar = (open) => {
    dispatch({ type: 'SET_MOBILE_SIDEBAR', payload: open });
  };

  const addNotification = (notification) => {
    const id = Date.now().toString();
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { ...notification, id }
    });

    // Auto remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const setTheme = (theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
    localStorage.setItem('theme', theme);
  };

  const value = {
    ...state,
    toggleSidebar,
    setSidebar,
    toggleMobileSidebar,
    setMobileSidebar,
    addNotification,
    removeNotification,
    clearNotifications,
    setLoading,
    setError,
    clearError,
    setTheme
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};