import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Skeleton,
  Pagination,
  InputAdornment,
  Tooltip,
  LinearProgress,
  Avatar,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Business,
  CalendarToday,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Schedule,
  CheckCircle,
  Pause,
  PlayArrow,
  Assessment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';
import { useApp } from '../../contexts/AppContext';

const ProjectList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { addNotification } = useApp();

  // State management
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stats, setStats] = useState(null);

  // Fetch projects
  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, [page, statusFilter, departmentFilter, clientFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        status: statusFilter || undefined,
        department: departmentFilter || undefined,
        client_id: clientFilter || undefined,
        search: searchTerm || undefined
      };

      const response = await projectService.getProjects(params);
      setProjects(response.data.projects);
      setTotalPages(response.data.pagination.totalPages);
      setError(null);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load projects'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await projectService.getProjectStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching project stats:', error);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchProjects();
  };

  const handleMenuClick = (event, project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const handleDeleteProject = async () => {
    try {
      await projectService.deleteProject(selectedProject.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Project deleted successfully'
      });
      fetchProjects();
      fetchStats();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete project'
      });
    } finally {
      setDeleteDialogOpen(false);
      handleMenuClose();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'on_hold': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <PlayArrow fontSize="small" />;
      case 'completed': return <CheckCircle fontSize="small" />;
      case 'on_hold': return <Pause fontSize="small" />;
      case 'cancelled': return <Delete fontSize="small" />;
      default: return <Schedule fontSize="small" />;
    }
  };

  const calculateProgress = (project) => {
    if (!project.budget || project.budget === 0) return 0;
    const totalExpenses = project._count?.expenses || 0;
    return Math.min((totalExpenses / project.budget) * 100, 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && projects.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="300px" height={48} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} lg={4} key={i}>
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header Section */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          mb: 4
        }}>
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700, mb: 1 }}>
              Project Management
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Manage and track your projects, budgets, and deliverables
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/projects/new')}
            sx={{
              borderRadius: 2,
              px: 3,
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
            New Project
          </Button>
        </Box>

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={3}>
              <Card sx={{
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}25 100%)`,
                border: `1px solid ${theme.palette.primary.main}30`
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Projects
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.main}25 100%)`,
                border: `1px solid ${theme.palette.success.main}30`
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                    {stats.active}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.main}25 100%)`,
                border: `1px solid ${theme.palette.info.main}30`
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main', mb: 1 }}>
                    {stats.completed}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.secondary.main}15 0%, ${theme.palette.secondary.main}25 100%)`,
                border: `1px solid ${theme.palette.secondary.main}30`
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main', mb: 1 }}>
                    {formatCurrency(stats.totalBudget)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Budget
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters and Search */}
        <Card sx={{ borderRadius: 3, mb: 4, p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="on_hold">On Hold</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  label="Department"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  <MenuItem value="development">Development</MenuItem>
                  <MenuItem value="design">Design</MenuItem>
                  <MenuItem value="marketing">Marketing</MenuItem>
                  <MenuItem value="sales">Sales</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600
                }}
              >
                Search
              </Button>
            </Grid>
            <Grid item xs={12} sm={8} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600
                }}
              >
                Filters
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Projects Grid */}
        <Grid container spacing={3}>
          {projects.map((project, index) => (
            <Grid item xs={12} sm={6} lg={4} key={project.id}>
              <Zoom in={true} timeout={400 + index * 100}>
                <Card sx={{
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {/* Project Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                          {project.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Business fontSize="small" color="action" />
                          <Typography variant="body2" color="textSecondary">
                            {project.client?.name}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          icon={getStatusIcon(project.status)}
                          label={project.status.replace('_', ' ').toUpperCase()}
                          color={getStatusColor(project.status)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, project)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Project Description */}
                    {project.description && (
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {project.description}
                      </Typography>
                    )}

                    {/* Project Dates */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Start Date
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {project.start_date ? formatDate(project.start_date) : 'Not set'}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="textSecondary">
                          End Date
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {project.end_date ? formatDate(project.end_date) : 'Not set'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Budget and Progress */}
                    {project.budget && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="textSecondary">
                            Budget
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {calculateProgress(project).toFixed(1)}% used
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={calculateProgress(project)}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: `${theme.palette.primary.main}15`,
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3
                            }
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
                          {formatCurrency(project.budget)}
                        </Typography>
                      </Box>
                    )}

                    {/* Project Stats */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                      <Tooltip title="Invoices">
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {project._count?.invoices || 0}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Invoices
                          </Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title="Expenses">
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                            {project._count?.expenses || 0}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Expenses
                          </Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title="Milestones">
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                            {project._count?.milestones || 0}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Milestones
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <Box sx={{
            textAlign: 'center',
            py: 8,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.main}08 100%)`,
            borderRadius: 3
          }}>
            <Business sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              No projects found
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              {searchTerm || statusFilter || departmentFilter
                ? 'Try adjusting your search criteria'
                : 'Get started by creating your first project'
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/projects/new')}
              sx={{ borderRadius: 2, px: 4 }}
            >
              Create Project
            </Button>
          </Box>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              size={isMobile ? "small" : "medium"}
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => {
            navigate(`/projects/${selectedProject?.id}`);
            handleMenuClose();
          }}>
            <Visibility fontSize="small" sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={() => {
            navigate(`/projects/${selectedProject?.id}/edit`);
            handleMenuClose();
          }}>
            <Edit fontSize="small" sx={{ mr: 1 }} />
            Edit Project
          </MenuItem>
          <MenuItem onClick={() => {
            navigate(`/projects/${selectedProject?.id}/financial`);
            handleMenuClose();
          }}>
            <Assessment fontSize="small" sx={{ mr: 1 }} />
            Financial Report
          </MenuItem>
          <MenuItem
            onClick={() => {
              setDeleteDialogOpen(true);
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Delete fontSize="small" sx={{ mr: 1 }} />
            Delete Project
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Delete Project</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{selectedProject?.name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeleteProject} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};
export default ProjectList;