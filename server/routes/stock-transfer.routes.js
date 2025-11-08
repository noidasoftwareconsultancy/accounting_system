const express = require('express');
const router = express.Router();
const stockTransferController = require('../controllers/stock-transfer.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

const stockTransferValidation = [
  body('from_warehouse_id').isInt().withMessage('Valid source warehouse ID is required'),
  body('to_warehouse_id').isInt().withMessage('Valid destination warehouse ID is required'),
  body('transfer_date').isISO8601().withMessage('Valid transfer date is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required')
];

router.use(authMiddleware.protect);

router.get('/', stockTransferController.getAll);
router.get('/generate-transfer-number', stockTransferController.generateTransferNumber);
router.get('/:id', stockTransferController.getById);
router.post('/', stockTransferValidation, stockTransferController.create);
router.put('/:id', stockTransferController.update);
router.delete('/:id', authMiddleware.restrictTo('admin', 'manager'), stockTransferController.delete);
router.post('/:id/process', stockTransferController.process);
router.post('/:id/complete', stockTransferController.complete);
router.post('/:id/cancel', stockTransferController.cancel);

module.exports = router;
