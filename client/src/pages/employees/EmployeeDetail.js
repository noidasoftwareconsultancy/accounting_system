import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit,
  Delete,
  Person,
  Work,
  AccountBalance,
  Schedule,
  Payment,
  History,
  Add,
  Download
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useParams, useNavigate } from 'react-router-dom';
import employeeService from '../../services/employeeService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useApp();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({});
  const [salaryHistory, setSalaryHistory] = useState([]);

  // Attendance form state
  const [attendanceForm, setAttendanceForm] = useState({
    date: new Date(),
    status: 'present',
    hours_worked: 8,
    notes: ''
  });

  // Salary form state
  const [salaryForm, setSalaryForm] = useState({
    basic_salary: '',
    hra: '',
    conveyance: '',
    medical_allowance: '',
    special_allowance: '',
    provident_fund: '',
    tax_deduction: '',
    other_deductions: '',
    effective_from: new Date()
  });

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  useEffect(() => {
    if (employee && currentTab === 1) {
      fetchAttendance();
      fetchAttendanceSummary();
    } else if (employee && currentTab === 2) {
      fetchSalaryHistory();
    }
  }, [employee, currentTab]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getById(id);
      setEmployee(response.data);
    } catch (error) {
      console.error('Error fetching employee:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch employee details'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
      const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

      const response = await employeeService.getAttendance(id, startDate, endDate);
      setAttendance(response.data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchAttendanceSummary = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const response = await employeeService.getAttendanceSummary(id, currentMonth, currentYear);
      setAttendanceSummary(response.data || {});
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
    }
  };

  const fetchSalaryHistory = async () => {
    try {
      const response = await employeeService.getSalaryHistory(id);
      setSalaryHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching salary history:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await employeeService.delete(id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Employee deleted successfully'
      });
      navigate('/employees');
    } catch (error) {
      console.error('Error deleting employee:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete employee'
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleRecordAttendance = async () => {
    try {
      await employeeService.recordAttendance({
        employee_id: parseInt(id),
        date: attendanceForm.date.toISOString().split('T')[0],
        status: attendanceForm.status,
        hours_worked: attendanceForm.hours_worked,
        notes: attendanceForm.notes
      });

      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Attendance recorded successfully'
      });

      setAttendanceDialogOpen(false);
      fetchAttendance();
      fetchAttendanceSummary();
    } catch (error) {
      console.error('Error recording attendance:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to record attendance'
      });
    }
  };

  const handleUpdateSalary = async () => {
    try {
      await employeeService.updateSalaryStructure(id, salaryForm);

      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Salary structure updated successfully'
      });

      setSalaryDialogOpen(false);
      fetchEmployee();
      fetchSalaryHistory();
    } catch (error) {
      console.error('Error updating salary:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update salary structure'
      });
    }
  };

  const getStatusColor = () => {
    if (employee?.termination_date) return 'error';
    return 'success';
  };

  const getStatusText = () => {
    if (employee?.termination_date) return 'Terminated';
    return 'Active';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateGrossSalary = (salary) => {
    return parseFloat(salary.basic_salary || 0) +
      parseFloat(salary.hra || 0) +
      parseFloat(salary.conveyance || 0) +
      parseFloat(salary.medical_allowance || 0) +
      parseFloat(salary.special_allowance || 0);
  };

  const calculateNetSalary = (salary) => {
    const gross = calculateGrossSalary(salary);
    return gross -
      parseFloat(salary.provident_fund || 0) -
      parseFloat(salary.tax_deduction || 0) -
      parseFloat(salary.other_deductions || 0);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!employee) {
    return (
      <Box>
        <Alert severity="error">Employee not found</Alert>
      </Box>
    );
  }

  const currentSalary = employee.salary_structures?.[0];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ width: 64, height: 64, mr: 2, fontSize: '1.5rem' }}>
            {employee.user?.first_name?.[0] || employee.employee_id[0]}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1">
              {employee.user?.first_name && employee.user?.last_name
                ? `${employee.user.first_name} ${employee.user.last_name}`
                : employee.employee_id
              }
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {employee.designation} • {employee.department}
            </Typography>
            <Chip
              label={getStatusText()}
              color={getStatusColor()}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/employees/${id}/edit`)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab label="Overview" />
          <Tab label="Attendance" />
          <Tab label="Salary History" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Person sx={{ mr: 1 }} />
                  <Typography variant="h6">Personal Information</Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">Employee ID</Typography>
                  <Typography variant="body1">{employee.employee_id}</Typography>
                </Box>

                {employee.user && (
                  <>
                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary">Full Name</Typography>
                      <Typography variant="body1">
                        {employee.user.first_name} {employee.user.last_name}
                      </Typography>
                    </Box>

                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary">Email</Typography>
                      <Typography variant="body1">{employee.user.email}</Typography>
                    </Box>
                  </>
                )}

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">Join Date</Typography>
                  <Typography variant="body1">
                    {new Date(employee.join_date).toLocaleDateString()}
                  </Typography>
                </Box>

                {employee.termination_date && (
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">Termination Date</Typography>
                    <Typography variant="body1">
                      {new Date(employee.termination_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Job Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Work sx={{ mr: 1 }} />
                  <Typography variant="h6">Job Information</Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">Department</Typography>
                  <Typography variant="body1">{employee.department || '-'}</Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">Designation</Typography>
                  <Typography variant="body1">{employee.designation || '-'}</Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">Status</Typography>
                  <Chip
                    label={getStatusText()}
                    color={getStatusColor()}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Banking Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AccountBalance sx={{ mr: 1 }} />
                  <Typography variant="h6">Banking Information</Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">Bank Account</Typography>
                  <Typography variant="body1">{employee.bank_account || '-'}</Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">Bank Name</Typography>
                  <Typography variant="body1">{employee.bank_name || '-'}</Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">Tax ID</Typography>
                  <Typography variant="body1">{employee.tax_id || '-'}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Current Salary */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center">
                    <Payment sx={{ mr: 1 }} />
                    <Typography variant="h6">Current Salary</Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => {
                      if (currentSalary) {
                        setSalaryForm({
                          basic_salary: currentSalary.basic_salary,
                          hra: currentSalary.hra,
                          conveyance: currentSalary.conveyance,
                          medical_allowance: currentSalary.medical_allowance,
                          special_allowance: currentSalary.special_allowance,
                          provident_fund: currentSalary.provident_fund,
                          tax_deduction: currentSalary.tax_deduction,
                          other_deductions: currentSalary.other_deductions,
                          effective_from: new Date()
                        });
                      }
                      setSalaryDialogOpen(true);
                    }}
                  >
                    Update
                  </Button>
                </Box>

                {currentSalary ? (
                  <>
                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary">Basic Salary</Typography>
                      <Typography variant="body1">{formatCurrency(currentSalary.basic_salary)}</Typography>
                    </Box>

                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary">Gross Salary</Typography>
                      <Typography variant="body1" color="primary">
                        {formatCurrency(calculateGrossSalary(currentSalary))}
                      </Typography>
                    </Box>

                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary">Net Salary</Typography>
                      <Typography variant="body1" color="success.main" fontWeight="bold">
                        {formatCurrency(calculateNetSalary(currentSalary))}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="textSecondary">Effective From</Typography>
                      <Typography variant="body1">
                        {new Date(currentSalary.effective_from).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No salary structure defined
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentTab === 1 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Attendance Records</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAttendanceDialogOpen(true)}
            >
              Record Attendance
            </Button>
          </Box>

          {/* Attendance Summary */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{attendanceSummary.present || 0}</Typography>
                  <Typography variant="body2" color="textSecondary">Present Days</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{attendanceSummary.absent || 0}</Typography>
                  <Typography variant="body2" color="textSecondary">Absent Days</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{attendanceSummary.halfDay || 0}</Typography>
                  <Typography variant="body2" color="textSecondary">Half Days</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{attendanceSummary.totalHours || 0}</Typography>
                  <Typography variant="body2" color="textSecondary">Total Hours</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Attendance Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Hours Worked</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {new Date(record.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          color={record.status === 'present' ? 'success' :
                            record.status === 'absent' ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{record.hours_worked || '-'}</TableCell>
                      <TableCell>{record.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {currentTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>Salary History</Typography>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Effective From</TableCell>
                    <TableCell>Effective To</TableCell>
                    <TableCell>Basic Salary</TableCell>
                    <TableCell>Gross Salary</TableCell>
                    <TableCell>Net Salary</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salaryHistory.map((salary) => (
                    <TableRow key={salary.id}>
                      <TableCell>
                        {new Date(salary.effective_from).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {salary.effective_to
                          ? new Date(salary.effective_to).toLocaleDateString()
                          : 'Current'
                        }
                      </TableCell>
                      <TableCell>{formatCurrency(salary.basic_salary)}</TableCell>
                      <TableCell>{formatCurrency(calculateGrossSalary(salary))}</TableCell>
                      <TableCell>{formatCurrency(calculateNetSalary(salary))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Record Attendance Dialog */}
      <Dialog open={attendanceDialogOpen} onClose={() => setAttendanceDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Attendance</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <DatePicker
              label="Date"
              value={attendanceForm.date}
              onChange={(date) => setAttendanceForm({ ...attendanceForm, date })}
              renderInput={(params) => (
                <TextField {...params} fullWidth margin="normal" />
              )}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={attendanceForm.status}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="absent">Absent</MenuItem>
                <MenuItem value="half-day">Half Day</MenuItem>
                <MenuItem value="leave">Leave</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Hours Worked"
              type="number"
              value={attendanceForm.hours_worked}
              onChange={(e) => setAttendanceForm({ ...attendanceForm, hours_worked: e.target.value })}
              margin="normal"
              InputProps={{ inputProps: { min: 0, max: 24, step: 0.5 } }}
            />

            <TextField
              fullWidth
              label="Notes"
              value={attendanceForm.notes}
              onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttendanceDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRecordAttendance} variant="contained">
            Record
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Salary Dialog */}
      <Dialog open={salaryDialogOpen} onClose={() => setSalaryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update Salary Structure</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Basic Salary"
                  type="number"
                  value={salaryForm.basic_salary}
                  onChange={(e) => setSalaryForm({ ...salaryForm, basic_salary: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="HRA"
                  type="number"
                  value={salaryForm.hra}
                  onChange={(e) => setSalaryForm({ ...salaryForm, hra: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Conveyance"
                  type="number"
                  value={salaryForm.conveyance}
                  onChange={(e) => setSalaryForm({ ...salaryForm, conveyance: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Medical Allowance"
                  type="number"
                  value={salaryForm.medical_allowance}
                  onChange={(e) => setSalaryForm({ ...salaryForm, medical_allowance: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Special Allowance"
                  type="number"
                  value={salaryForm.special_allowance}
                  onChange={(e) => setSalaryForm({ ...salaryForm, special_allowance: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Provident Fund"
                  type="number"
                  value={salaryForm.provident_fund}
                  onChange={(e) => setSalaryForm({ ...salaryForm, provident_fund: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tax Deduction"
                  type="number"
                  value={salaryForm.tax_deduction}
                  onChange={(e) => setSalaryForm({ ...salaryForm, tax_deduction: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Other Deductions"
                  type="number"
                  value={salaryForm.other_deductions}
                  onChange={(e) => setSalaryForm({ ...salaryForm, other_deductions: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  label="Effective From"
                  value={salaryForm.effective_from}
                  onChange={(date) => setSalaryForm({ ...salaryForm, effective_from: date })}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth margin="normal" />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSalaryDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateSalary} variant="contained">
            Update Salary
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete "${employee.user?.first_name} ${employee.user?.last_name || employee.employee_id}"? This action cannot be undone.`}
      />
    </Box>
  );
};

export default EmployeeDetail;