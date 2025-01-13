// validateCouponLogic.js
const validateCouponLogic = (coupon) => {
    const now = new Date();
    
    if (coupon.status === 'inactive') {
        return { valid: false, errors: 'Coupon is inactive' };
    }
    if (now < coupon.startDate) {
        return { valid: false, errors: 'Coupon is not yet valid' };
    }
    if (now > coupon.endDate) {
        return { valid: false, errors: 'Coupon has expired' };
    }

    return { valid: true };
};

module.exports = validateCouponLogic;
