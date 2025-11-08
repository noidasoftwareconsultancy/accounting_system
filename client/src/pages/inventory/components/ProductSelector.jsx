import { Autocomplete, TextField, Box, Typography, Avatar } from '@mui/material';
import { Inventory } from '@mui/icons-material';

const ProductSelector = ({
  value,
  onChange,
  products = [],
  error = '',
  disabled = false,
  label = 'Product',
  required = false,
  helperText = ''
}) => {
  const selectedProduct = products.find(p => p.id === value) || null;

  return (
    <Autocomplete
      value={selectedProduct}
      onChange={(event, newValue) => {
        onChange(newValue ? newValue.id : null);
      }}
      options={products}
      getOptionLabel={(option) => `${option.name} (${option.sku})`}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={Boolean(error)}
          helperText={error || helperText}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            <Inventory fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {option.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              SKU: {option.sku} | Price: ${option.unit_price}
            </Typography>
          </Box>
        </Box>
      )}
      isOptionEqualToValue={(option, value) => option.id === value.id}
    />
  );
};

export default ProductSelector;
