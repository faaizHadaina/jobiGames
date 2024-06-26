const express = require('express')
const walletCtrl = require('../controllers/walletCtrl')
const auth = require('../middleware/auth.middleware')

const router = express.Router()

router.get('/wallet', auth, walletCtrl.getWallet);

module.exports = router