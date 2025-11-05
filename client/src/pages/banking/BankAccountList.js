import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Add } from '@mui/icons-material';

const BankAccountList = () => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" gutterBottom>Bank Accounts</Typography>
      <Button variant="contained" startIcon={<Add />}>Add Account</Button>
    </Box>
    <Typography variant="body1">Bank account list component - Coming soon</Typography>
  </Box>
);
export default BankAccountList;