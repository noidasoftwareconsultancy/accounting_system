import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Button,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Widgets,
  Dashboard,
  TrendingUp,
  Assessment,
  MonetizationOn,
  CreditCard,
  People,
  Receipt,
  DragIndicator,
  Add,
  Save,
  Refresh
} from '@mui/icons-material';
import dashboardWidgetService from '../../services/dashboardWidgetService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DashboardCustomize = () => {
  const { addNotification } = useApp();
  const [loading, setLoading] = useState(true);
  const [dashboards, setDashboards] = useState([]);
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [availableWidgetTypes, setAvailableWidgetTypes] = useState([]);

  useEffect(() => {
    fetchDashboards();
    fetchAvailableWidgetTypes();
  }, []);

  const fetchDashboards = async () => {
    try {
      setLoading(true);
      const response = await dashboardWidgetService.getMyDashboards();
      setDashboards(response.data || []);
      
      if (response.data && response.data.length > 0) {
        const defaultDash = response.data.find(d => d.is_default) || response.data[0];
        setCurrentDashboard(defaultDash);
        fetchWidgets(defaultDash.id);
      }
    } catch (error) {
      // Silently handle error - server endpoint may not be configured yet
      // This is expected and the UI shows appropriate fallback content
      setDashboards([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWidgets = async (dashboardId) => {
    try {
      const response = await dashboardWidgetService.getWidgetsByDashboard(dashboardId);
      setWidgets(response.data || []);
    } catch (error) {
      console.error('Error fetching widgets:', error);
    }
  };

  const fetchAvailableWidgetTypes = async () => {
    try {
      const response = await dashboardWidgetService.getAvailableWidgetTypes();
      setAvailableWidgetTypes(response.data || []);
    } catch (error) {
      // Silently handle error and set default widget types for preview
      // Server endpoint may not be configured yet - this is expected
      setAvailableWidgetTypes([
        { type: 'revenue_chart', name: 'Revenue Chart', description: 'Monthly revenue trends' },
        { type: 'expense_breakdown', name: 'Expense Breakdown', description: 'Expense categories' },
        { type: 'recent_invoices', name: 'Recent Invoices', description: 'Latest invoices' },
        { type: 'quick_actions', name: 'Quick Actions', description: 'Common actions' },
        { type: 'monthly_revenue', name: 'Monthly Revenue', description: 'Revenue metric' },
        { type: 'monthly_expenses', name: 'Monthly Expenses', description: 'Expense metric' },
        { type: 'active_projects', name: 'Active Projects', description: 'Project count' },
        { type: 'employee_count', name: 'Employee Count', description: 'Total employees' }
      ]);
    }
  };

  const handleToggleWidget = async (widgetId, currentStatus) => {
    try {
      await dashboardWidgetService.updateWidget(widgetId, { is_visible: !currentStatus });
      addNotification({
        type: 'success',
        title: 'Success',
        message: `Widget ${currentStatus ? 'hidden' : 'shown'}`
      });
      if (currentDashboard) {
        fetchWidgets(currentDashboard.id);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update widget'
      });
    }
  };

  const handleAddWidget = async (widgetType) => {
    if (!currentDashboard) {
      addNotification({
        type: 'info',
        title: 'Info',
        message: 'Dashboard customization will be available once server endpoints are configured'
      });
      return;
    }
    
    try {
      await dashboardWidgetService.createWidget({
        dashboard_id: currentDashboard.id,
        widget_type: widgetType.type,
        title: widgetType.name,
        position: widgets.length,
        is_visible: true
      });
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Widget added successfully'
      });
      fetchWidgets(currentDashboard.id);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add widget'
      });
    }
  };

  const getWidgetIcon = (type) => {
    const icons = {
      revenue_chart: <TrendingUp />,
      expense_breakdown: <Assessment />,
      recent_invoices: <Receipt />,
      quick_actions: <Widgets />,
      monthly_revenue: <MonetizationOn />,
      monthly_expenses: <CreditCard />,
      active_projects: <Dashboard />,
      employee_count: <People />
    };
    return icons[type] || <Widgets />;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Customize Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchDashboards}
        >
          Refresh
        </Button>
      </Box>

      {dashboards.length === 0 && (
        <Paper sx={{ p: 4, mb: 3, textAlign: 'center', bgcolor: 'info.lighter' }}>
          <Widgets sx={{ fontSize: 60, color: 'info.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Dashboard Customization
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            This feature allows you to customize your dashboard with widgets.
            The server API endpoints are ready - just need to be configured.
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Available widget types are shown below for preview.
          </Typography>
        </Paper>
      )}

      {currentDashboard && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current Dashboard: {currentDashboard.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {currentDashboard.description || 'Customize your dashboard widgets and layout'}
          </Typography>
          {currentDashboard.is_default && (
            <Chip label="Default" size="small" color="primary" sx={{ mt: 1 }} />
          )}
        </Paper>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Active Widgets {currentDashboard ? `(${widgets.length})` : ''}
            </Typography>
            {!currentDashboard && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="textSecondary">
                  Create a dashboard to start adding widgets
                </Typography>
              </Box>
            )}
            <List>
              {widgets.map((widget, index) => (
                <Box key={widget.id}>
                  <ListItem>
                    <ListItemIcon>
                      <DragIndicator />
                    </ListItemIcon>
                    <ListItemIcon>
                      {getWidgetIcon(widget.widget_type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={widget.title}
                      secondary={`Position: ${widget.position + 1}`}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={widget.is_visible}
                          onChange={() => handleToggleWidget(widget.id, widget.is_visible)}
                        />
                      }
                      label={widget.is_visible ? 'Visible' : 'Hidden'}
                    />
                  </ListItem>
                  {index < widgets.length - 1 && <Divider />}
                </Box>
              ))}
              {widgets.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Widgets sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="body1" color="textSecondary">
                          No widgets added yet
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Available Widgets
            </Typography>
            <Grid container spacing={2}>
              {availableWidgetTypes.map((widgetType, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        {getWidgetIcon(widgetType.type)}
                      </Box>
                      <Typography variant="subtitle2" align="center" gutterBottom>
                        {widgetType.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" align="center" display="block">
                        {widgetType.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                          size="small"
                          startIcon={<Add />}
                          onClick={() => handleAddWidget(widgetType)}
                        >
                          Add
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardCustomize;
