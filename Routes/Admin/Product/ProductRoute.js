const express = require('express');
const router = express.Router();
const productController = require('../../../Controllers/Admin/Product/ProductController');
const verifyToken = require('../../../Middlewares/jwtConfig');
const multerConfig = require('../../../Middlewares/MulterConfig');

const upload = multerConfig.array('images',5)

//create new product
router.post('/create',upload,productController.createProduct);

module.exports = router;