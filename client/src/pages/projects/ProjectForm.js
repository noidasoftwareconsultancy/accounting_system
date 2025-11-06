import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Skeleton,
  InputAdornment,
  Divider,
  useTheme,
  useMediaQuery,
  Fade
} from '@mui/material';
import {
  Save,
  Cancel,
  Business,
  CalendarToday,
  AttachMoney,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import projectService from '../../services/projectService';
import clientService from '../../services/clientService';
import { useApp } from '../../contexts/AppContext';

const ProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { addNotification } = useApp();
  const isEdit = Boolean(id);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    description: '',
    start_date: null,
    end_date: null,
    status: 'active',
    budget: '',
    department: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [loadingProject, setLoadingProject] = useState(isEdit);

  // Load project data for editing
  useEffect(() => {
    if (isEdit) {
      loadProject();
    }
    loadClients();
  }, [id, isEdit]);

  const loadProject = async () => {
    try {
      setLoadingProject(true);
      const response = await projectService.getProject(id);
      const project = response.data;
      
      setFormData({
        name: project.name || '',
        client_id: project.client_id || '',
        description: project.description || '',
        start_date: project.start_date ? new Date(project.start_date) : null,
        end_date: project.end_date ? new Date(project.end_date) : null,
        status: project.status || 'active',
        budget: project.budget || '',
        department: project.department || ''
      });
    } catch (error) {
      console.error('Error loading project:', error);
      setError('Failed to load project data');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load project data'
      });
    } finally {
      setLoadingProject(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await clientService.getClients({ limit: 100 });
      setClients(response.data?.clients || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load clients'
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }
    if (!formData.client_id) {
      setError('Client is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const projectData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        start_date: formData.start_date ? formData.start_date.toISOString().split('T')[0] : null,
        end_date: formData.end_date ? formData.end_date.toISOString().split('T')[0] : null
      };

      if (isEdit) {
        await projectService.updateProject(id, projectData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Project updated successfully'
        });
      } else {
        await projectService.createProject(projectData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Project created successfully'
        });
      }

      navigate('/projects');
    } catch (error) {
      console.error('Error saving project:', error);
      setError(isEdit ? 'Failed to update project' : 'Failed to create project');
      addNotification({
        type: 'error',
        title: 'Error',
        message: isEdit ? 'Failed to update project' : 'Failed to create project'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingProject) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="300px" height={48} sx={{ mb: 3 }} />
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 2,
          mb: 4 
        }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/projects')}
            sx={{ 
              borderRadius: 2,
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            Back to Projects
          </Button>
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700, mb: 1 }}>
              {isEdit ? 'Edit Project' : 'Create New Project'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {isEdit ? 'Update project information and settings' : 'Set up a new project with client and timeline details'}
            </Typography>
          </Box>
        </Box>

        {/* Form */}
        <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[4] }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Business color="primary" />
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Project Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    placeholder="Enter project name"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Client</InputLabel>
                    <Select
                      value={formData.client_id}
                      onChange={(e) => handleInputChange('client_id', e.target.value)}
                      label="Client"
                      sx={{ borderRadius: 2 }}
                    >
                      {clients.map((client) => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    multiline
                    rows={4}
                    placeholder="Describe the project objectives, scope, and deliverables"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                {/* Project Details */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday color="primary" />
                    Project Details
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Start Date"
                    value={formData.start_date}
                    onChange={(date) => handleInputChange('start_date', date)}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="End Date"
                    value={formData.end_date}
                    onChange={(date) => handleInputChange('end_date', date)}
                    minDate={formData.start_date}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      label="Status"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="on_hold">On Hold</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      label="Department"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">Select Department</MenuItem>
                      <MenuItem value="development">Development</MenuItem>
                      <MenuItem value="design">Design</MenuItem>
                      <MenuItem value="marketing">Marketing</MenuItem>
                      <MenuItem value="sales">Sales</MenuItem>
                      <MenuItem value="consulting">Consulting</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Financial Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney color="primary" />
                    Financial Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="0.00"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    justifyContent: 'flex-end',
                    pt: 3,
                    borderTop: `1px solid ${theme.palette.divider}`
                  }}>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => navigate('/projects')}
                      sx={{ 
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                        fontWeight: 600
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                      disabled={loading}
                      sx={{ 
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        boxShadow: theme.shadows[4],
                        '&:hover': {
                          boxShadow: theme.shadows[8],
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      {loading ? 'Saving...' : (isEdit ? 'Update Project' : 'Create Project')}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
};

export default ProjectForm;