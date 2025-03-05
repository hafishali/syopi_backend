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
        itemTotal: {
          type: Number,
          required: true
        },
        color: { type: String },
        size: { type: String },
        DiscountedPrice: { type: Number, default: 0 },
        couponDiscountedValue: { type: Number, default: 0 },
        coinDiscountedValue: { type: Number, default: 0 },
        isCoupon: { type: Boolean, default: false },
      },
    ],
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
    coinsApplied: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    couponDiscount: { type: Number, default: 0 },
    coinDiscount: { type: Number, default: 0 },
    vendorCoinBreakdown: [{
      vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
      coinValue: { type: Number, default: 0 }
    }],
    ReducedDiscount: { type: Number, default: 0 },
    finalTotal: { type: Number, required: true }, // Subtotal - Discounts (Coupon + Coins)
    isProcessed: {
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
    let vendorCoinBreakdown = {};
    
    // Fetch the cart and populate product details
    const cart = await Cart.findById(this.cartId).populate('items.productId', 'price owner');
    if (!cart) throw new Error('Cart not found');

    let newFinalTotal = this.subtotal;
    let applicableProducts = [];

    // **Coupon Logic**
    if (this.coupon) {
      const coupon = await Coupon.findById(this.coupon);
      if (!coupon) throw new Error('Coupon not found');

      const validation = await validateCouponLogic(coupon, { items: cart.items });
      if (!validation.valid) throw new Error(validation.errors.join(', '));

      applicableProducts = validation.applicableProducts;
      
      // Calculate total price of applicable items
      const totalApplicablePrice = applicableProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Compute coupon discount
      if (coupon.type === 'percentage') {
        couponDiscount = (totalApplicablePrice * coupon.value) / 100;
      } else if (coupon.type === 'flat') {
        couponDiscount = coupon.value;
      }

      // Spread discount across applicable items
      const discountPerProduct = applicableProducts.length ? couponDiscount / applicableProducts.length : 0;

      this.items = cart.items.map((item) => {
        const isApplicable = applicableProducts.some(p => p.productId.toString() === item.productId._id.toString());
        return {
          productId: item.productId._id,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          price: item.price,
          itemTotal: item.price * item.quantity,
          discountedPrice: isApplicable ? Math.max(item.price - discountPerProduct, 0) : item.price,
          couponDiscountedValue: isApplicable ? discountPerProduct : 0,
          isCoupon: isApplicable,
        };
      });
    } else {
      // No coupon: Maintain default item prices
      this.items = cart.items.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        price: item.price,
        itemTotal: item.price * item.quantity,
        discountedPrice: item.price,
        couponDiscountedValue: 0,
        isCoupon: false,
      }));
    }

    // **Coin Discount Logic**
    if (this.coinsApplied > 0) {
      let coinDiscount = Math.round(this.coinsApplied);
      let vendorCoinBreakdown = {};

      const totalItemPrice = this.items.reduce((sum, item) => sum + item.itemTotal, 0);

      this.items = this.items.map((item) => {
        const vendorId = cart.items.find(
          cartItem => cartItem.productId._id.toString() === item.productId.toString()
        ).productId.owner.toString();

        const itemCoinDiscount = Math.round((item.itemTotal / totalItemPrice) * coinDiscount);

        const discountedPrice = Math.max(0, Math.round(item.price - (itemCoinDiscount / item.quantity)));

        if (!vendorCoinBreakdown[vendorId]) {
          vendorCoinBreakdown[vendorId] = 0;
        }
        vendorCoinBreakdown[vendorId] += itemCoinDiscount;

        return {
          ...item,
          coinDiscountedValue: itemCoinDiscount,
          discountedPrice: discountedPrice
        };
      });

      this.vendorCoinBreakdown = Object.entries(vendorCoinBreakdown).map(([vendorId, coinValue]) => ({
        vendorId: new mongoose.Types.ObjectId(vendorId),
        coinValue: Math.round(coinValue)
      }));

      this.coinDiscount = coinDiscount;
      this.finalTotal = Math.max(0, Math.round(this.subtotal - this.couponDiscount - this.coinDiscount));
    } else {
      this.coinDiscount = 0;
      this.vendorCoinBreakdown = [];
      this.finalTotal = Math.max(0, Math.round(this.subtotal - this.couponDiscount));
    }

    this.ReducedDiscount=this.couponDiscount + this.coinDiscount
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Checkout', CheckoutSchema);
