import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import {
  Assessment as ReportIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';

const ReportCard = ({ title, description, icon, onClick }) => (
  <Card>
    <CardActionArea onClick={onClick}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h6" ml={1}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>
      </CardContent>
    </CardActionArea>
  </Card>
);

const InventoryReportsPage = () => {
  const reports = [
    {
      title: 'Stock Movement Report',
      description: 'Track all inventory movements by type, product, and warehouse',
      icon: <TrendingIcon color="primary" />
    },
    {
      title: 'Inventory Aging Report',
      description: 'Identify slow-moving inventory by age categories',
      icon: <WarningIcon color="warning" />
    },
    {
      title: 'Stock Turnover Report',
      description: 'Calculate turnover ratios and efficiency metrics',
      icon: <TrendingIcon color="success" />
    },
    {
      title: 'Reorder Report',
      description: 'View products below reorder level with supplier information',
      icon: <WarningIcon color="error" />
    },
    {
      title: 'Dead Stock Report',
      description: 'Identify inventory with no movement for specified period',
      icon: <InventoryIcon color="secondary" />
    },
    {
      title: 'Inventory Variance Report',
      description: 'Track all stock adjustments and discrepancies',
      icon: <ReportIcon color="info" />
    }
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>Inventory Reports</Typography>
      <Grid container spacing={3}>
        {reports.map((report, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <ReportCard {...report} onClick={() => console.log(`Open ${report.title}`)} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default InventoryReportsPage;
