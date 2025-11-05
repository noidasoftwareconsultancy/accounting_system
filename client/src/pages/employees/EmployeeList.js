import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const EmployeeList = () => {
  const navigate = useNavigate();
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>Employees</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/employees/new')}>
          Add Employee
        </Button>
      </Box>
      <Typography variant="body1">Employee list component - Coming soon</Typography>
    </Box>
  );
};
export default EmployeeList;