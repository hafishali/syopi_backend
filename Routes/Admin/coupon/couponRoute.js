const express = require('express');
const router = express.Router();
const couponController = require('../../../Controllers/Admin/Coupon/couponController');

// Create a coupon
router.post('/create', couponController.createCoupon);

// Get all coupons
router.get('/get', couponController.getCoupons);

// Get a coupon by ID
router.get('/:id', couponController.getCouponById);

// Update a coupon
router.patch('/update/:id', couponController.updateCoupon);

// Delete a coupon
router.delete('/delete/:id', couponController.deleteCoupon);

// toggle isActive
router.patch('/toggle/:id', couponController.toggleCouponStatus)

// validate
router.post('/validate', couponController.validateCoupon);

module.exports = router;
