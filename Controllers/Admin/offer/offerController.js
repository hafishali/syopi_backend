const Offer = require('../../../Models/Admin/offerModel');
const Admin = require('../../../Models/Admin/AdminModel');

// create offer
exports.createOffer = async (req,res) => {
    const { offerName, offerType, amount, startDate, expireDate, category, subcategory,
        // product,
         status } = req.body;


  try {

    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(403).json({ message: 'Only admins can create offers.' });
    }

    const newOffer = new Offer({
      offerName,
      offerType, 
      amount,
      startDate,
      expireDate,
      category: category || [],
      subcategory: subcategory || [],
    // products: products || [],
      status,
      createdBy: admin._id,  
    });

    await newOffer.save();
    res.status(201).json({
      message: 'Offer created successfully',
      offer: newOffer,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating offer', error: error.message });
  }
}

// Get all offers
exports.getOffers = async (req, res) => {
    try {
        const offers = await Offer.find()
        .populate('category', 'name')
        .populate('subcategory', 'name')
        // .populate('products', 'name')
        .populate('createdBy', 'role')
        .sort({ startDate: 1 }); // Sort by start date
  
      res.status(200).json({ offers });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching offers', error: error.message });
    }
  };
  
  // Update Offer
  exports.updateOffer = async (req, res) => {
    const { id } = req.params;
    const { offerName, offerType, amount, startDate, expireDate, category, subcategory, 
        // products,
         status } = req.body;
  
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
              // ...(products && { products }),
              ...(status && { status }),
            },
            { new: true }
          );
  
      if (!updatedOffer) {
        return res.status(404).json({ message: 'Offer not found' });
      }
  
      res.status(200).json({ message: 'Offer updated successfully', offer: updatedOffer });
    } catch (error) {
      res.status(500).json({ message: 'Error updating offer', error: error.message });
    }
  };
  
  // Delete Offer
  exports.deleteOffer = async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedOffer = await Offer.findByIdAndDelete(id);
  
      if (!deletedOffer) {
        return res.status(404).json({ message: 'Offer not found' });
      }
  
      res.status(200).json({ message: 'Offer deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting offer', error: error.message });
    }
  };