const express = require('express');
const router = express.Router();
const chappalController = require('../../../Controllers/Admin/Product/Chappal/ChappalController');
const verifyToken = require('../../../Middlewares/jwtConfig');
const multerConfig = require('../../../Middlewares/MulterConfig');

const upload = multerConfig.array('images',5)

//create new chappal
router.post('/create',verifyToken(['admin']),upload,chappalController.createChappal);

//get all products
router.get('/all',verifyToken(['admin']), chappalController.getAllProducts)

//get all chappals
router.get('/get',verifyToken(['admin']),chappalController.getChappals);

//get chappal by id
router.get('/get/:id',verifyToken(['admin']),chappalController.getChappalById);

//update chappal
router.patch('/update/:id',verifyToken(['admin']),upload,chappalController.updateChappal);

//delete chappal
router.delete('/delete/:id',verifyToken(['admin']),chappalController.deleteChappal);

// delete a image
// router.delete('/delete-chappal-image/:id',verifyToken(['admin']),chappalController.deleteChappalImage);

 
module.exports = router;  
