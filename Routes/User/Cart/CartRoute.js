const express = require('express');
const router = express.Router();
const cartController = require('../../../Controllers/User/Cart/cartController')
const verifyToken = require('../../../Middlewares/jwtConfig')



// create or add new product to cart
router.post('/add',verifyToken(['customer']),cartController.createOrUpdateCart)

// view cart
router.get('/view/:id',verifyToken(['user']),cartController.getCart)



module.exports=router