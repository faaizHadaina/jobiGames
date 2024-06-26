const express = require('express');
const webhookCtrl = require('../controllers/webhookCtrl');

const router = express.Router();

router.post('/webhook', webhookCtrl.handleWebhook);

module.exports = router;