const express = require('express');
const router = express.Router();
const offerController = require('../../../Controllers/Vendor/Offer/OfferController');
const verifyToken = require('../../../Middlewares/jwtConfig');

//create offer
router.post('/create',verifyToken(['vendor']),offerController.createOffer);

// get all offer
router.get('/get',verifyToken(['vendor']),offerController.getOffers);

// get offer by id
router.get('/get/:id',verifyToken(['vendor']),offerController.getOfferById);

// update offer
router.patch('/update/:id',verifyToken(['vendor']),offerController.updateOffer);

//delete offer
router.delete('/delete/:id',verifyToken(['vendor']),offerController.deleteOffer);

module.exports = router;