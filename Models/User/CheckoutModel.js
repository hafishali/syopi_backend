const mongoose = require('mongoose');
const Coupon = require('../../Models/Admin/couponModel');
const Cart = require('../../Models/User/cartModel');
const validateCouponLogic = require('../../utils/validateCoupon'); // Import validateCouponLogic function

const CheckoutSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        color: { type: String },
        size: { type: String },
      },
    ],
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null }, // Coupon reference
    coinsApplied: { type: Number, default: 0 }, // Number of coins applied
    subtotal: { type: Number, required: true }, // Calculated from cart total
    couponDiscount: { type: Number, default: 0 }, // Discount applied from coupon
    coinDiscount: { type: Number, default: 0 }, // Discount value from coins
    ReducedDiscount: { type: Number, default: 0 }, // couponDiscount + coinDiscount
    finalTotal: { type: Number, required: true }, // Subtotal - Discounts (Coupon + Coins)
    isProcessed:{
      type: Boolean, default: false
    },
    expiresAt: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from creation
      },
      index: { expires: 0 }, // TTL index to delete automatically
    },
  },
  { timestamps: true },
);

CheckoutSchema.pre('save', async function (next) {
  try {
      let couponDiscount = 0;
      let discountPerProduct = 0;

      const cart = await Cart.findById(this.cartId).populate('items.productId');
      if (!cart) return next(new Error('Cart not found'));

      let newFinalTotal = this.subtotal;
      let couponApplicableProducts = [];

      if (this.coupon) {
          const coupon = await Coupon.findById(this.coupon);
          if (coupon) {
              const validation = await validateCouponLogic(coupon, { items: cart.items });

              if (validation.valid) {
                  couponApplicableProducts = cart.items.filter(
                      (item) => item.productId.owner.toString() === coupon.createdBy.toString()
                  );

                  let totalApplicablePrice = couponApplicableProducts.reduce(
                      (sum, item) => sum + item.productId.price * item.quantity, 0
                  );

                  if (couponApplicableProducts.length > 0) {
                      if (coupon.type === 'percentage') {
                          let totalDiscount = (totalApplicablePrice * coupon.value) / 100;
                          discountPerProduct = totalDiscount / totalApplicablePrice;
                      } else if (coupon.type === 'flat') {
                          discountPerProduct = Math.floor(coupon.value / totalApplicablePrice);
                      }
                      couponDiscount = discountPerProduct * totalApplicablePrice;
                  } else {
                      return next(new Error('No matching products found for this coupon.'));
                  }
              } else {
                  return next(new Error(`Coupon validation failed: ${validation.errors.join(', ')}`));
              }
          } else {
              return next(new Error('Coupon not found.'));
          }
      }

      this.items = cart.items.map((item) => {
          let discountedPrice = item.productId.price;

          if (couponApplicableProducts.some((p) => p.productId._id.toString() === item.productId._id.toString())) {
              let productCouponDiscount = Math.min(item.productId.price, discountPerProduct);
              discountedPrice -= productCouponDiscount;
          }

          return {
              productId: item.productId._id,
              quantity: item.quantity,
              price: discountedPrice,
              color: item.color,
              size: item.size,
          };
      });

      this.couponDiscount = couponDiscount;
      this.finalTotal = Math.max(this.subtotal - this.couponDiscount, 0);

      next();
  } catch (error) {
      next(error);
  }
});




module.exports = mongoose.model('Checkout', CheckoutSchema);
