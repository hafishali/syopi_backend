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