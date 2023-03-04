const express = require('express');
const UserController = require('../controllers/user-controller')
const UserRouter = express.Router();

UserRouter.post('/signup', UserController.signUpUser);

UserRouter.post('/loginUser', UserController.loginUser);

module.exports = UserRouter;