import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Save,
  PlayArrow,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import payrollService from '../../services/payrollService';
import employeeService from '../../services/employeeService';
import { useApp } from '../../contexts/AppContext';

const PayrollForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNotification } = useApp();
  const isEdit = Boolean(id);

  // Form state
  const [formData, setFormData] = useState({
    run_name: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    start_date: null,
    end_date: null,
    description: ''
  });

  // Component state
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const steps = ['Basic Information', 'Select Employees', 'Review & Process'];

  useEffect(() => {
    if (isEdit) {
      loadPayrollRun();
    }
    loadEmployees();
  }, [id, isEdit]);

  const loadPayrollRun = async () => {
    try {
      setLoading(true);
      const response = await payrollService.getById(id);
      const run = response.data;

      setFormData({
        run_name: run.run_name || '',
        month: run.month,
        year: run.year,
        start_date: new Date(run.start_date),
        end_date: new Date(run.end_date),
        description: run.description || ''
      });
    } catch (error) {
      console.error('Error loading payroll run:', error);
      setError('Failed to load payroll run');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeeService.getAll(1, 100, { status: 'active' });
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error('Error loading employees:', error);
      setError('Failed to load employees');
    }
  };

  const generatePayrollData = async () => {
    try {
      setLoading(true);
      const employeeIds = selectedEmployees.map(emp => emp.id);
      const response = await payrollService.generatePayrollData(id, employeeIds);
      setPayrollData(response.data || []);
    } catch (error) {
      console.error('Error generating payroll data:', error);
      setError('Failed to generate payroll data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      if (isEdit) {
        await payrollService.update(id, formData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Payroll run updated successfully'
        });
      } else {
        const response = await payrollService.create(formData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Payroll run created successfully'
        });
        navigate(`/payroll/${response.data.id}/edit`);
        return;
      }
    } catch (error) {
      console.error('Error saving payroll run:', error);
      setError(error.response?.data?.message || 'Failed to save payroll run');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayroll = async () => {
    try {
      setProcessing(true);
      const employeePayslips = payrollData.map(data => ({
        employee_id: data.employee_id,
        basic_salary: data.basic_salary,
        allowances: data.allowances || 0,
        overtime_amount: data.overtime_amount || 0,
        gross_salary: data.gross_salary,
        tax_deduction: data.tax_deduction || 0,
        other_deductions: data.other_deductions || 0,
        total_deductions: data.total_deductions,
        net_salary: data.net_salary
      }));

      await payrollService.processPayroll(id, employeePayslips);

      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Payroll processed successfully'
      });

      navigate('/payroll');
    } catch (error) {
      console.error('Error processing payroll:', error);
      setError(error.response?.data?.message || 'Failed to process payroll');
    } finally {
      setProcessing(false);
      setProcessDialogOpen(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 1 && selectedEmployees.length === 0) {
      setError('Please select at least one employee');
      return;
    }

    if (activeStep === 1 && isEdit) {
      generatePayrollData();
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleEmployeeSelection = (employee, checked) => {
    if (checked) {
      setSelectedEmployees(prev => [...prev, employee]);
    } else {
      setSelectedEmployees(prev => prev.filter(emp => emp.id !== employee.id));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payroll Run Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Run Name"
                    value={formData.run_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, run_name: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth required>
                    <InputLabel>Month</InputLabel>
                    <Select
                      value={formData.month}
                      label="Month"
                      onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                          {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Start Date"
                    value={formData.start_date}
                    onChange={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="End Date"
                    value={formData.end_date}
                    onChange={(date) => setFormData(prev => ({ ...prev, end_date: date }))}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Employees
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Choose employees to include in this payroll run
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selectedEmployees.length > 0 && selectedEmployees.length < employees.length}
                          checked={employees.length > 0 && selectedEmployees.length === employees.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmployees(employees);
                            } else {
                              setSelectedEmployees([]);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>Employee</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Designation</TableCell>
                      <TableCell>Current Salary</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employees.map((employee) => {
                      const isSelected = selectedEmployees.some(emp => emp.id === employee.id);
                      return (
                        <TableRow key={employee.id} hover>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isSelected}
                              onChange={(e) => handleEmployeeSelection(employee, e.target.checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2">
                                {employee.user?.first_name} {employee.user?.last_name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                ID: {employee.employee_id}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{employee.department || '-'}</TableCell>
                          <TableCell>{employee.designation || '-'}</TableCell>
                          <TableCell>
                            {employee.salary_structures?.[0]?.basic_salary
                              ? formatCurrency(employee.salary_structures[0].basic_salary)
                              : '-'
                            }
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1 }}>
                <Typography variant="body2">
                  Selected: {selectedEmployees.length} employees
                </Typography>
              </Box>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Review Payroll Data
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : payrollData.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell align="right">Basic Salary</TableCell>
                        <TableCell align="right">Allowances</TableCell>
                        <TableCell align="right">Gross Salary</TableCell>
                        <TableCell align="right">Deductions</TableCell>
                        <TableCell align="right">Net Salary</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payrollData.map((data) => (
                        <TableRow key={data.employee_id}>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {data.employee_name}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(data.basic_salary)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(data.allowances || 0)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(data.gross_salary)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(data.total_deductions)}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2" color="primary">
                              {formatCurrency(data.net_salary)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  No payroll data generated yet. Please go back and ensure employees are selected.
                </Alert>
              )}

              {payrollData.length > 0 && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'success.main', color: 'success.contrastText', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        Total Employees: {payrollData.length}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" align="right">
                        Total Amount: {formatCurrency(
                          payrollData.reduce((sum, data) => sum + (data.net_salary || 0), 0)
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (loading && isEdit) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/payroll')}
          sx={{ mr: 2 }}
        >
          Back to Payroll
        </Button>
        <Typography variant="h4">
          {isEdit ? 'Edit Payroll Run' : 'Create Payroll Run'}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <form onSubmit={handleSubmit}>
        {renderStepContent()}

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
              >
                Next
              </Button>
            ) : (
              <>
                <Button
                  type="submit"
                  variant="outlined"
                  startIcon={<Save />}
                  disabled={loading}
                >
                  Save Draft
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={() => setProcessDialogOpen(true)}
                  disabled={loading || payrollData.length === 0}
                >
                  Process Payroll
                </Button>
              </>
            )}
          </Box>
        </Box>
      </form>

      {/* Process Confirmation Dialog */}
      <Dialog
        open={processDialogOpen}
        onClose={() => setProcessDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Process Payroll</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to process this payroll run? This will generate payslips for all selected employees.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone once completed.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProcessDialogOpen(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleProcessPayroll}
            variant="contained"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : <PlayArrow />}
          >
            {processing ? 'Processing...' : 'Process Payroll'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayrollForm;