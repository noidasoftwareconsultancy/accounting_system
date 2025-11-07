import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { Security, Search, FilterList, Visibility, Download, Refresh } from '@mui/icons-material';
import { format } from 'date-fns';
import auditLogService from '../../services/auditLogService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AuditLogList = () => {
  const { addNotification } = useApp();
  
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [page, rowsPerPage, searchTerm, actionFilter, entityFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        entity_type: entityFilter !== 'all' ? entityFilter : undefined
      };
      
      const response = await auditLogService.getAll(page + 1, rowsPerPage, filters);
      // Ensure logs is always an array
      setLogs(Array.isArray(response.data) ? response.data : []);
      setTotalCount(response.pagination?.total || 0);
    } catch (error) {
      // Silently handle error - server endpoint may not be configured yet
      setLogs([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await auditLogService.getStats();
      setStats(response.data);
    } catch (error) {
      // Silently handle error - server endpoint may not be configured yet
      setStats(null);
    }
  };

  const handleExport = async () => {
    try {
      await auditLogService.exportLogs({ action: actionFilter, entity_type: entityFilter });
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Audit logs exported successfully'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to export logs'
      });
    }
  };

  const getActionColor = (action) => {
    const colors = {
      create: 'success',
      update: 'info',
      delete: 'error',
      view: 'default',
      login: 'primary',
      logout: 'default'
    };
    return colors[action] || 'default';
  };

  if (loading && logs.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Audit Logs
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton onClick={fetchLogs} disabled={loading}>
            <Refresh />
          </IconButton>
          <IconButton onClick={handleExport}>
            <Download />
          </IconButton>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }} icon={<Security />}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Admin Only Feature
        </Typography>
        <Typography variant="body2">
          This section is restricted to administrators for security monitoring and compliance.
        </Typography>
      </Alert>

      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Logs
                </Typography>
                <Typography variant="h4">{stats.total_logs || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Today's Activity
                </Typography>
                <Typography variant="h4">{stats.today_logs || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Unique Users
                </Typography>
                <Typography variant="h4">{stats.unique_users || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Critical Actions
                </Typography>
                <Typography variant="h4" color="error.main">
                  {stats.critical_actions || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search logs..."
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
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Action</InputLabel>
            <Select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              label="Action"
            >
              <MenuItem value="all">All Actions</MenuItem>
              <MenuItem value="create">Create</MenuItem>
              <MenuItem value="update">Update</MenuItem>
              <MenuItem value="delete">Delete</MenuItem>
              <MenuItem value="view">View</MenuItem>
              <MenuItem value="login">Login</MenuItem>
              <MenuItem value="logout">Logout</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Entity</InputLabel>
            <Select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              label="Entity"
            >
              <MenuItem value="all">All Entities</MenuItem>
              <MenuItem value="invoice">Invoice</MenuItem>
              <MenuItem value="payment">Payment</MenuItem>
              <MenuItem value="client">Client</MenuItem>
              <MenuItem value="employee">Employee</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>IP Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {log.user?.name || 'System'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.action}
                      color={getActionColor(log.action)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {log.entity_type}
                      {log.entity_id && ` #${log.entity_id}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                      {log.description || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {log.ip_address || 'N/A'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="textSecondary">
                      No audit logs found
                    </Typography>
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
          rowsPerPageOptions={[25, 50, 100]}
        />
      </Paper>
    </Box>
  );
};

export default AuditLogList;
