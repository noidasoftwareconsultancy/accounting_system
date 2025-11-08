import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Inventory,
  LocalShipping,
  QrCode,
  LocalOffer,
  Add,
  Delete
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import productService from '../../services/productService';
import inventoryService from '../../services/inventoryService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [serialNumbers, setSerialNumbers] = useState([]);
  const [batchNumbers, setBatchNumbers] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [serialDialogOpen, setSerialDialogOpen] = useState(false);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  useEffect(() => {
    if (tabValue === 0) fetchInventory();
    if (tabValue === 1) fetchSuppliers();
    if (tabValue === 2 && product?.is_serialized) fetchSerialNumbers();
    if (tabValue === 3 && product?.is_batch_tracked) fetchBatchNumbers();
  }, [tabValue, product]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductById(id);
      setProduct(response.data.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch product details'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await inventoryService.getInventoryByProduct(id);
      setInventory(response.data.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await productService.getProductSuppliers(id);
      setSuppliers(response.data.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchSerialNumbers = async () => {
    try {
      const response = await productService.getSerialNumbers(id);
      setSerialNumbers(response.data.data);
    } catch (error) {
      console.error('Error fetching serial numbers:', error);
    }
  };

  const fetchBatchNumbers = async () => {
    try {
      const response = await productService.getBatchNumbers(id);
      setBatchNumbers(response.data.data);
    } catch (error) {
      console.error('Error fetching batch numbers:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading product details..." />;
  }

  if (!product) {
    return (
      <Box p={3}>
        <Typography>Product not found</Typography>
      </Box>
    );
  }

  const totalStock = inventory.reduce((sum, item) => sum + item.quantity_available, 0);
  const totalValue = totalStock * parseFloat(product.unit_price);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/inventory/products')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4">{product.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              SKU: {product.sku}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => navigate(`/inventory/products/${id}/edit`)}
        >
          Edit Product
        </Button>
      </Box>

      {/* Product Info Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2" gutterBottom>
                Unit Price
              </Typography>
              <Typography variant="h4">
                ${parseFloat(product.unit_price).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Cost: ${parseFloat(product.cost_price).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2" gutterBottom>
                Total Stock
              </Typography>
              <Typography variant="h4">
                {totalStock}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {product.unit_of_measure}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2" gutterBottom>
                Stock Value
              </Typography>
              <Typography variant="h4">
                ${totalValue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2" gutterBottom>
                Reorder Level
              </Typography>
              <Typography variant="h4">
                {product.reorder_level}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Qty: {product.reorder_quantity}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Product Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Product Details
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">Description</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {product.description || 'No description'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">Category</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {product.category?.name || 'Uncategorized'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">Barcode</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {product.barcode || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">Tax Rate</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {product.tax_rate}%
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={product.is_active ? 'Active' : 'Inactive'}
                color={product.is_active ? 'success' : 'default'}
              />
              {product.is_serialized && (
                <Chip label="Serialized" color="info" icon={<QrCode />} />
              )}
              {product.is_batch_tracked && (
                <Chip label="Batch Tracked" color="warning" icon={<LocalOffer />} />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Inventory" icon={<Inventory />} iconPosition="start" />
          <Tab label="Suppliers" icon={<LocalShipping />} iconPosition="start" />
          {product.is_serialized && (
            <Tab label="Serial Numbers" icon={<QrCode />} iconPosition="start" />
          )}
          {product.is_batch_tracked && (
            <Tab label="Batch Numbers" icon={<LocalOffer />} iconPosition="start" />
          )}
        </Tabs>

        {/* Inventory Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Warehouse</TableCell>
                  <TableCell>On Hand</TableCell>
                  <TableCell>Reserved</TableCell>
                  <TableCell>Available</TableCell>
                  <TableCell>Last Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.warehouse?.name || 'N/A'}</TableCell>
                    <TableCell>{item.quantity_on_hand}</TableCell>
                    <TableCell>{item.quantity_reserved}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.quantity_available}
                        color={item.quantity_available <= product.reorder_level ? 'warning' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {item.last_stock_date
                        ? new Date(item.last_stock_date).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
                {inventory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No inventory records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Suppliers Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setSupplierDialogOpen(true)}
            >
              Add Supplier
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Supplier SKU</TableCell>
                  <TableCell>Unit Price</TableCell>
                  <TableCell>Min Order Qty</TableCell>
                  <TableCell>Lead Time</TableCell>
                  <TableCell>Preferred</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>{supplier.vendor?.name || 'N/A'}</TableCell>
                    <TableCell>{supplier.supplier_sku || 'N/A'}</TableCell>
                    <TableCell>${parseFloat(supplier.unit_price).toFixed(2)}</TableCell>
                    <TableCell>{supplier.minimum_order_qty}</TableCell>
                    <TableCell>{supplier.lead_time_days} days</TableCell>
                    <TableCell>
                      {supplier.is_preferred && (
                        <Chip label="Preferred" color="primary" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {suppliers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No suppliers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Serial Numbers Tab */}
        {product.is_serialized && (
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setSerialDialogOpen(true)}
              >
                Add Serial Number
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Serial Number</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Purchase Date</TableCell>
                    <TableCell>Sale Date</TableCell>
                    <TableCell>Warranty Expiry</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {serialNumbers.map((serial) => (
                    <TableRow key={serial.id}>
                      <TableCell>{serial.serial_no}</TableCell>
                      <TableCell>
                        <Chip
                          label={serial.status}
                          color={
                            serial.status === 'available' ? 'success' :
                            serial.status === 'sold' ? 'default' :
                            'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {serial.purchase_date
                          ? new Date(serial.purchase_date).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {serial.sale_date
                          ? new Date(serial.sale_date).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {serial.warranty_expiry
                          ? new Date(serial.warranty_expiry).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {serialNumbers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No serial numbers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        )}

        {/* Batch Numbers Tab */}
        {product.is_batch_tracked && (
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setBatchDialogOpen(true)}
              >
                Add Batch
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Batch Number</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Manufacturing Date</TableCell>
                    <TableCell>Expiry Date</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {batchNumbers.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell>{batch.batch_no}</TableCell>
                      <TableCell>{batch.quantity}</TableCell>
                      <TableCell>
                        {batch.manufacturing_date
                          ? new Date(batch.manufacturing_date).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {batch.expiry_date
                          ? new Date(batch.expiry_date).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{batch.notes || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                  {batchNumbers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No batch numbers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        )}
      </Paper>
    </Box>
  );
};

export default ProductDetailPage;
