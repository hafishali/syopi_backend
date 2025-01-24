const express = require('express');
const router = express.Router();
const productController = require('../../../Controllers/User/Products/ProductController')
const verifyToken = require('../../../Middlewares/jwtConfig')
const multerConfig=require('../../../Middlewares/MulterConfig')



// get category
router.get('/view',productController.getallProducts)
// view by id
router.get('/view/:id',productController.getProductById)

// sort product based on price
router.get('/sort',verifyToken(['customer']),productController.getSortedProducts);

//filter by brand
router.get('/filter-brand',verifyToken(['customer']),productController.filterBrand);

//filter by size
router.get('/filter-size',verifyToken(['customer']),productController.filterBySize);

//filter by type
router.get('/filter-type',verifyToken(['customer']),productController.filterByType);

//filter newarrivals
router.get('/filter-newarrivals',verifyToken(['customer']),productController.filterByNewarrivals);

module.exports=router