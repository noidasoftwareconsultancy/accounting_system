const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Category validation rules
const categoryValidation = [
  body('name').notEmpty().withMessage('Category name is required'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('is_tax_deductible').optional().isBoolean().withMessage('Tax deductible must be boolean')
];

// Apply authentication middleware to all category routes
router.use(authMiddleware.protect);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Category routes are working', user: req.user });
});

// Category routes
router.get('/', categoryController.getAll);
router.get('/stats', categoryController.getStats);
router.get('/trends', categoryController.getCategoriesWithTrends);
router.get('/search', categoryController.search);
router.get('/:id', categoryController.getById);
router.get('/:id/expenses', categoryController.getExpenseSummary);
router.post('/', categoryValidation, categoryController.create);
router.put('/:id', categoryValidation, categoryController.update);
router.delete('/:id', authMiddleware.restrictTo('admin', 'manager'), categoryController.delete);

module.exports = router;