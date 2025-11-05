import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PayrollList = () => {
  const navigate = useNavigate();
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>Payroll Runs</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/payroll/new')}>
          Create Payroll Run
        </Button>
      </Box>
      <Typography variant="body1">Payroll list component - Coming soon</Typography>
    </Box>
  );
};
export default PayrollList;