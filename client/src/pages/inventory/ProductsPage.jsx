import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const ProductsPage = () => {
  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Products</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Product
        </Button>
      </Box>
      <Typography>Product management page - Coming soon</Typography>
    </Box>
  );
};

export default ProductsPage;
