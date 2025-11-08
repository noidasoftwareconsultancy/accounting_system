import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { Upload, Download } from '@mui/icons-material';

const ImportDialog = ({
  open,
  onClose,
  onImport,
  title = 'Import Data',
  templateUrl,
  acceptedFormats = '.csv,.xlsx'
}) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setErrors([]);
    setSuccess(null);
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setProgress(0);
    setErrors([]);

    try {
      const result = await onImport(file, (progressValue) => {
        setProgress(progressValue);
      });

      if (result.errors && result.errors.length > 0) {
        setErrors(result.errors);
      }

      if (result.success) {
        setSuccess(`Successfully imported ${result.count} records`);
        setTimeout(() => {
          onClose();
          setFile(null);
          setSuccess(null);
        }, 2000);
      }
    } catch (error) {
      setErrors([error.message || 'Import failed']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {templateUrl && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Download the template file to see the required format
            </Typography>
            <Button
              size="small"
              startIcon={<Download />}
              href={templateUrl}
              download
              sx={{ mt: 1 }}
            >
              Download Template
            </Button>
          </Alert>
        )}

        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 1,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': { borderColor: 'primary.main' }
          }}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept={acceptedFormats}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <Upload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body1">
            {file ? file.name : 'Click to select file or drag and drop'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Accepted formats: {acceptedFormats}
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Importing... {progress}%
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}

        {errors.length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Import Errors:
            </Typography>
            <List dense>
              {errors.slice(0, 5).map((error, index) => (
                <ListItem key={index}>
                  <ListItemText primary={error} />
                </ListItem>
              ))}
              {errors.length > 5 && (
                <Typography variant="caption">
                  ... and {errors.length - 5} more errors
                </Typography>
              )}
            </List>
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={!file || loading}
          startIcon={<Upload />}
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportDialog;
