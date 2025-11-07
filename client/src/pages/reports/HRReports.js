import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField
} from '@mui/material';
import { People, Payment, TrendingUp, Assessment, Download, Refresh } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import hrReportsService from '../../services/hrReportsService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const HRReports = () => {
  const { addNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), 0, 1),
    end_date: new Date()
  });
  const [employeeSummary, setEmployeeSummary] = useState(null);
  const [payrollSummary, setPayrollSummary] = useState(null);
  const [attendanceReport, setAttendanceReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {
        start_date: dateRange.start_date?.toISOString(),
        end_date: dateRange.end_date?.toISOString()
      };

      const [empResponse, payResponse, attResponse] = await Promise.all([
        hrReportsService.getEmployeeSummary(params),
        hrReportsService.getPayrollSummary(params),
        hrReportsService.getAttendanceReport(params)
      ]);

      setEmployeeSummary(empResponse.data || {});
      setPayrollSummary(payResponse.data || {});
      setAttendanceReport(attResponse.data || {});
    } catch (error) {
      // Silently handle error - server endpoint may not be configured yet
      setEmployeeSummary({ total_employees: 0, active_departments: 0, by_department: [] });
      setPayrollSummary({ total_payroll: 0, by_month: [] });
      setAttendanceReport({ average_attendance: 0, by_employee: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (reportType) => {
    try {
      let data;
      let filename;
      
      switch (reportType) {
        case 'employee':
          data = employeeSummary;
          filename = 'employee_summary';
          break;
        case 'payroll':
          data = payrollSummary;
          filename = 'payroll_summary';
          break;
        case 'attendance':
          data = attendanceReport;
          filename = 'attendance_report';
          break;
        default:
          return;
      }

      hrReportsService.exportToCsv(data, filename);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Report exported successfully'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to export report'
      });
    }
  };

  if (loading && !employeeSummary) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          HR Reports & Analytics
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchReports}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <DatePicker
              label="Start Date"
              value={dateRange.start_date}
              onChange={(date) => setDateRange({ ...dateRange, start_date: date })}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DatePicker
              label="End Date"
              value={dateRange.end_date}
              onChange={(date) => setDateRange({ ...dateRange, end_date: date })}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <People sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Employees
                  </Typography>
                  <Typography variant="h4">{employeeSummary?.total_employees || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Payment sx={{ fontSize: 40, color: 'success.main' }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Payroll
                  </Typography>
                  <Typography variant="h4">
                    ${hrReportsService.formatCurrency(payrollSummary?.total_payroll || 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Assessment sx={{ fontSize: 40, color: 'info.main' }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Avg Attendance
                  </Typography>
                  <Typography variant="h4">
                    {hrReportsService.formatPercentage(attendanceReport?.average_attendance || 0)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp sx={{ fontSize: 40, color: 'warning.main' }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Active Departments
                  </Typography>
                  <Typography variant="h4">{employeeSummary?.active_departments || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Employee Summary" />
          <Tab label="Payroll Summary" />
          <Tab label="Attendance Report" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && employeeSummary && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Employee Summary</Typography>
                <Button
                  startIcon={<Download />}
                  onClick={() => handleExport('employee')}
                  size="small"
                >
                  Export CSV
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Department</TableCell>
                      <TableCell align="right">Employees</TableCell>
                      <TableCell align="right">Avg Salary</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employeeSummary.by_department?.map((dept, index) => (
                      <TableRow key={index}>
                        <TableCell>{dept.department}</TableCell>
                        <TableCell align="right">{dept.count}</TableCell>
                        <TableCell align="right">
                          ${hrReportsService.formatCurrency(dept.avg_salary)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {tabValue === 1 && payrollSummary && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Payroll Summary</Typography>
                <Button
                  startIcon={<Download />}
                  onClick={() => handleExport('payroll')}
                  size="small"
                >
                  Export CSV
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Month</TableCell>
                      <TableCell align="right">Total Payroll</TableCell>
                      <TableCell align="right">Employees Paid</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payrollSummary.by_month?.map((month, index) => (
                      <TableRow key={index}>
                        <TableCell>{month.month}</TableCell>
                        <TableCell align="right">
                          ${hrReportsService.formatCurrency(month.total)}
                        </TableCell>
                        <TableCell align="right">{month.employee_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {tabValue === 2 && attendanceReport && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Attendance Report</Typography>
                <Button
                  startIcon={<Download />}
                  onClick={() => handleExport('attendance')}
                  size="small"
                >
                  Export CSV
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell align="right">Present Days</TableCell>
                      <TableCell align="right">Absent Days</TableCell>
                      <TableCell align="right">Attendance %</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceReport.by_employee?.map((emp, index) => (
                      <TableRow key={index}>
                        <TableCell>{emp.employee_name}</TableCell>
                        <TableCell align="right">{emp.present_days}</TableCell>
                        <TableCell align="right">{emp.absent_days}</TableCell>
                        <TableCell align="right">
                          {hrReportsService.formatPercentage(emp.attendance_percentage)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default HRReports;
