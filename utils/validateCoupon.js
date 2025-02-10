const Product = require('../Models/Admin/productModel');

const validateCouponLogic = async (coupon, checkout) => {
    const now = new Date();

    if (coupon.status !== 'active') return { valid: false, errors: ['Coupon is inactive or invalid'] };
    if (now < coupon.startDate) return { valid: false, errors: ['Coupon is not yet valid'] };
    if (now > coupon.endDate) return { valid: false, errors: ['Coupon has expired'] };

    const { applicableCategories = [], applicableSubcategories = [], applicableProducts = [] } = coupon;

    if (!applicableCategories.length && !applicableSubcategories.length && !applicableProducts.length) {
        return { valid: false, errors: ['Coupon has no applicable products or categories'] };
    }

    let isApplicable = false;

    for (const item of checkout.items) {
        const product = await Product.findById(item.productId).select('category subcategory owner');
        if (!product) return { valid: false, errors: [`Product with ID ${item.productId} does not exist`] };

        if (coupon.createdBy.toString() !== product.owner.toString()) continue;

        const matchesCategory = applicableCategories.some(cat => cat._id.toString() === product.category?.toString());
        const matchesSubcategory = applicableSubcategories.some(sub => sub._id.toString() === product.subcategory?.toString());
        const matchesProduct = applicableProducts.some(pro => pro._id.toString() === product._id.toString());

        if (matchesCategory || matchesSubcategory || matchesProduct) {
            isApplicable = true;
            break;
        }
    }

    return isApplicable ? { valid: true } : { valid: false, errors: ['Coupon does not apply to any products in your checkout'] };
};

module.exports = validateCouponLogic;
