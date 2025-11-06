const express = require('express');
const router = express.Router();
const ledgerEntryController = require('../controllers/ledger-entry.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication to all routes
router.use(authMiddleware.protect);

// Routes
router.get('/', ledgerEntryController.getAll);
router.get('/trial-balance', ledgerEntryController.getTrialBalance);
router.get('/account/:accountId/balance', ledgerEntryController.getAccountBalance);
router.get('/account/:accountId/entries', ledgerEntryController.getByAccount);
router.get('/account/:accountId/statement', ledgerEntryController.getAccountStatement);
router.get('/:id', ledgerEntryController.getById);

module.exports = router;