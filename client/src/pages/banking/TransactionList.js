import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Add } from '@mui/icons-material';

const TransactionList = () => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" gutterBottom>Bank Transactions</Typography>
      <Button variant="contained" startIcon={<Add />}>Add Transaction</Button>
    </Box>
    <Typography variant="body1">Transaction list component - Coming soon</Typography>
  </Box>
);
export default TransactionList;