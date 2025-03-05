const mongoose = require('mongoose');

const VendorPayoutSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    totalSales: { type: Number, default: 0 }, // Total amount before deductions
    totalCoinDeductions: { type: Number, default: 0 }, // Coins deducted from vendor earnings
    totalCouponDiscounts: { type: Number, default: 0 }, // Coupon discounts applied
    netPayable: { type: Number, default: 0 }, // Final amount after deductions
    orderIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }], // Orders included in the payout
    payoutDate: { type: Date, default: Date.now }, // Midnight calculation timestamp
    status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' } // Payment status
});

const VendorPayout = mongoose.model('VendorPayout', VendorPayoutSchema);

module.exports = VendorPayout;
