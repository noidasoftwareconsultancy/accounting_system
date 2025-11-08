import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const PurchaseOrdersPage = () => {
  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Purchase Orders</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Create Purchase Order
        </Button>
      </Box>
      <Typography>Purchase orders page - Coming soon</Typography>
    </Box>
  );
};

export default PurchaseOrdersPage;
