const express = require('express');
const router = express.Router();
const productController = require('../../../Controllers/User/Products/ProductController')
const attachWishlistIfAuthenticated = require('../../../Middlewares/WishlistIfAuthenticat');
const verifyToken = require('../../../Middlewares/jwtConfig')
const multerConfig=require('../../../Middlewares/MulterConfig')



// get category
router.get('/view',attachWishlistIfAuthenticated,productController.getallProducts)
// view by id
router.get('/view/:id',attachWishlistIfAuthenticated,productController.getProductById)

// search products 
router.get('/search',attachWishlistIfAuthenticated,productController.searchProducts);

// sorting based on price
router.get('/sort',attachWishlistIfAuthenticated,productController.getSortedProducts);

module.exports=router