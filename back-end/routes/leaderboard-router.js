const express = require('express');
const LeaderBoardController = require('../controllers/leaderboard-controller');
const authenticate = require('../middleware/auth');

const LeaderBoardRouter = express.Router();

LeaderBoardRouter.get('/getLeaderboard', authenticate, LeaderBoardController.getLeaderBoard);

module.exports = LeaderBoardRouter;