import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { Download } from '@mui/icons-material';

const ExportDialog = ({
  open,
  onClose,
  onExport,
  title = 'Export Data',
  columns = [],
  formats = ['csv', 'excel', 'pdf']
}) => {
  const [format, setFormat] = useState('csv');
  const [selectedColumns, setSelectedColumns] = useState(columns.map(c => c.value));
  const [loading, setLoading] = useState(false);

  const handleToggleColumn = (column) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      await onExport(format, selectedColumns);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Export Format</FormLabel>
            <RadioGroup
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              {formats.includes('csv') && (
                <FormControlLabel value="csv" control={<Radio />} label="CSV" />
              )}
              {formats.includes('excel') && (
                <FormControlLabel value="excel" control={<Radio />} label="Excel" />
              )}
              {formats.includes('pdf') && (
                <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
              )}
            </RadioGroup>
          </FormControl>
        </Box>

        {columns.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Select Columns to Export
            </Typography>
            <FormGroup>
              {columns.map((column) => (
                <FormControlLabel
                  key={column.value}
                  control={
                    <Checkbox
                      checked={selectedColumns.includes(column.value)}
                      onChange={() => handleToggleColumn(column.value)}
                    />
                  }
                  label={column.label}
                />
              ))}
            </FormGroup>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <Download />}
          disabled={loading || selectedColumns.length === 0}
        >
          {loading ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
