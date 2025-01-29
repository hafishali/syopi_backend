// offerController.js
const Offer = require("../../../Models/Admin/offerModel");
const Product = require("../../../Models/Admin/productModel");
const Category = require("../../../Models/Admin/CategoryModel");
const SubCategory = require("../../../Models/Admin/SubCategoryModel")
const mongoose = require('mongoose')
const removeExpiredOffers = require("../../../utils/removeExpiredOffers")

const applyOfferToProducts = async (offer) => {
  const { category, subcategory, products, ownerId, ownerType, offerType, amount, expireDate,_id: offerId, } = offer;

  // Validate offer status
  if (offer.status !== "active") throw new Error("Offer is not active.");
  if (new Date() > expireDate) throw new Error("Offer has expired.");


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
    ],
  });

  if (applicableProducts.length === 0) {
    throw new Error("No applicable products found for this offer.");
  }

  for (const product of applicableProducts) {
    // Apply the offer to each variant
    let minOfferPrice = Infinity;

    for (const variant of product.variants) {
      if (!variant.price || variant.price <= 0) {
        console.log(`Invalid price for variant with color: ${variant.color}. Skipping...`);
        continue;
      }

      if (offerType === "percentage") {
        const discount = (variant.price * amount) / 100;
        variant.offerPrice = Math.max(0, variant.price - discount);
      } else if (offerType === "fixed") {
        variant.offerPrice = Math.max(0, variant.price - amount);
      }

      minOfferPrice = Math.min(minOfferPrice, variant.offerPrice);
    }

    // Update the product with the new offer
    product.offerPrice = minOfferPrice;
    product.currentOffer = offerId; // Set the active offer


    await product.save();
  }

  console.log(`Offer applied to ${applicableProducts.length} products.`);
};

const removeOfferFromProducts = async (offer) => {
  const { _id: offerId, category, subcategory, products, ownerId, ownerType } = offer;

  const applicableProducts = await Product.find({
    $and: [
      { $or: [{ _id: { $in: products } }, { category: { $in: category } }, { subcategory: { $in: subcategory } }] },
      { owner: ownerId },
      { ownerType },
      { currentOffer: offerId }, // Only products with this specific offer applied
    ],
  });

  for (const product of applicableProducts) {
    // Reset offer-related fields
    product.currentOffer = null;
    product.offerPrice = null; // Reset to original price
    product.variants.forEach((variant) => {
      variant.offerPrice = null;
    });

    await product.save();
  }

  console.log(`Offer removed from ${applicableProducts.length} products.`);
};


// Create Offer
exports.createOffer = async (req, res) => {
  try {
    const { offerName, ownerId, offerType, amount, startDate, expireDate, category, subcategory, products } = req.body;
  
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid offer amount. It must be greater than 0." });
    }

    const ownerType = req.user.role;
    const createdBy = req.user._id;

    // Validate categories and ensure they belong to the creator
    if (category) {
      for (const catId of category) {
        const hasMatchingProducts = await Product.exists({
          category: catId,
          owner: ownerId,
          ownerType: ownerType,
        });
        if (!hasMatchingProducts) {
          return res.status(400).json({
            message: `Category ID ${catId} does not have any products owned by this vendor/admin.`,
          });
        }
      }
    }

    // Validate subcategories and ensure they belong to the creator
    if (subcategory) {
      for (const subCatId of subcategory) {
        const hasMatchingProducts = await Product.exists({
          subcategory: subCatId,
          owner: ownerId,
          ownerType: ownerType,
        });
        if (!hasMatchingProducts) {
          return res.status(400).json({
            message: `Subcategory ID ${subCatId} does not have any products owned by this vendor/admin.`,
          });
        }
      }
    }

     // Validate products and ensure they belong to the creator
     if (products) {
      for (const prodId of products) {
        const existingProduct = await Product.findOne({ _id: prodId, owner: ownerId });
        if (!existingProduct) {
          return res.status(403).json({
            message: `Product ID ${prodId} does not belong to the specified owner.`,
          });
        }
      }
    }

    const newOffer = new Offer({
      offerName,
      offerType,
      amount,
      startDate,
      expireDate,
      category: category ? category.map((id) => new mongoose.Types.ObjectId(id)) : [],
      subcategory: subcategory ? subcategory.map((id) => new mongoose.Types.ObjectId(id)) : [],
      products: products ? products.map((id) => new mongoose.Types.ObjectId(id)) : [],
      createdBy,
      ownerType,
      ownerId,
    });

    await newOffer.save();

    // Apply the offer to products
    await applyOfferToProducts(newOffer);

    res.status(201).json({ message: "Offer created and applied successfully", offer: newOffer });
  } catch (error) {
    res.status(500).json({ message: "Error creating offer", error: error.message });
  }
};

// Get All Offers
exports.getOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("products", "name")
      .populate("createdBy", "role")
      .sort({ startDate: 1 }); // Sort by start date

    res.status(200).json({ offers });
  } catch (error) {
    res.status(500).json({ message: "Error fetching offers", error: error.message });
  }
};

// Get Offer by ID
exports.getOfferById = async (req, res) => {
  const { id } = req.params;

  try {
    const offer = await Offer.findById(id)
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("products", "name")
      .populate("createdBy", "role");

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.status(200).json({ offer });
  } catch (error) {
    res.status(500).json({ message: "Error fetching offer", error: error.message });
  }
};

// Update Offer
exports.updateOffer = async (req, res) => {
  const { id } = req.params;
  const { offerName, offerType, amount, startDate, expireDate, category, subcategory, status } = req.body;

  try {
    const updatedOffer = await Offer.findByIdAndUpdate(
      id,
      {
        ...(offerName && { offerName }),
        ...(offerType && { offerType }),
        ...(amount && { amount }),
        ...(startDate && { startDate }),
        ...(expireDate && { expireDate }),
        ...(category && { category }),
        ...(subcategory && { subcategory }),
        ...(status && { status }),
      },
      { new: true }
    );

    if (!updatedOffer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Reapply offer to products if updated
    await applyOfferToProducts(updatedOffer);

    res.status(200).json({ message: "Offer updated successfully", offer: updatedOffer });
  } catch (error) {
    res.status(500).json({ message: "Error updating offer", error: error.message });
  }
};

// Delete Offer
exports.deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Ensure only the creator can delete the offer
    if (String(offer.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: "You do not have permission to delete this offer." });
    }

    
    // Remove the offer from all applicable products
    await removeOfferFromProducts(offer);
    await offer.remove();

    res.status(200).json({ message: "Offer deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting offer", error: error.message });
  }
};

// Manually trigger the expired offer cleanup
exports.triggerOfferCleanup = async (req, res) => {
  try {
    await removeExpiredOffers();
    res.status(200).json({ message: "Expired offers processed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error processing expired offers.", error: error.message });
  }
};