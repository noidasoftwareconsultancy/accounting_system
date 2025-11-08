import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const StockAdjustmentsPage = () => {
  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Stock Adjustments</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Adjustment
        </Button>
      </Box>
      <Typography>Stock adjustments page - Coming soon</Typography>
    </Box>
  );
};

export default StockAdjustmentsPage;
