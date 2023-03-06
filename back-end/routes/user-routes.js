const express = require('express');
const UserController = require('../controllers/user-controller');
const authenticate = require('../middleware/auth');
const UserRouter = express.Router();

UserRouter.post('/signup', UserController.signUpUser);

UserRouter.post('/loginUser', UserController.loginUser);

UserRouter.get('/check-premium', authenticate, UserController.checkPremium);

module.exports = UserRouter;