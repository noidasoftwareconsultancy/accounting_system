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
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Edit, Delete, ArrowBack, CreditScore, Download } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import creditNoteService from '../../services/creditNoteService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CreditNoteDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNotification } = useApp();
  
  const [creditNote, setCreditNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreditNote();
  }, [id]);

  const fetchCreditNote = async () => {
    try {
      const response = await creditNoteService.getById(id);
      setCreditNote(response.data);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load credit note'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this credit note?')) {
      try {
        await creditNoteService.delete(id);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Credit note deleted successfully'
        });
        navigate('/credit-notes');
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete credit note'
        });
      }
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await creditNoteService.getCreditNotePDF(id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'PDF downloaded successfully'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to download PDF'
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      issued: 'success',
      applied: 'info',
      void: 'error'
    };
    return colors[status] || 'default';
  };

  if (loading) return <LoadingSpinner />;
  if (!creditNote) return <Typography>Credit note not found</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/credit-notes')}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Credit Note Details
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/credit-notes/${id}/edit`)}
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
              <CreditScore sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Credit Note #{creditNote.credit_note_number}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  For Invoice: {creditNote.invoice?.invoice_number || 'N/A'}
                </Typography>
              </Box>
              <Chip
                label={creditNote.status}
                color={getStatusColor(creditNote.status)}
                sx={{ ml: 'auto' }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Reason
            </Typography>
            <Typography variant="body1" paragraph>
              {creditNote.reason || 'No reason provided'}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Items
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {creditNote.items?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">${item.unit_price?.toLocaleString()}</TableCell>
                      <TableCell align="right">${item.amount?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} align="right" sx={{ fontWeight: 600 }}>
                      Total:
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      ${creditNote.total_amount?.toLocaleString() || '0'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Credit Note Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">Client</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                  {creditNote.client?.name || 'N/A'}
                </Typography>

                <Typography variant="body2" color="textSecondary">Invoice</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                  {creditNote.invoice?.invoice_number || 'N/A'}
                </Typography>

                <Typography variant="body2" color="textSecondary">Credit Note Date</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                  {creditNote.credit_note_date ? format(new Date(creditNote.credit_note_date), 'MMM dd, yyyy') : 'N/A'}
                </Typography>

                <Typography variant="body2" color="textSecondary">Total Amount</Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 2 }}>
                  ${creditNote.total_amount?.toLocaleString() || '0'}
                </Typography>

                <Typography variant="body2" color="textSecondary">Status</Typography>
                <Chip
                  label={creditNote.status}
                  color={getStatusColor(creditNote.status)}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreditNoteDetail;
