import { Box, Button, CircularProgress } from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';

const FormActions = ({
  onSave,
  onCancel,
  loading = false,
  disabled = false,
  saveText = 'Save',
  cancelText = 'Cancel',
  saveIcon = <Save />,
  sx = {}
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', ...sx }}>
      <Button
        variant="outlined"
        onClick={onCancel}
        disabled={loading}
        startIcon={<Cancel />}
      >
        {cancelText}
      </Button>
      <Button
        variant="contained"
        onClick={onSave}
        disabled={disabled || loading}
        startIcon={loading ? <CircularProgress size={20} /> : saveIcon}
      >
        {loading ? 'Saving...' : saveText}
      </Button>
    </Box>
  );
};

export default FormActions;
