import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as ExecuteIcon,
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import scheduledTaskService from '../../services/scheduledTaskService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ScheduledTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    task_type: '',
    frequency: 'daily',
    cron_expression: '',
    parameters: {},
    is_active: true
  });

  const frequencies = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  useEffect(() => {
    fetchTasks();
    fetchTaskTypes();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await scheduledTaskService.getAll();
      setTasks(response.data.tasks || []);
    } catch (err) {
      setError('Failed to fetch scheduled tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskTypes = async () => {
    try {
      const response = await scheduledTaskService.getTaskTypes();
      setTaskTypes(response.data || []);
    } catch (err) {
      console.error('Error fetching task types:', err);
    }
  };

  const handleOpenDialog = (task = null) => {
    if (task) {
      setFormData({
        name: task.name,
        task_type: task.task_type,
        frequency: task.frequency,
        cron_expression: task.cron_expression || '',
        parameters: task.parameters || {},
        is_active: task.is_active
      });
      setSelectedTask(task);
      setIsEditing(true);
    } else {
      setFormData({
        name: '',
        task_type: '',
        frequency: 'daily',
        cron_expression: '',
        parameters: {},
        is_active: true
      });
      setSelectedTask(null);
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
    setFormData({
      name: '',
      task_type: '',
      frequency: 'daily',
      cron_expression: '',
      parameters: {},
      is_active: true
    });
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await scheduledTaskService.update(selectedTask.id, formData);
        setSuccess('Task updated successfully');
      } else {
        await scheduledTaskService.create(formData);
        setSuccess('Task created successfully');
      }
      handleCloseDialog();
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await scheduledTaskService.delete(id);
        setSuccess('Task deleted successfully');
        fetchTasks();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  const handleExecute = async (id) => {
    try {
      setLoading(true);
      await scheduledTaskService.executeTask(id);
      setSuccess('Task executed successfully');
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to execute task');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await scheduledTaskService.toggleActive(id);
      setSuccess('Task status updated successfully');
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleViewHistory = async (task) => {
    try {
      setSelectedTask(task);
      const response = await scheduledTaskService.getExecutionHistory(task.id);
      setExecutionHistory(response.data.executions || []);
      setOpenHistoryDialog(true);
    } catch (err) {
      setError('Failed to fetch execution history');
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'default';
  };

  const getStatusLabel = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSelectedTaskType = () => {
    return taskTypes.find(type => type.type === formData.task_type);
  };

  const renderParameterFields = () => {
    const taskType = getSelectedTaskType();
    if (!taskType || !taskType.parameters) return null;

    return Object.entries(taskType.parameters).map(([key, config]) => (
      <Grid item xs={12} sm={6} key={key}>
        <TextField
          fullWidth
          label={config.description || key}
          type={config.type === 'number' ? 'number' : config.type === 'date' ? 'date' : 'text'}
          value={formData.parameters[key] || config.default || ''}
          onChange={(e) => setFormData({
            ...formData,
            parameters: {
              ...formData.parameters,
              [key]: e.target.value
            }
          })}
          InputLabelProps={config.type === 'date' ? { shrink: true } : {}}
          helperText={config.description}
        />
      </Grid>
    ));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Scheduled Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Task
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Run</TableCell>
                  <TableCell>Next Run</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {task.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.task_type.replace('_', ' ')}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {task.frequency}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(task.is_active)}
                        color={getStatusColor(task.is_active)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(task.last_run)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(task.next_run)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Execute Now">
                        <IconButton
                          size="small"
                          onClick={() => handleExecute(task.id)}
                          color="primary"
                        >
                          <ExecuteIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View History">
                        <IconButton
                          size="small"
                          onClick={() => handleViewHistory(task)}
                          color="primary"
                        >
                          <HistoryIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Task">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(task)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Toggle Active">
                        <IconButton
                          size="small"
                          onClick={() => handleToggleActive(task.id)}
                          color={task.is_active ? 'success' : 'default'}
                        >
                          <ScheduleIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Task">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(task.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create/Edit Task Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Task' : 'Create Task'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Task Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Task Type"
                value={formData.task_type}
                onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                required
              >
                {taskTypes.map((type) => (
                  <MenuItem key={type.type} value={type.type}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                required
              >
                {frequencies.map((freq) => (
                  <MenuItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cron Expression (Optional)"
                value={formData.cron_expression}
                onChange={(e) => setFormData({ ...formData, cron_expression: e.target.value })}
                helperText="Advanced scheduling (overrides frequency)"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
            
            {/* Task-specific parameters */}
            {formData.task_type && (
              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Task Parameters</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {renderParameterFields()}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Execution History Dialog */}
      <Dialog open={openHistoryDialog} onClose={() => setOpenHistoryDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Execution History - {selectedTask?.name}
        </DialogTitle>
        <DialogContent>
          {executionHistory.length === 0 ? (
            <Typography>No execution history available</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Executed At</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {executionHistory.map((execution, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {formatDate(execution.executedAt)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={execution.result?.success ? 'Success' : 'Failed'}
                          color={execution.result?.success ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {execution.result?.message || 'No message'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScheduledTasks;