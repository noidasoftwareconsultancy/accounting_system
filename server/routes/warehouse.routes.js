const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouse.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

const warehouseValidation = [
  body('name').notEmpty().withMessage('Warehouse name is required'),
  body('code').notEmpty().withMessage('Warehouse code is required')
];

router.use(authMiddleware.protect);

router.get('/', warehouseController.getAll);
router.get('/:id', warehouseController.getById);
router.get('/:id/inventory-summary', warehouseController.getInventorySummary);
router.post('/', warehouseValidation, warehouseController.create);
router.put('/:id', warehouseController.update);
router.delete('/:id', authMiddleware.restrictTo('admin', 'manager'), warehouseController.delete);

module.exports = router;
