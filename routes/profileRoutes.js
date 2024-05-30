const router = require('express').Router();
const auth  = require("../middleware/auth.middleware");
const profileCtrl = require('../controllers/profileCtrl');

router.get("/profile/:id", auth,  profileCtrl.getOne);
router.put("/profile/:id", auth, profileCtrl.updateOne);

module.exports = router