const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchase-order.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

const purchaseOrderValidation = [
  body('vendor_id').isInt().withMessage('Valid vendor ID is required'),
  body('order_date').isISO8601().withMessage('Valid order date is required'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be positive'),
  body('total_amount').isFloat({ min: 0 }).withMessage('Total amount must be positive')
];

router.use(authMiddleware.protect);

router.get('/', purchaseOrderController.getAll);
router.get('/stats', purchaseOrderController.getStats);
router.get('/generate-po-number', purchaseOrderController.generatePONumber);
router.get('/:id', purchaseOrderController.getById);
router.get('/vendor/:vendorId', purchaseOrderController.getByVendor);
router.post('/', purchaseOrderValidation, purchaseOrderController.create);
router.put('/:id', purchaseOrderController.update);
router.delete('/:id', authMiddleware.restrictTo('admin', 'manager'), purchaseOrderController.delete);
router.post('/:id/receive', purchaseOrderController.receive);

module.exports = router;
