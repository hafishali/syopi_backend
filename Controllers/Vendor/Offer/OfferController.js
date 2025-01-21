const Offer = require('../../../Models/Vendor/OfferModel');
const Vendor = require('../../../Models/Admin/VendorModel');

// create new offer
exports.createOffer = async(req,res) => {
    const { offerName,offerType,amount,startDate,expireDate,category,subcategory,status,products } = req.body;
    try {
        const vendor = await Vendor.findById(req.user.id);
        if(!vendor){
            return res.status(403).json({ message: 'Only vendors can create offers.' });
        }

        const newOffer = new Offer({
            offerName,
            offerType,
            amount,
            startDate,
            expireDate,
            category: category || [],
            subcategory: subcategory || [],
            products: products || [],
            status,
            createdBy: vendor._id
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

// get all offers
exports.getOffers = async(req,res) => {
    try {
        const offers = await Offer.find({createdBy:req.user.id}).populate('category','name').populate('subcategory','name').populate('products', 'name').populate('createdBy','role').sort({ startDate: 1 });
        res.status(200).json({ offers });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching offers', error: error.message });
    }
}

// get offer by id
exports.getOfferById = async(req,res) => {
    const { id } = req.params;
    try {
        const offer = await Offer.findById(id);
        if(!offer){
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.status(200).json({ offer });
    } catch (error) {
        res.status(500).json({ message: 'Error fetch offer', error: error.message });
    }
}

// update offers
exports.updateOffer = async(req,res) => {
    const { id } = req.params;
    const { offerName,offerType,amount,startDate,expireDate,category,subcategory,status,products } = req.body;
    try {
        const updatedOffer = await Offer.findByIdAndUpdate(id,{
            ...(offerName && { offerName }),
            ...(offerType && { offerType }),
            ...(amount && { amount }),
            ...(startDate && { startDate }),
            ...(expireDate && { expireDate }),
            ...(category && { category }),
            ...(subcategory && { subcategory }),
            ...(products && { products }),
            ...(status && { status }),
          },{ new: true });

        if(!updatedOffer){
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.status(200).json({ message: 'Offer updated successfully', offer: updatedOffer });
    } catch (error) {
        res.status(500).json({ message: 'Error updating offer', error: error.message });
    }
}

// delete offer
exports.deleteOffer = async(req,res) =>{
    const { id } = req.params;
    try {
        const deletedOffer = await Offer.findByIdAndDelete(id);
        if(!deletedOffer){
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.status(200).json({ message: 'Offer deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: 'Error deleting offer', error: error.message });
    }
}