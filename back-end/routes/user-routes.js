const express = require('express');
const UserController = require('../controllers/user-controller')
const router = express.Router();

router.post('/signup', UserController.signUpUser);

router.post('/loginUser', UserController.loginUser);

module.exports = router;