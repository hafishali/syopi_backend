const validateCouponLogic = async (coupon, cart) => {
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

    const cartProducts = cart.items;  
    const applicableCategories = coupon.applicableCategories || [];
    const applicableSubcategories = coupon.applicableSubcategories || [];
    const applicableProducts = coupon.applicableProducts || [];

    let isApplicable = false;

    for (const item of cartProducts) {
        if (
            (applicableCategories.length > 0 && applicableCategories.includes(item.productId.category)) ||
            (applicableSubcategories.length > 0 && applicableSubcategories.includes(item.productId.subcategory)) ||
            (applicableProducts.length > 0 && applicableProducts.includes(item.productId._id))
        ) {
            isApplicable = true;
            break;  
        }
    }

    if (!isApplicable) {
        return { valid: false, errors: 'Coupon is not applicable to any of the products in your cart' };
    }

    return { valid: true };
};

module.exports = validateCouponLogic;
