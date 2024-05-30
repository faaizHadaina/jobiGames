const express = require('express');
const authCtrl = require('../controllers/authCtrl');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', authCtrl.login);
router.post('/register',authCtrl.register);
router.post('/fundWallet', auth, authCtrl.fundWallet);
router.get('/verify', authCtrl.verify);
router.post('/forgotPassword/:id', authCtrl.forgotPassword);
router.put('/changePassword', auth, authCtrl.changePassword);
router.post('/resetPassword', authCtrl.resetPassword);
router.post('/refreshToken', auth, authCtrl.refreshToken);

module.exports = router;
