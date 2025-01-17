const express = require('express');
const router = express.Router();
const productController = require('../../../Controllers/User/Products/ProductController')
const verifyToken = require('../../../Middlewares/jwtConfig')
const multerConfig=require('../../../Middlewares/MulterConfig')



// get category
router.get('/view',productController.getallProducts)
// view by id
router.get('/view/:id',productController.getProductById)



module.exports=router