import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  Autocomplete
} from '@mui/material';
import { Save, Cancel, Person, Work, AccountBalance } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import employeeService from '../../services/employeeService';
import { useApp } from '../../contexts/AppContext';

const validationSchema = yup.object({
  employee_id: yup.string().required('Employee ID is required'),
  first_name: yup.string().when('create_user', {
    is: true,
    then: (schema) => schema.required('First name is required'),
    otherwise: (schema) => schema
  }),
  last_name: yup.string().when('create_user', {
    is: true,
    then: (schema) => schema.required('Last name is required'),
    otherwise: (schema) => schema
  }),
  email: yup.string().when('create_user', {
    is: true,
    then: (schema) => schema.email('Invalid email').required('Email is required'),
    otherwise: (schema) => schema.email('Invalid email')
  }),
  join_date: yup.date().required('Join date is required'),
  department: yup.string(),
  designation: yup.string(),
  bank_account: yup.string(),
  bank_name: yup.string(),
  tax_id: yup.string(),
  basic_salary: yup.number().min(0, 'Salary must be positive'),
  hra: yup.number().min(0, 'HRA must be positive'),
  conveyance: yup.number().min(0, 'Conveyance must be positive'),
  medical_allowance: yup.number().min(0, 'Medical allowance must be positive'),
  special_allowance: yup.number().min(0, 'Special allowance must be positive'),
  provident_fund: yup.number().min(0, 'PF must be positive'),
  tax_deduction: yup.number().min(0, 'Tax deduction must be positive'),
  other_deductions: yup.number().min(0, 'Other deductions must be positive')
});

const departments = [
  'Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 
  'Customer Support', 'Product', 'Design', 'Legal', 'Administration'
];

const designations = [
  'Software Engineer', 'Senior Software Engineer', 'Tech Lead', 'Engineering Manager',
  'Sales Executive', 'Sales Manager', 'Marketing Executive', 'Marketing Manager',
  'HR Executive', 'HR Manager', 'Finance Executive', 'Finance Manager',
  'Operations Executive', 'Operations Manager', 'Product Manager', 'Designer',
  'Customer Support Executive', 'Team Lead', 'Director', 'VP', 'CEO', 'CTO', 'CFO'
];

const EmployeeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNotification } = useApp();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createUser, setCreateUser] = useState(!isEdit);

  const formik = useFormik({
    initialValues: {
      employee_id: '',
      first_name: '',
      last_name: '',
      email: '',
      username: '',
      department: '',
      designation: '',
      join_date: new Date(),
      termination_date: null,
      bank_account: '',
      bank_name: '',
      tax_id: '',
      create_user: !isEdit,
      // Salary structure fields
      basic_salary: '',
      hra: '',
      conveyance: '',
      medical_allowance: '',
      special_allowance: '',
      provident_fund: '',
      tax_deduction: '',
      other_deductions: '',
      effective_from: new Date()
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);

        // Prepare employee data
        const employeeData = {
          employee_id: values.employee_id,
          department: values.department || null,
          designation: values.designation || null,
          join_date: values.join_date.toISOString().split('T')[0],
          termination_date: values.termination_date ? values.termination_date.toISOString().split('T')[0] : null,
          bank_account: values.bank_account || null,
          bank_name: values.bank_name || null,
          tax_id: values.tax_id || null
        };

        // Add user data if creating user
        if (values.create_user && !isEdit) {
          employeeData.user_data = {
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
            username: values.username || values.email,
            role: 'employee'
          };
        }

        let employee;
        if (isEdit) {
          employee = await employeeService.update(id, employeeData);
        } else {
          employee = await employeeService.create(employeeData);
        }

        // Create salary structure if provided
        if (values.basic_salary && parseFloat(values.basic_salary) > 0) {
          const salaryData = {
            employee_id: employee.data.id,
            basic_salary: parseFloat(values.basic_salary),
            hra: parseFloat(values.hra || 0),
            conveyance: parseFloat(values.conveyance || 0),
            medical_allowance: parseFloat(values.medical_allowance || 0),
            special_allowance: parseFloat(values.special_allowance || 0),
            provident_fund: parseFloat(values.provident_fund || 0),
            tax_deduction: parseFloat(values.tax_deduction || 0),
            other_deductions: parseFloat(values.other_deductions || 0),
            effective_from: values.effective_from.toISOString().split('T')[0]
          };

          if (isEdit) {
            await employeeService.updateSalaryStructure(id, salaryData);
          } else {
            await employeeService.createSalaryStructure(salaryData);
          }
        }

        addNotification({
          type: 'success',
          title: 'Success',
          message: `Employee ${isEdit ? 'updated' : 'created'} successfully`
        });

        navigate('/employees');
      } catch (err) {
        console.error('Error saving employee:', err);
        setError(err.response?.data?.message || 'Failed to save employee');
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to save employee'
        });
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (isEdit) {
      fetchEmployee();
    }
  }, [id, isEdit]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getById(id);
      const employee = response.data;
      
      formik.setValues({
        employee_id: employee.employee_id,
        first_name: employee.user?.first_name || '',
        last_name: employee.user?.last_name || '',
        email: employee.user?.email || '',
        username: employee.user?.username || '',
        department: employee.department || '',
        designation: employee.designation || '',
        join_date: new Date(employee.join_date),
        termination_date: employee.termination_date ? new Date(employee.termination_date) : null,
        bank_account: employee.bank_account || '',
        bank_name: employee.bank_name || '',
        tax_id: employee.tax_id || '',
        create_user: false,
        // Salary structure (latest)
        basic_salary: employee.salary_structures?.[0]?.basic_salary || '',
        hra: employee.salary_structures?.[0]?.hra || '',
        conveyance: employee.salary_structures?.[0]?.conveyance || '',
        medical_allowance: employee.salary_structures?.[0]?.medical_allowance || '',
        special_allowance: employee.salary_structures?.[0]?.special_allowance || '',
        provident_fund: employee.salary_structures?.[0]?.provident_fund || '',
        tax_deduction: employee.salary_structures?.[0]?.tax_deduction || '',
        other_deductions: employee.salary_structures?.[0]?.other_deductions || '',
        effective_from: new Date()
      });
    } catch (err) {
      console.error('Error fetching employee:', err);
      setError('Failed to fetch employee details');
    } finally {
      setLoading(false);
    }
  };

  const calculateGrossSalary = () => {
    const basic = parseFloat(formik.values.basic_salary || 0);
    const hra = parseFloat(formik.values.hra || 0);
    const conveyance = parseFloat(formik.values.conveyance || 0);
    const medical = parseFloat(formik.values.medical_allowance || 0);
    const special = parseFloat(formik.values.special_allowance || 0);
    return basic + hra + conveyance + medical + special;
  };

  const calculateNetSalary = () => {
    const gross = calculateGrossSalary();
    const pf = parseFloat(formik.values.provident_fund || 0);
    const tax = parseFloat(formik.values.tax_deduction || 0);
    const other = parseFloat(formik.values.other_deductions || 0);
    return gross - pf - tax - other;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {isEdit ? 'Edit Employee' : 'Add New Employee'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {isEdit ? 'Update employee information' : 'Create a new employee record'}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Person sx={{ mr: 1 }} />
                  <Typography variant="h6">Personal Information</Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Employee ID"
                      name="employee_id"
                      value={formik.values.employee_id}
                      onChange={formik.handleChange}
                      error={formik.touched.employee_id && Boolean(formik.errors.employee_id)}
                      helperText={formik.touched.employee_id && formik.errors.employee_id}
                      required
                      disabled={isEdit}
                    />
                  </Grid>

                  {!isEdit && (
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={createUser}
                            onChange={(e) => {
                              setCreateUser(e.target.checked);
                              formik.setFieldValue('create_user', e.target.checked);
                            }}
                          />
                        }
                        label="Create system user account"
                      />
                    </Grid>
                  )}

                  {(createUser || isEdit) && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="first_name"
                          value={formik.values.first_name}
                          onChange={formik.handleChange}
                          error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                          helperText={formik.touched.first_name && formik.errors.first_name}
                          required={createUser}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="last_name"
                          value={formik.values.last_name}
                          onChange={formik.handleChange}
                          error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                          helperText={formik.touched.last_name && formik.errors.last_name}
                          required={createUser}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          error={formik.touched.email && Boolean(formik.errors.email)}
                          helperText={formik.touched.email && formik.errors.email}
                          required={createUser}
                        />
                      </Grid>

                      {!isEdit && (
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Username"
                            name="username"
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            helperText="Leave blank to use email as username"
                          />
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Summary Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Employee Summary
                </Typography>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Employee ID:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formik.values.employee_id || '-'}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Department:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formik.values.department || '-'}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Designation:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formik.values.designation || '-'}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Gross Salary:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" color="primary">
                    {formatCurrency(calculateGrossSalary())}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Net Salary:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {formatCurrency(calculateNetSalary())}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Job Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Work sx={{ mr: 1 }} />
                  <Typography variant="h6">Job Information</Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      options={departments}
                      value={formik.values.department}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('department', newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Department"
                          error={formik.touched.department && Boolean(formik.errors.department)}
                          helperText={formik.touched.department && formik.errors.department}
                        />
                      )}
                      freeSolo
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      options={designations}
                      value={formik.values.designation}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('designation', newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Designation"
                          error={formik.touched.designation && Boolean(formik.errors.designation)}
                          helperText={formik.touched.designation && formik.errors.designation}
                        />
                      )}
                      freeSolo
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <DatePicker
                      label="Join Date"
                      value={formik.values.join_date}
                      onChange={(date) => formik.setFieldValue('join_date', date)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={formik.touched.join_date && Boolean(formik.errors.join_date)}
                          helperText={formik.touched.join_date && formik.errors.join_date}
                          required
                        />
                      )}
                    />
                  </Grid>

                  {isEdit && (
                    <Grid item xs={12} md={4}>
                      <DatePicker
                        label="Termination Date"
                        value={formik.values.termination_date}
                        onChange={(date) => formik.setFieldValue('termination_date', date)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            helperText="Leave blank if employee is active"
                          />
                        )}
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Banking Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AccountBalance sx={{ mr: 1 }} />
                  <Typography variant="h6">Banking & Tax Information</Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Bank Account Number"
                      name="bank_account"
                      value={formik.values.bank_account}
                      onChange={formik.handleChange}
                      error={formik.touched.bank_account && Boolean(formik.errors.bank_account)}
                      helperText={formik.touched.bank_account && formik.errors.bank_account}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Bank Name"
                      name="bank_name"
                      value={formik.values.bank_name}
                      onChange={formik.handleChange}
                      error={formik.touched.bank_name && Boolean(formik.errors.bank_name)}
                      helperText={formik.touched.bank_name && formik.errors.bank_name}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Tax ID / SSN"
                      name="tax_id"
                      value={formik.values.tax_id}
                      onChange={formik.handleChange}
                      error={formik.touched.tax_id && Boolean(formik.errors.tax_id)}
                      helperText={formik.touched.tax_id && formik.errors.tax_id}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Salary Structure */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Salary Structure
                </Typography>
                <Typography variant="body2" color="textSecondary" mb={2}>
                  {isEdit ? 'Update salary structure (will create new effective from today)' : 'Initial salary structure'}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Basic Salary"
                      name="basic_salary"
                      type="number"
                      value={formik.values.basic_salary}
                      onChange={formik.handleChange}
                      error={formik.touched.basic_salary && Boolean(formik.errors.basic_salary)}
                      helperText={formik.touched.basic_salary && formik.errors.basic_salary}
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="HRA"
                      name="hra"
                      type="number"
                      value={formik.values.hra}
                      onChange={formik.handleChange}
                      error={formik.touched.hra && Boolean(formik.errors.hra)}
                      helperText={formik.touched.hra && formik.errors.hra}
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Conveyance"
                      name="conveyance"
                      type="number"
                      value={formik.values.conveyance}
                      onChange={formik.handleChange}
                      error={formik.touched.conveyance && Boolean(formik.errors.conveyance)}
                      helperText={formik.touched.conveyance && formik.errors.conveyance}
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Medical Allowance"
                      name="medical_allowance"
                      type="number"
                      value={formik.values.medical_allowance}
                      onChange={formik.handleChange}
                      error={formik.touched.medical_allowance && Boolean(formik.errors.medical_allowance)}
                      helperText={formik.touched.medical_allowance && formik.errors.medical_allowance}
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Special Allowance"
                      name="special_allowance"
                      type="number"
                      value={formik.values.special_allowance}
                      onChange={formik.handleChange}
                      error={formik.touched.special_allowance && Boolean(formik.errors.special_allowance)}
                      helperText={formik.touched.special_allowance && formik.errors.special_allowance}
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Provident Fund"
                      name="provident_fund"
                      type="number"
                      value={formik.values.provident_fund}
                      onChange={formik.handleChange}
                      error={formik.touched.provident_fund && Boolean(formik.errors.provident_fund)}
                      helperText={formik.touched.provident_fund && formik.errors.provident_fund}
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Tax Deduction"
                      name="tax_deduction"
                      type="number"
                      value={formik.values.tax_deduction}
                      onChange={formik.handleChange}
                      error={formik.touched.tax_deduction && Boolean(formik.errors.tax_deduction)}
                      helperText={formik.touched.tax_deduction && formik.errors.tax_deduction}
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Other Deductions"
                      name="other_deductions"
                      type="number"
                      value={formik.values.other_deductions}
                      onChange={formik.handleChange}
                      error={formik.touched.other_deductions && Boolean(formik.errors.other_deductions)}
                      helperText={formik.touched.other_deductions && formik.errors.other_deductions}
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    />
                  </Grid>

                  {isEdit && (
                    <Grid item xs={12} md={4}>
                      <DatePicker
                        label="Effective From"
                        value={formik.values.effective_from}
                        onChange={(date) => formik.setFieldValue('effective_from', date)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            helperText="Date from which new salary will be effective"
                          />
                        )}
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Actions */}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={() => navigate('/employees')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save />}
            disabled={loading}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Employee' : 'Create Employee'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default EmployeeForm;