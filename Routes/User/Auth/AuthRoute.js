const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../../../Controllers/User/Auth/Auth');
const { registerUserValidator, loginUserValidator } = require('../../../validators/userValidator');
const validationHandler = require('../../../Middlewares/validationHandler');

// Register User
router.post('/register', registerUserValidator, validationHandler, userController.registerUser);

// Login User
router.post('/login', loginUserValidator, validationHandler, userController.loginUser);

// google login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// google callback
router.get('/google/callback', userController.googleLoginCallback);

module.exports = router;
