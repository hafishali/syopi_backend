const Product = require('../Models/Admin/productModel'); // Import Product model

const validateCouponLogic = async (coupon, checkout) => {
    const now = new Date();

    // Step 1: Validate Coupon Status
    if (coupon.status !== 'active') {
        return { valid: false, errors: 'Coupon is inactive or invalid' };
    }

    // Step 2: Check Coupon Validity Dates
    if (now < coupon.startDate) {
        return { valid: false, errors: 'Coupon is not yet valid' };
    }
    if (now > coupon.endDate) {
        return { valid: false, errors: 'Coupon has expired' };
    }

    // Step 3: Fetch Applicable Rules
    const { applicableCategories = [], applicableSubcategories = [], applicableProducts = [] } = coupon;

    // Ensure at least one applicability rule exists
    if (
        applicableCategories.length === 0 &&
        applicableSubcategories.length === 0 &&
        applicableProducts.length === 0
    ) {
        return { valid: false, errors: 'Coupon has no applicable products or categories' };
    }

    // Step 4: Validate Each Product in Checkout
    let isApplicable = false;
    console.log(applicableProducts)
    for (const item of checkout.items) {
        const product = await Product.findById(item.productId).select('category subcategory owner');
        if (!product) {
            return { valid: false, errors: `Product with ID ${item.productId} does not exist` };
        }
        if (coupon.createdBy.toString() !== product.owner.toString()) {
            // console.log(coupon.createdBy)
            // console.log(product.owner)
            continue; 
        }
        const matchesCategory =
            applicableCategories.length > 0 &&
            product.category &&
            applicableCategories.map(cat => cat._id.toString()).includes(product.category.toString());

        // console.log({
        //     couponcat:applicableCategories,
        //     procat:product.category,
        //     match:matchesCategory
        // })


        const matchesSubcategory =
            applicableSubcategories.length > 0 &&
            product.subcategory &&
            applicableSubcategories.map(sub => sub._id.toString()).includes(product.subcategory.toString());
        // console.log({
        //     couponsub:applicableSubcategories,
        //     prosub:product.subcategory,
        //     match:matchesSubcategory
        // })
        const matchesProduct =
            applicableProducts.length > 0 &&
            applicableProducts.map(pro => pro._id.toString()).includes(product._id.toString());
        if (matchesCategory || matchesSubcategory || matchesProduct) {
            isApplicable = true;
            break;
        }
    }

    if (!isApplicable) {
        return { valid: false, errors: 'Coupon does not apply to any products in your checkout' };
    }

    // Step 5: If All Validations Pass
    return { valid: true };
};

module.exports = validateCouponLogic;
