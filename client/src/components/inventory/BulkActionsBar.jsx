import {
  Box,
  Paper,
  Typography,
  Button,
  Menu,
  MenuItem,
  Chip,
  IconButton
} from '@mui/material';
import {
  Delete,
  Edit,
  MoreVert,
  Close,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useState } from 'react';

const BulkActionsBar = ({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkActivate,
  onBulkDeactivate,
  onBulkEdit,
  customActions = []
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  if (selectedCount === 0) return null;

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        boxShadow: 4
      }}
    >
      <Chip
        label={`${selectedCount} selected`}
        color="primary"
        onDelete={onClearSelection}
        deleteIcon={<Close />}
      />

      <Box sx={{ display: 'flex', gap: 1 }}>
        {onBulkDelete && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={onBulkDelete}
            size="small"
          >
            Delete
          </Button>
        )}

        {onBulkActivate && (
          <Button
            variant="outlined"
            color="success"
            startIcon={<CheckCircle />}
            onClick={onBulkActivate}
            size="small"
          >
            Activate
          </Button>
        )}

        {onBulkDeactivate && (
          <Button
            variant="outlined"
            color="warning"
            startIcon={<Cancel />}
            onClick={onBulkDeactivate}
            size="small"
          >
            Deactivate
          </Button>
        )}

        {onBulkEdit && (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={onBulkEdit}
            size="small"
          >
            Edit
          </Button>
        )}

        {customActions.length > 0 && (
          <>
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              {customActions.map((action, index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    action.onClick();
                    setAnchorEl(null);
                  }}
                >
                  {action.icon && <Box sx={{ mr: 1 }}>{action.icon}</Box>}
                  {action.label}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default BulkActionsBar;
