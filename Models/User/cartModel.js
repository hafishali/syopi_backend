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
      let totalPrice=0
  
      for (const item of this.items) {
        const product = await Product.findById(item.productId).select('prices');
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }
        item.price = product.prices.offerPrice 
        subtotal += item.price * item.quantity;
      }
      this.subtotal = subtotal;
      this.totalPrice=subtotal
   
  
      next();
    } catch (error) {
      next(error);
    }
  });
  

const Cart = mongoose.model('Cart', CartSchema);
module.exports = Cart;
