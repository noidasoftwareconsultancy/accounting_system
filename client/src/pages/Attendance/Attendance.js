import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  DatePicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Schedule as AttendanceIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Schedule as HalfDayIcon,
  BeachAccess as LeaveIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

const Attendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  
  // Data
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({});
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadAttendanceData();
    loadDepartments();
    loadEmployees();
  }, [startDate, endDate, selectedDepartment, selectedEmployee]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      setError('');

      // Mock data for now - replace with actual API calls
      const mockAttendanceData = [
        {
          id: 1,
          employee: { name: 'John Doe', employee_id: 'EMP001' },
          date: '2024-01-15',
          status: 'present',
          hours_worked: 8,
          department: 'Engineering'
        },
        {
          id: 2,
          employee: { name: 'Jane Smith', employee_id: 'EMP002' },
          date: '2024-01-15',
          status: 'absent',
          hours_worked: 0,
          department: 'Marketing'
        },
        {
          id: 3,
          employee: { name: 'Bob Johnson', employee_id: 'EMP003' },
          date: '2024-01-15',
          status: 'half-day',
          hours_worked: 4,
          department: 'Engineering'
        }
      ];

      const mockSummary = {
        total_records: 150,
        present_days: 120,
        absent_days: 15,
        half_days: 10,
        leave_days: 5,
        total_hours: 960
      };

      setAttendanceData(mockAttendanceData);
      setAttendanceSummary(mockSummary);

    } catch (err) {
      console.error('Load attendance data error:', err);
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    // Mock departments - replace with actual API call
    setDepartments([
      { id: 1, name: 'Engineering' },
      { id: 2, name: 'Marketing' },
      { id: 3, name: 'Sales' },
      { id: 4, name: 'HR' }
    ]);
  };

  const loadEmployees = async () => {
    // Mock employees - replace with actual API call
    setEmployees([
      { id: 1, name: 'John Doe', employee_id: 'EMP001' },
      { id: 2, name: 'Jane Smith', employee_id: 'EMP002' },
      { id: 3, name: 'Bob Johnson', employee_id: 'EMP003' }
    ]);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <PresentIcon color="success" />;
      case 'absent':
        return <AbsentIcon color="error" />;
      case 'half-day':
        return <HalfDayIcon color="warning" />;
      case 'leave':
        return <LeaveIcon color="info" />;
      default:
        return <AttendanceIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'half-day':
        return 'warning';
      case 'leave':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Attendance Management
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={loadAttendanceData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PresentIcon color="success" />
                  <Typography variant="h6">Present</Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  {attendanceSummary.present_days || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AbsentIcon color="error" />
                  <Typography variant="h6">Absent</Typography>
                </Box>
                <Typography variant="h4" color="error.main">
                  {attendanceSummary.absent_days || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HalfDayIcon color="warning" />
                  <Typography variant="h6">Half Day</Typography>
                </Box>
                <Typography variant="h4" color="warning.main">
                  {attendanceSummary.half_days || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LeaveIcon color="info" />
                  <Typography variant="h6">Leave</Typography>
                </Box>
                <Typography variant="h4" color="info.main">
                  {attendanceSummary.leave_days || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttendanceIcon color="primary" />
                  <Typography variant="h6">Total Hours</Typography>
                </Box>
                <Typography variant="h4" color="primary.main">
                  {attendanceSummary.total_hours || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                slots={{ textField: TextField }}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                slots={{ textField: TextField }}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={selectedDepartment}
                  label="Department"
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Employee</InputLabel>
                <Select
                  value={selectedEmployee}
                  label="Employee"
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <MenuItem value="">All Employees</MenuItem>
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employee_id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Attendance Table */}
        <Paper>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Attendance Records</Typography>
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => {/* Add export functionality */}}
              disabled={attendanceData.length === 0}
            >
              Export CSV
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Hours Worked</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : attendanceData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.employee.name}</TableCell>
                        <TableCell>{record.employee.employee_id}</TableCell>
                        <TableCell>{record.department}</TableCell>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getStatusIcon(record.status)}
                            <Chip 
                              label={record.status.replace('-', ' ')} 
                              size="small" 
                              color={getStatusColor(record.status)}
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="right">{record.hours_worked}</TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={attendanceData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

        {/* Snackbars */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={() => setSuccess('')}
        >
          <Alert severity="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default Attendance;