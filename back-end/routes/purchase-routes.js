const express = require('express');
const authenticate = require('../middleware/auth');
const PurchaseController = require('../controllers/purchase-controller');
const router = express.Router();

router.get('/premium-membership', authenticate, PurchaseController.checkIfAlreadyPremium, PurchaseController.purchasePremium);

router.post('/update-transaction-status', authenticate, PurchaseController.updateTransactionStatus);

module.exports = router;