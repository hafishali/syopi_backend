const cron = require('node-cron');
const Coupon = require('../Models/Admin/couponModel');

// Function to check and update coupon statuses
const updateCouponStatuses = async () => {
  console.log('Running coupon expiration check...');
  const now = new Date();

  try {
    const result = await Coupon.updateMany(
      { endDate: { $lt: now }, status: 'active' }, // Expired but still marked active
      { $set: { status: 'expired' } }
    );
    console.log(`Updated ${result.modifiedCount} coupons to 'expired' status.`);
  } catch (error) {
    console.error('Error updating coupon statuses:', error.message);
  }
};

// Schedule the job and export it
const scheduleCouponCron = () => {
  cron.schedule('0 0 * * *', updateCouponStatuses, {
    scheduled: true,
    timezone: 'IST', // You can adjust the timezone if necessary
  });
};

module.exports = { scheduleCouponCron, updateCouponStatuses };
 