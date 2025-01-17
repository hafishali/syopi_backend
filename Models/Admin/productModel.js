const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "product name is required"],
  },
  images: {
    type: [String],
    required: [true, "At least one product image is required"]
  },
  category: {
    type: String,
    ref: "Category"
    // required: [true, "category is required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
    // required: true,
  },
  brand: {
    type: String,
    required: [ true, 'brand is required' ]
  },
  prices: {
    wholesalePrice: { type: Number, default: 0 },
    normalPrice: { type: Number, default: 0 },
    offerPrice: { type: Number, default: 0 },
  },
  stock: {
    type: Number,
    required: [ true, 'stock is required' ]
  },
  date: {
    type: Date,
    default: Date.now,
    required: [ true, 'date is required' ]
  },
  details: {
    type: Map, // Flexible structure for product-specific attributes
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
  offer: {
    type: Number
  },
  coupon: {
    type: Number
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "ownerType", // Dynamically reference Admin or Vendor
    required: true,
  },
  ownerType: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["approved", "pending", "rejected"],
    default: "pending",
  },
  
},{ timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;     