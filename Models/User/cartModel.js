const mongoose = require('mongoose');
const validateCoupon  = require('../../utils/validateCoupon'); // Your coupon validator function
const Product=require('../../Models/Admin/productModel')

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' ,required: [true, "User ID is required"]},
  items: [ {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, "Product ID is required"]
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity cannot be less than 1"]
    },
    price: {
      type: Number,
      
    },
    color: {
      type: String,
      required: [true, "Color is required"]
    },
    size: {
      type: String,
      required: [true, "Size is required"]
    },

  }],
 /*  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
  },
  syopi_Coins:{
    type:Number,
    default:0
  }, */
  subtotal:{type: Number, default: 0},
  discount: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  
},{timestamps:true});

CartSchema.pre('save', async function (next) {
  try {
    let subtotal = 0;

    for (const item of this.items) {
      if (!item.price) {
        // Only process items that don't already have a price set
        const product = await Product.findById(item.productId).select('variants');
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        const variant = product.variants.find(variant => variant.color === item.color);
        if (!variant) {
          throw new Error(`Variant with color ${item.color} not found for product ID ${item.productId}`);
        }

        const sizeDetails = variant.sizes.find(size => size.size === item.size);
        if (!sizeDetails) {
          throw new Error(`Size ${item.size} not found for product ID ${item.productId} with color ${item.color}`);
        }

        item.price = variant.offerPrice;
      }

      subtotal += item.price * item.quantity;
    }

    this.subtotal = subtotal;
    this.totalPrice = subtotal;

    next();
  } catch (error) {
    next(error);
  }
});


  

const Cart = mongoose.model('Cart', CartSchema);
module.exports = Cart;
