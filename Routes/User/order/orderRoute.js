const express = require('express');
const router = express.Router();
const orderController = require('../../../Controllers/User/Order/OrderController')
const verifyToken = require('../../../Middlewares/jwtConfig')
const multerConfig=require('../../../Middlewares/MulterConfig')



// create order
router.post('/create',verifyToken(['customer']),orderController.placeOrder)


module.exports=router