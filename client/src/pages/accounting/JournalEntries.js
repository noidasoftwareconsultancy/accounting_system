import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Add } from '@mui/icons-material';

const JournalEntries = () => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" gutterBottom>Journal Entries</Typography>
      <Button variant="contained" startIcon={<Add />}>Create Entry</Button>
    </Box>
    <Typography variant="body1">Journal entries component - Coming soon</Typography>
  </Box>
);
export default JournalEntries;