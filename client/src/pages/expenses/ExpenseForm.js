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
  FormControlLabel,
  Switch,
  InputAdornment
} from '@mui/material';
import { Save, Cancel, AttachMoney } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import expenseService from '../../services/expenseService';
import projectService from '../../services/projectService';
import { useApp } from '../../contexts/AppContext';

const validationSchema = yup.object({
  description: yup.string().required('Description is required'),
  amount: yup.number().min(0.01, 'Amount must be greater than 0').required('Amount is required'),
  expense_date: yup.date().required('Expense date is required'),
  category_id: yup.number(),
  vendor_id: yup.number(),
  project_id: yup.number(),
  payment_method: yup.string(),
  currency: yup.string().length(3, 'Currency must be 3 characters'),
  tax_amount: yup.number().min(0, 'Tax amount must be positive'),
  is_reimbursable: yup.boolean(),
  is_recurring: yup.boolean()
});

const ExpenseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNotification } = useApp();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [projects, setProjects] = useState([]);

  const formik = useFormik({
    initialValues: {
      description: '',
      amount: '',
      expense_date: new Date(),
      category_id: '',
      vendor_id: '',
      project_id: '',
      payment_method: '',
      currency: 'USD',
      tax_amount: '',
      is_reimbursable: false,
      is_recurring: false,
      receipt_path: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);

        // Prepare data with proper types
        const expenseData = {
          ...values,
          amount: parseFloat(values.amount),
          tax_amount: values.tax_amount ? parseFloat(values.tax_amount) : 0,
          category_id: values.category_id || null,
          vendor_id: values.vendor_id || null,
          project_id: values.project_id || null,
          expense_date: values.expense_date.toISOString().split('T')[0]
        };

        console.log('Submitting expense data:', expenseData);

        if (isEdit) {
          await expenseService.update(id, expenseData);
          addNotification({
            type: 'success',
            title: 'Success',
            message: 'Expense updated successfully'
          });
        } else {
          await expenseService.create(expenseData);
          addNotification({
            type: 'success',
            title: 'Success',
            message: 'Expense created successfully'
          });
        }

        navigate('/expenses');
      } catch (err) {
        console.error('Error saving expense:', err);
        setError(err.response?.data?.message || 'Failed to save expense');
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to save expense'
        });
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    fetchCategories();
    fetchVendors();
    fetchProjects();
    if (isEdit) {
      fetchExpense();
    }
  }, [id, isEdit]);

  const fetchExpense = async () => {
    try {
      setLoading(true);
      const response = await expenseService.getById(id);
      const expense = response.data;
      
      formik.setValues({
        description: expense.description,
        amount: expense.amount,
        expense_date: new Date(expense.expense_date),
        category_id: expense.category_id || '',
        vendor_id: expense.vendor_id || '',
        project_id: expense.project_id || '',
        payment_method: expense.payment_method || '',
        currency: expense.currency,
        tax_amount: expense.tax_amount || '',
        is_reimbursable: expense.is_reimbursable,
        is_recurring: expense.is_recurring,
        receipt_path: expense.receipt_path || ''
      });
    } catch (err) {
      console.error('Error fetching expense:', err);
      setError('Failed to fetch expense details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await expenseService.getCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await expenseService.getVendors();
      setVendors(response.data || []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAll(1, 100);
      setProjects(response.data.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formik.values.currency || 'USD'
    }).format(amount);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {isEdit ? 'Edit Expense' : 'Create Expense'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {isEdit ? 'Update expense details' : 'Record a new business expense'}
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
          {/* Expense Details */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Expense Details
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Amount"
                      name="amount"
                      value={formik.values.amount}
                      onChange={formik.handleChange}
                      error={formik.touched.amount && Boolean(formik.errors.amount)}
                      helperText={formik.touched.amount && formik.errors.amount}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
                        inputProps: { min: 0, step: 0.01 }
                      }}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Tax Amount"
                      name="tax_amount"
                      value={formik.values.tax_amount}
                      onChange={formik.handleChange}
                      error={formik.touched.tax_amount && Boolean(formik.errors.tax_amount)}
                      helperText={formik.touched.tax_amount && formik.errors.tax_amount}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment>,
                        inputProps: { min: 0, step: 0.01 }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Expense Date"
                      value={formik.values.expense_date}
                      onChange={(date) => formik.setFieldValue('expense_date', date)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={formik.touched.expense_date && Boolean(formik.errors.expense_date)}
                          helperText={formik.touched.expense_date && formik.errors.expense_date}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        name="currency"
                        value={formik.values.currency}
                        onChange={formik.handleChange}
                        label="Currency"
                      >
                        <MenuItem value="USD">USD</MenuItem>
                        <MenuItem value="EUR">EUR</MenuItem>
                        <MenuItem value="GBP">GBP</MenuItem>
                        <MenuItem value="INR">INR</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        name="category_id"
                        value={formik.values.category_id}
                        onChange={formik.handleChange}
                        label="Category"
                      >
                        <MenuItem value="">Select Category</MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Vendor</InputLabel>
                      <Select
                        name="vendor_id"
                        value={formik.values.vendor_id}
                        onChange={formik.handleChange}
                        label="Vendor"
                      >
                        <MenuItem value="">Select Vendor</MenuItem>
                        {vendors.map((vendor) => (
                          <MenuItem key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Project</InputLabel>
                      <Select
                        name="project_id"
                        value={formik.values.project_id}
                        onChange={formik.handleChange}
                        label="Project"
                      >
                        <MenuItem value="">Select Project</MenuItem>
                        {projects.map((project) => (
                          <MenuItem key={project.id} value={project.id}>
                            {project.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Payment Method</InputLabel>
                      <Select
                        name="payment_method"
                        value={formik.values.payment_method}
                        onChange={formik.handleChange}
                        label="Payment Method"
                      >
                        <MenuItem value="">Select Method</MenuItem>
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="credit_card">Credit Card</MenuItem>
                        <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                        <MenuItem value="check">Check</MenuItem>
                        <MenuItem value="online">Online Payment</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="is_reimbursable"
                          checked={formik.values.is_reimbursable}
                          onChange={formik.handleChange}
                        />
                      }
                      label="Reimbursable Expense"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="is_recurring"
                          checked={formik.values.is_recurring}
                          onChange={formik.handleChange}
                        />
                      }
                      label="Recurring Expense"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Summary */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Expense Summary
                </Typography>

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Amount:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formik.values.amount ? formatCurrency(formik.values.amount) : '-'}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Tax:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formik.values.tax_amount ? formatCurrency(formik.values.tax_amount) : '-'}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Total:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {formik.values.amount ? 
                      formatCurrency(
                        parseFloat(formik.values.amount || 0) + parseFloat(formik.values.tax_amount || 0)
                      ) : '-'
                    }
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Status:
                  </Typography>
                  <Typography variant="body2">
                    {formik.values.is_reimbursable ? 'Reimbursable' : 'Company Expense'}
                  </Typography>
                  {formik.values.is_recurring && (
                    <Typography variant="body2" color="primary">
                      Recurring Expense
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Actions */}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={() => navigate('/expenses')}
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
            {loading ? 'Saving...' : isEdit ? 'Update Expense' : 'Create Expense'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ExpenseForm;