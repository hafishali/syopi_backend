const Product = require("../Models/Admin/productModel");
const Offer = require("../Models/Admin/offerModel");

const removeExpiredOffers = async () => {
  try {
    const currentDate = new Date();

    // Find all expired offers
    const expiredOffers = await Offer.find({
      expireDate: { $lt: currentDate },
      status: "active",
    });

    if (expiredOffers.length === 0) {
      console.log("No expired offers found.");
      return;
    }

    for (const offer of expiredOffers) {
      const { _id: offerId, category, subcategory, products, ownerId, ownerType } = offer;

      // Find applicable products
      const applicableProducts = await Product.find({
        $and: [
          {
            $or: [
              { _id: { $in: products } },
              { category: { $in: category } },
              { subcategory: { $in: subcategory } },
            ],
          },
          { owner: ownerId },
          { ownerType: ownerType },
          { offers: offerId },
        ],
      });

      // Update each product
      for (const product of applicableProducts) {
        // Reset offer prices
        product.variants.forEach((variant) => {
          variant.offerPrice = variant.price;
        });

        // Remove the expired offer
        product.offers = product.offers.filter((existingOfferId) => {
          return String(existingOfferId) !== String(offerId);
        });

        await product.save();
      }

      // Mark the offer as expired
      offer.status = "expired";
      await offer.save();

      console.log(`Expired offer ${offerId} processed and removed from products.`);
    }

    console.log("All expired offers processed.");
  } catch (error) {
    console.error("Error removing expired offers:", error.message);
  }
};

module.exports = removeExpiredOffers;
