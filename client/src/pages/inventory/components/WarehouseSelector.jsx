import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

const WarehouseSelector = ({
  value,
  onChange,
  warehouses = [],
  error = '',
  disabled = false,
  label = 'Warehouse',
  required = false,
  excludeId = null,
  helperText = ''
}) => {
  const filteredWarehouses = excludeId
    ? warehouses.filter(w => w.id !== excludeId)
    : warehouses;

  return (
    <FormControl fullWidth error={Boolean(error)} disabled={disabled} required={required}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        label={label}
      >
        <MenuItem value="">
          <em>Select {label}</em>
        </MenuItem>
        {filteredWarehouses.map((warehouse) => (
          <MenuItem key={warehouse.id} value={warehouse.id}>
            {warehouse.name} ({warehouse.code})
          </MenuItem>
        ))}
      </Select>
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default WarehouseSelector;
