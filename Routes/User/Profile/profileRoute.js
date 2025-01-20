const express = require('express');
const router = express.Router();
const profileController = require('../../../Controllers/User/Profile/profileController');
const verifyToken = require('../../../Middlewares/jwtConfig');

// get user profile
router.get('/view',verifyToken(['customer']),profileController.getUserProfile);

// update user 
router.patch('/update',verifyToken(['customer']),profileController.updateUserData);


module.exports = router;