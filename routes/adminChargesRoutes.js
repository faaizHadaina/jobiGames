const express = require('express');
const adminChargesCtrl = require('../controllers/admin_chargesCtrl');

const router = express.Router();

router.get('/fetchAllAdminChg', adminChargesCtrl.fetchAllAdminCharges);
router.get('/fetchAdminChgDetail/:id', adminChargesCtrl.fetchAdminChargesDetails);
router.get('/fetchUserAdminChgRecords/:user_id',  adminChargesCtrl.fetchUserAdminCharges);
router.delete('/deleteAdminChgRecord/:id', adminChargesCtrl.deleteAdminCharge);

module.exports = router;
