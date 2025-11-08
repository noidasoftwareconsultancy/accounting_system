const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

const updateQuantityValidation = [
  body('productId').isInt().withMessage('Valid product ID is required'),
  body('warehouseId').isInt().withMessage('Valid warehouse ID is required'),
  body('quantityChange').isInt().withMessage('Quantity change must be an integer'),
  body('movementType').notEmpty().withMessage('Movement type is required')
];

router.use(authMiddleware.protect);

router.get('/', inventoryController.getAll);
router.get('/stats', inventoryController.getStats);
router.get('/low-stock', inventoryController.getLowStockItems);
router.get('/valuation', inventoryController.getInventoryValuation);
router.get('/product/:productId', inventoryController.getByProduct);
router.get('/warehouse/:warehouseId', inventoryController.getByWarehouse);
router.get('/product/:productId/warehouse/:warehouseId', inventoryController.getByProductAndWarehouse);
router.post('/update-quantity', updateQuantityValidation, inventoryController.updateQuantity);
router.post('/reserve', inventoryController.reserveInventory);
router.post('/release', inventoryController.releaseReservedInventory);

module.exports = router;
