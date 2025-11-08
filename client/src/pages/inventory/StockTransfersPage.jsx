import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const StockTransfersPage = () => {
  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Stock Transfers</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Transfer
        </Button>
      </Box>
      <Typography>Stock transfers page - Coming soon</Typography>
    </Box>
  );
};

export default StockTransfersPage;
