const express = require('express');
const router = express.Router();
const inventoryReportsController = require('../controllers/inventory-reports.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware.protect);

router.get('/stock-movement', inventoryReportsController.getStockMovementReport);
router.get('/inventory-aging', inventoryReportsController.getInventoryAgingReport);
router.get('/stock-turnover', inventoryReportsController.getStockTurnoverReport);
router.get('/reorder', inventoryReportsController.getReorderReport);
router.get('/dead-stock', inventoryReportsController.getDeadStockReport);
router.get('/inventory-variance', inventoryReportsController.getInventoryVarianceReport);

module.exports = router;
