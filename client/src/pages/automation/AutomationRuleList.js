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
  Switch,
  Tooltip,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  SmartToy,
  PlayArrow,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import automationService from '../../services/automationService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AutomationRuleList = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  
  const [rules, setRules] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRules();
    fetchStats();
  }, [page, rowsPerPage, searchTerm]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const filters = { search: searchTerm };
      const response = await automationService.getAllRules(page + 1, rowsPerPage, filters);
      setRules(Array.isArray(response.data) ? response.data : []);
      setTotalCount(response.pagination?.total || 0);
    } catch (error) {
      // Silently handle error - server endpoint may not be configured yet
      setRules([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await automationService.getRulesStats();
      setStats(response.data);
    } catch (error) {
      // Silently handle error - server endpoint may not be configured yet
      setStats(null);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await automationService.toggleRule(id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: `Rule ${currentStatus ? 'disabled' : 'enabled'} successfully`
      });
      fetchRules();
      fetchStats();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to toggle rule'
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      try {
        await automationService.deleteRule(id);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Rule deleted successfully'
        });
        fetchRules();
        fetchStats();
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete rule'
        });
      }
    }
  };

  if (loading && rules.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Automation Rules
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/automation/rules/new')}
        >
          New Rule
        </Button>
      </Box>

      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Rules
                </Typography>
                <Typography variant="h4">{stats.total_rules || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Rules
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.active_rules || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Executions Today
                </Typography>
                <Typography variant="h4">{stats.executions_today || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Success Rate
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {stats.success_rate || 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            fullWidth
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rule Name</TableCell>
                <TableCell>Event</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Executions</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SmartToy fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {rule.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {rule.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={rule.event_type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip label={rule.action_type} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>{rule.execution_count || 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={rule.last_execution_status || 'Never run'}
                      size="small"
                      color={rule.last_execution_status === 'success' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={rule.is_active}
                      onChange={() => handleToggle(rule.id, rule.is_active)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/automation/rules/${rule.id}/edit`)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(rule.id)}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {rules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <SmartToy sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="textSecondary" gutterBottom>
                      No automation rules found
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => navigate('/automation/rules/new')}
                      sx={{ mt: 2 }}
                    >
                      Create First Rule
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

export default AutomationRuleList;
