const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true }, // Discount value
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'inactive'], default: 'active'},
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
//   applicableSubcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' }],
//   applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);