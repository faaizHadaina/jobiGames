const express = require('express');
const transactionsCtrl = require('../controllers/transactionCtrl');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/fetchAllTransRecords', auth, transactionsCtrl.fetchAllTransactions);
router.get('/fetchTransDetail/:id', auth, transactionsCtrl.fetchTransactionDetails);
router.get('/fetchUserTransRecords/:user_id',  transactionsCtrl.fetchUserTransactionRecords);
router.delete('/deleteTransRecord/:id', auth, transactionsCtrl.deleteTransactionRecord);

module.exports = router;
