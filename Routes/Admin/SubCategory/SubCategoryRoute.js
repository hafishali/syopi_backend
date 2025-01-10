const express = require('express');
const router = express.Router();
const subCategoryController = require('../../../Controllers/Admin/SubCategory/SubCategorycontroller')
const verifyToken = require('../../../Middlewares/jwtConfig');
const multerConfig = require('../../../Middlewares/MulterConfig');

// create new subcategory
router.post('/create',verifyToken(['admin']),multerConfig.single('image'),subCategoryController.createSubCategory);

// get all subcategories
router.get('/get',subCategoryController.getSubCategories);

// get a subcategory by id
router.get('/get/:id',subCategoryController.getSubCategoryById);

// update subcategory
router.patch('/update/:id',verifyToken(['admin']),multerConfig.single('image'),subCategoryController.updateSubCategory);

// delete subcategory
router.delete('/delete/:id',verifyToken(['admin']),subCategoryController.deleteSubCategory);

// search subcategory
router.get('/search',subCategoryController.searchSubCategory);

module.exports = router; 