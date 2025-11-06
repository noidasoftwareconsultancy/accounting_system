const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Contract validation rules
const contractValidation = [
  body('client_id').isInt().withMessage('Valid client ID is required'),
  body('title').notEmpty().withMessage('Contract title is required'),
  body('start_date').isISO8601().withMessage('Valid start date is required'),
  body('end_date').optional().isISO8601().withMessage('Valid end date is required'),
  body('value').optional().isFloat({ min: 0 }).withMessage('Contract value must be positive'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('status').optional().isIn(['draft', 'active', 'completed', 'terminated', 'expired']).withMessage('Invalid status')
];

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Contract routes
router.get('/', contractController.getAll);
router.get('/stats', contractController.getStats);
router.get('/expiring', contractController.getExpiringContracts);
router.get('/client/:clientId', contractController.getByClient);
router.get('/project/:projectId', contractController.getByProject);
router.get('/:id', contractController.getById);
router.post('/', contractValidation, contractController.create);
router.put('/:id', contractValidation, contractController.update);
router.patch('/:id/status', contractController.updateStatus);
router.delete('/:id', authMiddleware.restrictTo('admin', 'manager'), contractController.delete);

// Document management
router.post('/:id/document', contractController.uploadDocument);
router.get('/:id/document', contractController.getDocument);
router.delete('/:id/document', contractController.deleteDocument);

module.exports = router;