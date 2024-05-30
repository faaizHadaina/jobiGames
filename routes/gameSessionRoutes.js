const express = require('express');
const gameSessionCtrl = require('../controllers/game_sessionCtrl');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/gameSession', auth, gameSessionCtrl.handleGameSession);
router.post('/connectToSession', auth, gameSessionCtrl.connectOpponent);
router.get('/fetchAll', auth, gameSessionCtrl.fetchAllGameSessions);
router.get('/fetchSession/:room_id/:game_id', auth, gameSessionCtrl.fetchGameSessionDetails);
router.get('/endGameSession/:session_id/:user_id', auth, gameSessionCtrl.endGameSession);
router.post('/sendReplayRequest/:session_id', auth, gameSessionCtrl.sendReplayRequest);
router.post('/acceptReplayRequest/:session_id', auth, gameSessionCtrl.acceptReplayRequest);
router.delete('/deleteGameSession/:room_id/:game_id', auth, gameSessionCtrl.deleteGameSession);

module.exports = router;
