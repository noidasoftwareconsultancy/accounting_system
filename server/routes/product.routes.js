const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

const productValidation = [
  body('sku').notEmpty().withMessage('SKU is required'),
  body('name').notEmpty().withMessage('Product name is required'),
  body('unit_of_measure').notEmpty().withMessage('Unit of measure is required'),
  body('unit_price').isFloat({ min: 0 }).withMessage('Unit price must be positive')
];

const categoryValidation = [
  body('name').notEmpty().withMessage('Category name is required')
];

router.use(authMiddleware.protect);

// Product routes
router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.get('/sku/:sku', productController.getBySKU);
router.post('/', productValidation, productController.create);
router.put('/:id', productValidation, productController.update);
router.delete('/:id', authMiddleware.restrictTo('admin', 'manager'), productController.delete);

// Category routes
router.get('/categories/all', productController.getCategories);
router.post('/categories', categoryValidation, productController.createCategory);
router.put('/categories/:id', productController.updateCategory);
router.delete('/categories/:id', authMiddleware.restrictTo('admin', 'manager'), productController.deleteCategory);

// Supplier routes
router.get('/:id/suppliers', productController.getSuppliers);
router.post('/suppliers', productController.addSupplier);
router.put('/:productId/suppliers/:vendorId', productController.updateSupplier);
router.delete('/:productId/suppliers/:vendorId', productController.removeSupplier);

// Serial number routes
router.get('/:id/serial-numbers', productController.getSerialNumbers);
router.post('/serial-numbers', productController.addSerialNumber);
router.put('/serial-numbers/:serialId', productController.updateSerialNumber);

// Batch number routes
router.get('/:id/batch-numbers', productController.getBatchNumbers);
router.post('/batch-numbers', productController.addBatchNumber);
router.put('/:productId/batch-numbers/:batchNo', productController.updateBatchNumber);

module.exports = router;
