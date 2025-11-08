import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Alert
} from '@mui/material';
import { QrCodeScanner, Close } from '@mui/icons-material';

const BarcodeScanner = ({
  open,
  onClose,
  onScan,
  title = 'Scan Barcode'
}) => {
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && barcode) {
      handleScan();
    }
  };

  const handleScan = () => {
    if (!barcode.trim()) {
      setError('Please enter a barcode');
      return;
    }

    onScan(barcode.trim());
    setBarcode('');
    setError('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCodeScanner />
          {title}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Use a USB barcode scanner or manually enter the barcode
        </Alert>

        <TextField
          fullWidth
          label="Barcode"
          value={barcode}
          onChange={(e) => {
            setBarcode(e.target.value);
            setError('');
          }}
          onKeyPress={handleKeyPress}
          inputRef={inputRef}
          error={Boolean(error)}
          helperText={error}
          autoFocus
          placeholder="Scan or type barcode..."
        />

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Press Enter after scanning or typing
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<Close />}>
          Close
        </Button>
        <Button
          onClick={handleScan}
          variant="contained"
          disabled={!barcode.trim()}
        >
          Scan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BarcodeScanner;
