const express = require('express');
const UserController = require('../controllers/user-controller')
const router = express.Router();

router.post('/signup', UserController.signUpController);

router.post('/loginUser', UserController.loginUser);

module.exports = router;