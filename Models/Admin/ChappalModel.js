const mongoose = require("mongoose");

const chappalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "chappal name is required"],
  },
  images: {
    type: [String],
    required: [true, "At least one chappal image is required"]
  },
//   category: {
//     type: String,
//     required: [true, "category is required"],
//   },
  description: {
    type: String,
    required: [true, "description is required"],
  },
//   subcategory: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "SubCategory",
//     required: true,
//   },
  brand: {
    type: String,
    required: [ true, 'brand is required' ]
  },
  wholesaleprice: {
    type: String,
  },
  normalprice: {
    type: String
  },
  offerprice: {
    type: String
  },
  stock: {
    type: Number,
    required: [ true, 'stock is required' ]
  },
  date: {
    type: Date,
    required: [ true, 'date is required' ]
  },
  sizes: {
    type: Array,
    required: [ true, 'sizes is required' ]
  },
  colours: {
    type: Array,
    required: [ true, 'colours is required' ]
  },
  offer: {
    type: Number
  },
  coupon: {
    type: Number
  },
//   strapmaterial: {
//     type: String,
//     required: [ true, 'strapmaterial is required' ]
//   },
  weight: {
    type: String,
  },
  solematerial: {
    type: String, //rubber,leather
  },
  type: {
    type: String, // formal, casual
  }
},{ timestamps: true });

const chappal = mongoose.model('Chappal',chappalSchema);
module.exports = chappal;