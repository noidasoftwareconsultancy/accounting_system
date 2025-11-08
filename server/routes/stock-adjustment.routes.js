const express = require('express');
const router = express.Router();
const stockAdjustmentController = require('../controllers/stock-adjustment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

const stockAdjustmentValidation = [
  body('adjustment_date').isISO8601().withMessage('Valid adjustment date is required'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required')
];

router.use(authMiddleware.protect);

router.get('/', stockAdjustmentController.getAll);
router.get('/generate-adjustment-number', stockAdjustmentController.generateAdjustmentNumber);
router.get('/:id', stockAdjustmentController.getById);
router.post('/', stockAdjustmentValidation, stockAdjustmentController.create);
router.post('/:id/approve', stockAdjustmentController.approve);
router.post('/:id/cancel', stockAdjustmentController.cancel);

module.exports = router;
