import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { Edit, Delete, ArrowBack, Description } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import contractService from '../../services/contractService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ContractDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNotification } = useApp();
  
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContract();
  }, [id]);

  const fetchContract = async () => {
    try {
      const response = await contractService.getById(id);
      setContract(response.data);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load contract'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      try {
        await contractService.delete(id);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Contract deleted successfully'
        });
        navigate('/contracts');
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete contract'
        });
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      active: 'success',
      expired: 'error',
      terminated: 'warning',
      pending: 'info'
    };
    return colors[status] || 'default';
  };

  if (loading) return <LoadingSpinner />;
  if (!contract) return <Typography>Contract not found</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/contracts')}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Contract Details
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/contracts/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Description sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {contract.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {contract.contract_number}
                </Typography>
              </Box>
              <Chip
                label={contract.status}
                color={getStatusColor(contract.status)}
                sx={{ ml: 'auto' }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {contract.description || 'No description provided'}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Payment Terms
            </Typography>
            <Typography variant="body1">
              {contract.payment_terms || 'No payment terms specified'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Contract Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">Client</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                  {contract.client?.name || 'N/A'}
                </Typography>

                <Typography variant="body2" color="textSecondary">Project</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                  {contract.project?.name || 'N/A'}
                </Typography>

                <Typography variant="body2" color="textSecondary">Contract Type</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                  {contract.contract_type}
                </Typography>

                <Typography variant="body2" color="textSecondary">Contract Value</Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 2 }}>
                  ${contract.contract_value?.toLocaleString() || '0'}
                </Typography>

                <Typography variant="body2" color="textSecondary">Start Date</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                  {contract.start_date ? format(new Date(contract.start_date), 'MMM dd, yyyy') : 'N/A'}
                </Typography>

                <Typography variant="body2" color="textSecondary">End Date</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {contract.end_date ? format(new Date(contract.end_date), 'MMM dd, yyyy') : 'N/A'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContractDetail;
