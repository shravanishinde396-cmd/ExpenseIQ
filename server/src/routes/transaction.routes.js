const express = require('express');
const transactionController = require('../controllers/transaction.controller');
const { verifyJWT } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(verifyJWT);

router.get('/', transactionController.getTransactions);
router.post('/bulk-delete', transactionController.bulkDeleteTransactions);

module.exports = router;
