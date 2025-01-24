const { json } = require('body-parser');
const Products=require('../../../Models/Admin/productModel')

// get all products with filter(brand,type,category,subcategory)
exports.getallProducts = async (req, res) => {
    try {
      const { page = 1, limit = 10, brand, type, subcategory, category,material ,productType} = req.query;
  
      const query = {};
      if (category) {
        query.category = category; 
      }
  
      if (brand) query.brand = brand;
      if (type) query["details.type"] = type;
      if (subcategory) query.subcategory = subcategory;
      if(material)query.material=material
      if(productType)query.productType=productType
  
      const products = await Products.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });
  
      const totalCount = await Products.countDocuments(query);
  
      res.status(200).json({
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
        } 
      }
      );
    } catch (err) {
      res.status(500).json({ message: "Error fetching chappals", error: err.message });
    }
  };

// get product by id
exports.getProductById = async (req, res) => {
    const { id } = req.params;
    try {
      const product = await Products.findById(id)
        .populate('category')  
        .populate('subcategory');  
  
      if (!product) {
        return res.status(404).json({ message: "Chappal not found" });
      }
  
    //   let ownerDetails = null;
    // if (product.owner) {
    //   const admin = await Admin.findById(product.owner).select('-password'); 
    //   const vendor = await Vendor.findById(product.owner).select('-password'); 

    //   ownerDetails = admin || vendor; 
    // }

    // if (ownerDetails) {
    //   product.owner = ownerDetails; 
    // }
  
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json({ message: "Error fetching chappal", error: err.message });
    }
  };

// sorting based on price
exports.getSortedProducts = async (req, res) => {
  try {
    const { sort } = req.query;

    if (!sort || (sort !== 'asc' && sort !== 'desc')) {
      return res.status(400).json({ message: 'Invalid sort parameter. Use "asc" or "desc".' });
    }

    const sortOrder = sort === 'asc' ? 1 : -1;

    // Fetch and sort products based on the lowest offer price in their variants
    const products = await Products.aggregate([
      {
        $sort: {
          "variants.0.price": sortOrder,
        }
      }
    ]);

    res.status(200).json({ message: 'Products sorted successfully', products });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sorted products', error: error.message });
  }
};

//filter based on brand
exports.filterBrand = async(req,res) => {
  try {
    const {names} = req.query;
    if(!names || names.trim().length ===0){
      return res.status(400).json({ message: "Brand query parameter is required" });
    }

    const brandNames = names.split(',').map(name => name.trim()).filter(name => name.length > 0);

    if (brandNames.length === 0) {
      return res.status(400).json({ message: "Invalid brand names provided" });
    }

    const products = await Products.find({ brand: { $in: brandNames } });

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found for the specified brand" });
    }

    return res.status(200).json({ products });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred while filtering products", error: error.message });
  }
}

//filter by size
exports.filterBySize = async(req,res) => {
  try {
    const { size } = req.query;
    if(!size || size.trim().length === 0){
      return res.status(400).json({ message: "Size query parameter is required" });
    }

    const sizes = size.split(',').map(size => size.trim()).filter(size => size.length > 0);

    if (sizes.length === 0) {
      return res.status(400).json({ message: "Invalid size provided" });
    }

    const products = await Products.find({ "variants.sizes.size": { $in: sizes } });

    if(products.length === 0){
      return res.status(404).json({ message: "No products found with the specified size" })
    }
    res.status(200).json({ products });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred while filtering products by size", error: error.message });
  }
}

// filter by type
exports.filterByType = async(req,res) => {
  try {
    const {type} = req.query;
    if(!type || type.trim().length === 0){
      return res.status(400).json({ message: "type query parameter is required" });
    }

    const types = type.split(',').map(type => type.trim()).filter(type => type.length > 0);

    if (types.length === 0) {
      return res.status(400).json({ message: "Invalid size provided" });
    }

    const products = await Products.find({ productType: { $in: types } });

    if(products.length === 0){
      return res.status(404).json({ message: "No products found with the specified type" })
    }

    res.status(200).json({ products });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred while filtering products by type", error: error.message });
  }
}

//filter new arrivals
exports.filterByNewarrivals = async(req,res) => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - 2);

    const newProducts = await Products.find({
      createdAt: { $gte: date }, // Filter products uploaded within the last 2 days
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Filtered products uploaded within the last 2 days",
      data: newProducts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to filter products by new arrivals",
      error: error.message,
    });
  }
}