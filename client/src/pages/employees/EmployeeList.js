import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Search,
  People,
  TrendingUp,
  Work,
  Schedule,
  Payment,
  FilterList,
  Download
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import employeeService from '../../services/employeeService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const EmployeeList = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [stats, setStats] = useState({});
  const [departments, setDepartments] = useState([]);
  const [currentTab, setCurrentTab] = useState(searchParams.get('tab') || 'list');

  useEffect(() => {
    fetchEmployees();
    fetchStats();
    fetchDepartments();
  }, [page, rowsPerPage, searchTerm, departmentFilter, statusFilter]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setCurrentTab(tab);
    }
  }, [searchParams]);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {
        department: departmentFilter || undefined,
        status: statusFilter || undefined,
        search: searchTerm || undefined
      };

      const response = await employeeService.getAll(page + 1, rowsPerPage, filters);
      setEmployees(response.data.employees || []);
      setTotalCount(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching employees:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch employees'
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, departmentFilter, statusFilter, addNotification]);

  const fetchStats = async () => {
    try {
      const response = await employeeService.getStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await employeeService.getDepartmentAnalytics();
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleMenuClick = (event, employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  const handleView = () => {
    navigate(`/employees/${selectedEmployee.id}`);
    handleMenuClose();
  };

  const handleEdit = () => {
    navigate(`/employees/${selectedEmployee.id}/edit`);
    handleMenuClose();
  };

  const handleDelete = () => {
    setEmployeeToDelete(selectedEmployee);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      await employeeService.delete(employeeToDelete.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Employee deleted successfully'
      });
      fetchEmployees();
      fetchStats();
    } catch (error) {
      console.error('Error deleting employee:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete employee'
      });
    } finally {
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleRowClick = (employee) => {
    navigate(`/employees/${employee.id}`);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    if (newValue === 'list') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: newValue });
    }
  };

  const getStatusColor = (employee) => {
    if (employee.termination_date) return 'error';
    return 'success';
  };

  const getStatusText = (employee) => {
    if (employee.termination_date) return 'Terminated';
    return 'Active';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading && employees.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Employee Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage employees, attendance, and HR information
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/employees/new')}
        >
          Add Employee
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Employee List" value="list" />
          <Tab label="Attendance" value="attendance" />
          <Tab label="Analytics" value="analytics" />
        </Tabs>
      </Box>

      {currentTab === 'list' && (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <People />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{stats.total || 0}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Employees
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <Work />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{stats.active || 0}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Active Employees
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <TrendingUp />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{stats.recentJoins || 0}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Recent Joins (3M)
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <Payment />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{departments.length || 0}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Departments
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    label="Department"
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.department} value={dept.department}>
                        {dept.department} ({dept.employeeCount})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="terminated">Terminated</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => {/* TODO: Export functionality */}}
                >
                  Export
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Employee Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Join Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Current Salary</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow 
                      key={employee.id} 
                      hover 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleRowClick(employee)}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2 }}>
                            {employee.user?.first_name?.[0] || employee.employee_id[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {employee.user?.first_name && employee.user?.last_name
                                ? `${employee.user.first_name} ${employee.user.last_name}`
                                : employee.employee_id
                              }
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              ID: {employee.employee_id}
                            </Typography>
                            {employee.user?.email && (
                              <Typography variant="body2" color="textSecondary">
                                {employee.user.email}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {employee.department || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {employee.designation || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(employee.join_date).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(employee)}
                          color={getStatusColor(employee)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {employee.salary_structures?.[0]?.basic_salary
                            ? formatCurrency(employee.salary_structures[0].basic_salary)
                            : '-'
                          }
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuClick(e, employee);
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </Paper>
        </>
      )}

      {currentTab === 'attendance' && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Attendance Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Attendance management functionality will be implemented here.
          </Typography>
        </Box>
      )}

      {currentTab === 'analytics' && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Employee Analytics
          </Typography>
          <Grid container spacing={3}>
            {departments.map((dept) => (
              <Grid item xs={12} md={6} lg={4} key={dept.department}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {dept.department}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Employees: {dept.employeeCount}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Avg Salary: {formatCurrency(dept.averageSalary || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete "${employeeToDelete?.user?.first_name} ${employeeToDelete?.user?.last_name || employeeToDelete?.employee_id}"? This action cannot be undone.`}
      />
    </Box>
  );
};

export default EmployeeList;