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
    // Initialize discounts
    let couponDiscount = 0;
    let coinDiscount = 0;

    // Fetch cart details
    const cart = await Cart.findById(this.cartId).populate('items.productId');
    if (!cart) {
      throw new Error('Cart not found');
    }

    // Map items from the cart to the checkout schema
    this.items = cart.items.map((item) => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.price,
      color: item.color,
      size: item.size,
    }));

    // Set subtotal and initialize final total
    this.subtotal = cart.totalPrice;
    this.finalTotal = this.subtotal;

    // Validate and apply coupon if present
    if (this.coupon) {
      const coupon = await Coupon.findById(this.coupon).populate(
        'applicableProducts applicableCategories applicableSubcategories'
      );
      if (!coupon) throw new Error('Invalid coupon');

      // Use the validateCouponLogic function
      const { valid, errors } = await validateCouponLogic(coupon, this);
      if (!valid) throw new Error(errors);

      // Apply coupon discount logic
      if (coupon.type === 'percentage') {
        couponDiscount =Math.floor((this.subtotal * coupon.value) / 100) ;
      } else if (coupon.type === 'flat') {
        couponDiscount = coupon.value;
      }
    }

    // Apply coin discount if coins are used
    if (this.coinsApplied > 0) {
      /* const coinValue = 0.1; */ // Example: Each coin equals $0.1 discount
      coinDiscount = this.coinsApplied /* * coinValue; */

      // Ensure coin discount does not exceed subtotal
      if (coinDiscount > this.subtotal) coinDiscount = this.subtotal;
    }

    // Calculate total discounts
    this.couponDiscount = couponDiscount;
    this.coinDiscount = coinDiscount;
    this.ReducedDiscount = couponDiscount + coinDiscount;

    // Calculate final total
    this.finalTotal = this.subtotal - this.ReducedDiscount;

    // Ensure final total is not negative
    if (this.finalTotal < 0) this.finalTotal = 0;

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Checkout', CheckoutSchema);
