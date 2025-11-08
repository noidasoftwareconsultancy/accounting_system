import { useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Chip,
  Collapse,
  IconButton,
  Typography
} from '@mui/material';
import { FilterList, Clear, ExpandMore, ExpandLess } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const AdvancedFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  categories = [],
  warehouses = [],
  statuses = [],
  showDateRange = false,
  showPriceRange = false,
  showStockLevel = false
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== '').length;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: expanded ? 2 : 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList />
          <Typography variant="h6">Filters</Typography>
          {activeFilterCount > 0 && (
            <Chip label={`${activeFilterCount} active`} size="small" color="primary" />
          )}
        </Box>
        <Box>
          {activeFilterCount > 0 && (
            <Button
              startIcon={<Clear />}
              onClick={onClearFilters}
              size="small"
              sx={{ mr: 1 }}
            >
              Clear All
            </Button>
          )}
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search"
              value={filters.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
              placeholder="Search by name, SKU..."
            />
          </Grid>

          {categories.length > 0 && (
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Category"
                value={filters.category || ''}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          {warehouses.length > 0 && (
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Warehouse"
                value={filters.warehouse || ''}
                onChange={(e) => handleChange('warehouse', e.target.value)}
              >
                <MenuItem value="">All Warehouses</MenuItem>
                {warehouses.map((wh) => (
                  <MenuItem key={wh.id} value={wh.id}>
                    {wh.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          {statuses.length > 0 && (
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Status"
                value={filters.status || ''}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {statuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          {showDateRange && (
            <>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="From Date"
                  value={filters.dateFrom || null}
                  onChange={(date) => handleChange('dateFrom', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="To Date"
                  value={filters.dateTo || null}
                  onChange={(date) => handleChange('dateTo', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </>
          )}

          {showPriceRange && (
            <>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Min Price"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleChange('minPrice', e.target.value)}
                  InputProps={{ startAdornment: '$' }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Price"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleChange('maxPrice', e.target.value)}
                  InputProps={{ startAdornment: '$' }}
                />
              </Grid>
            </>
          )}

          {showStockLevel && (
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Stock Level"
                value={filters.stockLevel || ''}
                onChange={(e) => handleChange('stockLevel', e.target.value)}
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="in_stock">In Stock</MenuItem>
                <MenuItem value="low_stock">Low Stock</MenuItem>
                <MenuItem value="out_of_stock">Out of Stock</MenuItem>
              </TextField>
            </Grid>
          )}
        </Grid>
      </Collapse>
    </Paper>
  );
};

export default AdvancedFilters;
