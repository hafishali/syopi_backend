const express = require('express');
const router = express.Router();
const dressController = require('../../../Controllers/Admin/Product/Dress/dressController');
const verifyToken = require('../../../Middlewares/jwtConfig');
const multerConfig = require('../../../Middlewares/MulterConfig');

const upload = multerConfig.array('images', 5);

// Create new dress
router.post('/create', verifyToken(['admin']), upload, dressController.createDress);

// Get all dresses
router.get('/get', verifyToken(['admin']), dressController.getDresses);

// Get dress by ID
router.get('/get/:id', verifyToken(['admin']), dressController.getDressById);

// Update dress
router.patch('/update/:id', verifyToken(['admin']), upload, dressController.updateDress);

// Delete dress
router.delete('/delete/:id', verifyToken(['admin']), dressController.deleteDress);

module.exports = router;
