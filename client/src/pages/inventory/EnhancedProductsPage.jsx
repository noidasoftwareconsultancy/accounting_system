import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  Checkbox,
  Chip
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  QrCodeScanner,
  FileDownload,
  FileUpload
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import bulkOperationsService from '../../services/bulkOperationsService';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import AdvancedFilters from '../../components/inventory/AdvancedFilters';
import BulkActionsBar from '../../components/inventory/BulkActionsBar';
import ExportDialog from '../../components/inventory/ExportDialog';
import ImportDialog from '../../components/inventory/ImportDialog';
import BarcodeScanner from '../../components/inventory/BarcodeScanner';
import useAdvancedFilters from '../../hooks/useAdvancedFilters';
import useBulkSelection from '../../hooks/useBulkSelection';

const EnhancedProductsPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const { filters, updateFilter, clearFilters, buildQueryParams } = useAdvancedFilters({
    search: '',
    category: '',
    stockLevel: '',
    minPrice: '',
    maxPrice: ''
  });

  const {
    selectedIds,
    selectedCount,
    toggleSelection,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isSomeSelected
  } = useBulkSelection(products);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, rowsPerPage, filters]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...buildQueryParams()
      };
      const response = await productService.getAllProducts(params);
      setProducts(response.data.data.products);
      setTotalCount(response.data.data.pagination.total);
    } catch (error) {
      console.error('Error fetching products:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch products'
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, buildQueryParams, addNotification]);

  const fetchCategories = async () => {
    try {
      const response = await productService.getAllCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedCount} products?`)) return;

    try {
      await bulkOperationsService.bulkDeleteProducts(selectedIds);
      addNotification({
        type: 'success',
        title: 'Success',
        message: `${selectedCount} products deleted`
      });
      clearSelection();
      fetchProducts();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete products'
      });
    }
  };

  const handleBulkActivate = async () => {
    try {
      await bulkOperationsService.bulkActivateProducts(selectedIds);
      addNotification({
        type: 'success',
        title: 'Success',
        message: `${selectedCount} products activated`
      });
      clearSelection();
      fetchProducts();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to activate products'
      });
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      await bulkOperationsService.bulkDeactivateProducts(selectedIds);
      addNotification({
        type: 'success',
        title: 'Success',
        message: `${selectedCount} products deactivated`
      });
      clearSelection();
      fetchProducts();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to deactivate products'
      });
    }
  };

  const handleExport = async (format, columns) => {
    try {
      const params = { format, columns, ...buildQueryParams() };
      const response = await bulkOperationsService.exportProducts(params);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Products exported successfully'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to export products'
      });
    }
  };

  const handleImport = async (file, onProgress) => {
    try {
      const response = await bulkOperationsService.importProducts(file);
      onProgress(100);
      
      return {
        success: true,
        count: response.data.data.imported,
        errors: response.data.data.errors || []
      };
    } catch (error) {
      throw new Error(error.response?.data?.error?.message || 'Import failed');
    }
  };

  const handleBarcodeScan = async (barcode) => {
    try {
      const response = await productService.getProductBySKU(barcode);
      const product = response.data.data;
      navigate(`/inventory/products/${product.id}`);
      setScannerOpen(false);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Not Found',
        message: `No product found with barcode: ${barcode}`
      });
    }
  };

  const exportColumns = [
    { label: 'Name', value: 'name' },
    { label: 'SKU', value: 'sku' },
    { label: 'Category', value: 'category' },
    { label: 'Unit Price', value: 'unit_price' },
    { label: 'Cost Price', value: 'cost_price' },
    { label: 'Reorder Level', value: 'reorder_level' },
    { label: 'Status', value: 'is_active' }
  ];

  if (loading && products.length === 0) {
    return <LoadingSpinner message="Loading products..." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Products</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<QrCodeScanner />}
            onClick={() => setScannerOpen(true)}
          >
            Scan
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileUpload />}
            onClick={() => setImportDialogOpen(true)}
          >
            Import
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={() => setExportDialogOpen(true)}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/inventory/products/new')}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      <AdvancedFilters
        filters={filters}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
        categories={categories}
        showPriceRange
        showStockLevel
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isSomeSelected}
                  onChange={toggleAll}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Unit Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isSelected(product.id)}
                    onChange={() => toggleSelection(product.id)}
                  />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.category?.name || '-'}</TableCell>
                <TableCell>${product.unit_price}</TableCell>
                <TableCell>
                  <Chip
                    label={product.total_stock || 0}
                    size="small"
                    color={product.total_stock > product.reorder_level ? 'success' : 'warning'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={product.is_active ? 'Active' : 'Inactive'}
                    size="small"
                    color={product.is_active ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={(e) => {
                    setAnchorEl(e.currentTarget);
                    setSelectedProduct(product);
                  }}>
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      <BulkActionsBar
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onBulkDelete={handleBulkDelete}
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          navigate(`/inventory/products/${selectedProduct?.id}`);
          setAnchorEl(null);
        }}>
          <Visibility sx={{ mr: 1 }} />
          View
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/inventory/products/${selectedProduct?.id}/edit`);
          setAnchorEl(null);
        }}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          setDeleteDialogOpen(true);
          setAnchorEl(null);
        }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleExport}
        columns={exportColumns}
      />

      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImport}
        templateUrl="/templates/products-template.csv"
      />

      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleBarcodeScan}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={async () => {
          try {
            await productService.deleteProduct(selectedProduct.id);
            addNotification({
              type: 'success',
              title: 'Success',
              message: 'Product deleted successfully'
            });
            fetchProducts();
          } catch (error) {
            addNotification({
              type: 'error',
              title: 'Error',
              message: 'Failed to delete product'
            });
          }
          setDeleteDialogOpen(false);
        }}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"?`}
        severity="error"
      />
    </Box>
  );
};

export default EnhancedProductsPage;
