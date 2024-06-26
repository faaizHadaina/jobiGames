const router = require("express").Router();

//Routes
router.use('/api', require('./authRoutes'))
router.use('/api', require('./profileRoutes'))
router.use('/api', require('./gameSessionRoutes'))
router.use('/api', require('./adminChargesRoutes'))
router.use('/api', require('./transactionRoutes'))
router.use('/api', require('./walletRoutes'))
router.use('/api', require('./webhookRoute'))

module.exports = router;