const express = require('express');
const UserController = require('../controllers/user-controller');
const PasswordController = require('../controllers/password-controller');
const authenticate = require('../middleware/auth');
const UserRouter = express.Router();

UserRouter.post('/signup', UserController.signUpUser);

UserRouter.post('/loginUser', UserController.loginUser);

UserRouter.get('/password/resetpassword/:uuid', PasswordController.resetPassword);

UserRouter.post('/password/forgot-password', PasswordController.sendMail);

UserRouter.post('/password/update-password/:uuid', PasswordController.updatePassword);

UserRouter.get('/check-premium', authenticate, UserController.checkPremium);

module.exports = UserRouter;