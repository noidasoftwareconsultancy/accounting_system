import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Typography,
  Box,
  Button
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import ProductSelector from './ProductSelector';

const LineItemsTable = ({
  items = [],
  products = [],
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  showTax = false,
  showAvailableStock = false,
  availableStock = {},
  readOnly = false
}) => {
  const calculateSubtotal = (item) => {
    return (item.quantity || 0) * (item.unit_price || 0);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const subtotal = calculateSubtotal(item);
      const tax = showTax ? (item.tax_amount || 0) : 0;
      return sum + subtotal + tax;
    }, 0);
  };

  const handleFieldChange = (index, field, value) => {
    onUpdateItem(index, { ...items[index], [field]: value });
  };

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width="40%">Product</TableCell>
              <TableCell width="15%">Quantity</TableCell>
              {showAvailableStock && <TableCell width="15%">Available</TableCell>}
              <TableCell width="15%">Unit Price</TableCell>
              {showTax && <TableCell width="15%">Tax</TableCell>}
              <TableCell width="15%" align="right">Subtotal</TableCell>
              {!readOnly && <TableCell width="60px"></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <ProductSelector
                    value={item.product_id}
                    onChange={(productId) => {
                      const product = products.find(p => p.id === productId);
                      handleFieldChange(index, 'product_id', productId);
                      if (product && !item.unit_price) {
                        handleFieldChange(index, 'unit_price', product.unit_price);
                      }
                    }}
                    products={products}
                    disabled={readOnly}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={item.quantity || ''}
                    onChange={(e) => handleFieldChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    size="small"
                    fullWidth
                    disabled={readOnly}
                    inputProps={{ min: 0, step: 1 }}
                  />
                </TableCell>
                {showAvailableStock && (
                  <TableCell>
                    <Typography variant="body2" color={
                      (availableStock[item.product_id] || 0) < (item.quantity || 0)
                        ? 'error'
                        : 'text.secondary'
                    }>
                      {availableStock[item.product_id] || 0}
                    </Typography>
                  </TableCell>
                )}
                <TableCell>
                  <TextField
                    type="number"
                    value={item.unit_price || ''}
                    onChange={(e) => handleFieldChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    size="small"
                    fullWidth
                    disabled={readOnly}
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{
                      startAdornment: <Typography variant="body2" sx={{ mr: 0.5 }}>$</Typography>
                    }}
                  />
                </TableCell>
                {showTax && (
                  <TableCell>
                    <TextField
                      type="number"
                      value={item.tax_amount || ''}
                      onChange={(e) => handleFieldChange(index, 'tax_amount', parseFloat(e.target.value) || 0)}
                      size="small"
                      fullWidth
                      disabled={readOnly}
                      inputProps={{ min: 0, step: 0.01 }}
                      InputProps={{
                        startAdornment: <Typography variant="body2" sx={{ mr: 0.5 }}>$</Typography>
                      }}
                    />
                  </TableCell>
                )}
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium">
                    ${calculateSubtotal(item).toFixed(2)}
                  </Typography>
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => onRemoveItem(index)}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={showTax ? 7 : 6} align="center">
                  <Typography variant="body2" color="text.secondary" py={2}>
                    No items added yet
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!readOnly && (
        <Button
          startIcon={<Add />}
          onClick={onAddItem}
          sx={{ mt: 2 }}
          variant="outlined"
        >
          Add Item
        </Button>
      )}

      {items.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Box sx={{ minWidth: 200 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Subtotal:</Typography>
              <Typography variant="body2" fontWeight="medium">
                ${items.reduce((sum, item) => sum + calculateSubtotal(item), 0).toFixed(2)}
              </Typography>
            </Box>
            {showTax && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Tax:</Typography>
                <Typography variant="body2" fontWeight="medium">
                  ${items.reduce((sum, item) => sum + (item.tax_amount || 0), 0).toFixed(2)}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary">
                ${calculateTotal().toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default LineItemsTable;
