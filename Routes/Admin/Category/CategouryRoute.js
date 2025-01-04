const express = require('express');
const router = express.Router();
const categoryController = require('../../../Controllers/Admin/Category/Categoycontroller')
const verifyToken = require('../../../Middlewares/jwtConfig')
const multerConfig=require('../../../Middlewares/MulterConfig')

// create category

router.post('/create',verifyToken(['admin']),multerConfig.single('image'),categoryController.createCategory)

// admin login

router.post('/login', adminController.login)


// protected route 
// router.get('/dash', verifyToken, (req,res) => {
//     res.status(200).json({message:'welcome, Admin', user:req.user})
// })


module.exports=router