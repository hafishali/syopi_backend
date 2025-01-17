const Product = require('../../../../Models/Product/productModel');
const Category = require('../../../../Models/Admin/CategoryModel')
const fs = require('fs');
const path = require('path');
const subCategory = require('../../../../Models/Admin/SubCategoryModel');
const Admin = require('../../../../Models/Admin/AdminModel')

// Create a new chappal
exports.createChappal = async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "At least one chappal image is required" });
      }
      const imagePaths = req.files.map((file) => file.filename);
  
      const {
        name,
        productType,
        description,
        brand,
        wholesalePrice,
        normalPrice,
        offerPrice,
        stock,
        sizes,
        colours,
        weight,
        date,
        soleMaterial,
        type,
        category,
        subcategory,
        owner,
      } = req.body;

      // Determine ownerType based on the owner ID
    
    // Determine ownerType based on the role in Admin or Vendor
    let ownerType = null;
    const admin = await Admin.findById(owner);
    if (admin) {
      ownerType = admin.role; // Use the role field from Admin
    } else {
      const vendor = await Vendor.findById(owner);
      if (vendor) {
        ownerType = vendor.role || "Vendor"; // Assume vendors have a default role like 'Vendor'
      } else {
        return res.status(400).json({ message: "Invalid owner ID" });
      }
    }
  
      // Parse sizes and colours as arrays if provided
      const parsedSizes = Array.isArray(sizes) ? sizes : JSON.parse(sizes || "[]");
      const parsedColours = Array.isArray(colours) ? colours : JSON.parse(colours || "[]");
  
      // Ensure prices are parsed as numbers
      const parsedWholesalePrice = parseFloat(wholesalePrice) || 0;
      const parsedNormalPrice = parseFloat(normalPrice) || 0;
      const parsedOfferPrice = parseFloat(offerPrice) || 0;
  
      const newProduct = new Product({
        name,
        productType,
        images: imagePaths,
        category,
        description,
        subcategory,
        brand,
        prices: {
          wholesalePrice: parsedWholesalePrice,
          normalPrice: parsedNormalPrice,
          offerPrice: parsedOfferPrice,
        },
        stock: parseInt(stock, 10) || 0, // Ensure stock is a number
        details: {
          sizes: parsedSizes,
          colours: parsedColours,
          weight,
          soleMaterial,
          type,
        },
        date: date ? new Date(date) : new Date(), 
        owner, 
        ownerType,
      });

      // Verify the category and subcategory exist if IDs are provided
    let categoryid = null;
    let subcategoryId = null;

    if (category) {
      categoryid = await Category.findById(category);
      if (!categoryid) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
    }

    if (subcategory) {
      subcategoryId = await subCategory.findById(subcategory);
      if (!subcategoryId) {
        return res.status(400).json({ message: "Invalid subcategory ID" });
      }
    }
  
      await newProduct.save();
      res.status(201).json({ message: "Chappal created successfully", product: newProduct });
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
  };
  
// get all chappals
exports.getChappals = async (req, res) => {
  try {
    const { page = 1, limit = 10, ownerType, productType } = req.query;

    const query = {};
    if (ownerType) query.ownerType = ownerType; // Filter by Admin or Vendor
    if (productType) query.productType = productType; // Filter by product type

    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalCount = await Product.countDocuments(query);

    res.status(200).json({
      message: "Products fetched successfully",
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
};


// Get all products
exports.getAllProducts = async (req, res) => {
    try {
      const { page = 1, limit = 10, brand, type, subcategory, category } = req.query;
  
      const query = {};
      if (category) {
        query.category = category; // Query by category ID directly
      }
  
      if (brand) query.brand = brand;
      if (type) query["details.type"] = type;
      if (subcategory) query.subcategory = subcategory;
  
      const products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });
  
      const totalCount = await Product.countDocuments(query);
  
      res.status(200).json({
        message: "Chappals fetched successfully",
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Error fetching chappals", error: err.message });
    }
  };
  

// Get a single chappal by ID
exports.getChappalById = async (req, res) => {
    const { id } = req.params;
  
    try {
      // Find the product by ID and populate necessary fields
      const product = await Product.findById(id)
        .populate('category')  // Populating the category
        .populate('subcategory');  // Populating the subcategory
  
      if (!product) {
        return res.status(404).json({ message: "Chappal not found" });
      }
  
      let ownerDetails = null;
    if (product.owner) {
      const admin = await Admin.findById(product.owner).select('-password'); // Exclude the password
    //   const vendor = await Vendor.findById(product.owner).select('-password'); // Exclude the password

      ownerDetails = admin || vendor; // Check for admin first, then vendor if not found
    }

    if (ownerDetails) {
      product.owner = ownerDetails;  // Add the owner information to the product
    }
  
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json({ message: "Error fetching chappal", error: err.message });
    }
  };
  
  
  
  

// Update a chappal
exports.updateChappal = async (req, res) => {
    const { id } = req.params;
  
    try {
      // Find the product by ID
      const product = await Product.findById(id);
  
      if (!product) {
        return res.status(404).json({ message: "Chappal not found" });
      }
  
      // Check if the category ID exists
      const category = await Category.findById(product.category);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
  
      const existingImages = product.images;
      const newImages = req.files ? req.files.map((file) => file.filename) : [];
  
      // Limit the number of images to 5
      if (existingImages.length + newImages.length > 5) {
        return res.status(400).json({ message: "Cannot have more than 5 images for a chappal" });
      }
  
      const parsedSizes = req.body.sizes ? JSON.parse(req.body.sizes) : product.details.sizes;
      const parsedColours = req.body.colours ? JSON.parse(req.body.colours) : product.details.colours;
  
      const updatedData = {
        ...req.body,
        images: [...existingImages, ...newImages],
        "details.sizes": parsedSizes,
        "details.colours": parsedColours,
      };
  
      // Update product
      const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true });
  
      res.status(200).json({ message: "Chappal updated successfully", product: updatedProduct });
    } catch (err) {
      res.status(500).json({ message: "Error updating chappal", error: err.message });
    }
  };
  

// Delete a chappal


exports.deleteChappal = async (req, res) => {
    const { id } = req.params;
  
    try {
      // Find the product by ID
      const product = await Product.findById(id);
  
      if (!product) {
        return res.status(404).json({ message: "Chappal not found" });
      }
  
      // Check if the category ID exists
      const category = await Category.findById(product.category);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
  
      // Delete the product
      await Product.findByIdAndDelete(id);
  
      // Delete associated images from the server
      const basePath = path.join('./uploads/admin/product');
      product.images.forEach((image) => {
        const imagePath = path.join(basePath, image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
  
      res.status(200).json({ message: "Chappal deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting chappal", error: err.message });
    }
  };
  
