import { Box, Typography, Grid, Paper, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import ReorderAutomation from '../../components/inventory/ReorderAutomation';

const AutomationDashboard = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Inventory Automation
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label="Reorder Automation" />
          <Tab label="Stock Alerts" />
          <Tab label="Backorders" />
        </Tabs>
      </Paper>

      {tab === 0 && <ReorderAutomation />}
      {tab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography>Stock Alerts - Coming in next update</Typography>
        </Paper>
      )}
      {tab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography>Backorder Management - Coming in next update</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AutomationDashboard;
