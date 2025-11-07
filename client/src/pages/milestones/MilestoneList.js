import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
  Flag,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import milestoneService from '../../services/milestoneService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MilestoneList = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [overdueMilestones, setOverdueMilestones] = useState([]);

  useEffect(() => {
    fetchMilestones();
    fetchOverdueMilestones();
  }, [page, rowsPerPage, searchTerm, statusFilter]);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const response = await milestoneService.getAll(page + 1, rowsPerPage, filters);
      setMilestones(Array.isArray(response.data) ? response.data : []);
      setTotalCount(response.pagination?.total || 0);
    } catch (error) {
      // Silently handle error - server endpoint may not be configured yet
      setMilestones([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverdueMilestones = async () => {
    try {
      const response = await milestoneService.getOverdue();
      setOverdueMilestones(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      // Silently handle error - server endpoint may not be configured yet
      setOverdueMilestones([]);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      try {
        await milestoneService.delete(id);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Milestone deleted successfully'
        });
        fetchMilestones();
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete milestone'
        });
      }
    }
  };

  const handleMarkComplete = async (id) => {
    try {
      await milestoneService.markComplete(id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Milestone marked as complete'
      });
      fetchMilestones();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to mark milestone as complete'
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'default',
      'in-progress': 'info',
      completed: 'success',
      overdue: 'error'
    };
    return colors[status] || 'default';
  };

  const isOverdue = (dueDate, status) => {
    return status !== 'completed' && new Date(dueDate) < new Date();
  };

  if (loading && milestones.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Project Milestones
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/milestones/new')}
        >
          New Milestone
        </Button>
      </Box>

      {overdueMilestones.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }} icon={<Warning />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {overdueMilestones.length} milestone(s) are overdue
          </Typography>
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search milestones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
              startAdornment={<FilterList sx={{ ml: 1, mr: -0.5 }} />}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Milestone</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {milestones.map((milestone) => (
                <TableRow key={milestone.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Flag fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {milestone.title}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {milestone.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{milestone.project?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {milestone.due_date ? format(new Date(milestone.due_date), 'MMM dd, yyyy') : 'N/A'}
                      {isOverdue(milestone.due_date, milestone.status) && (
                        <Tooltip title="Overdue">
                          <Warning fontSize="small" color="error" />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={milestone.progress_percentage || 0}
                        sx={{ flex: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption">
                        {milestone.progress_percentage || 0}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    ${milestone.amount?.toLocaleString() || '0'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={milestone.status}
                      color={getStatusColor(milestone.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {milestone.status !== 'completed' && (
                      <Tooltip title="Mark Complete">
                        <IconButton
                          size="small"
                          onClick={() => handleMarkComplete(milestone.id)}
                          color="success"
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/milestones/${milestone.id}`)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/milestones/${milestone.id}/edit`)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(milestone.id)}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {milestones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="textSecondary">
                      No milestones found
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => navigate('/milestones/new')}
                      sx={{ mt: 2 }}
                    >
                      Create First Milestone
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
    </Box>
  );
};

export default MilestoneList;
