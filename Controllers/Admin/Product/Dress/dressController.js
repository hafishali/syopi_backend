const Product = require('../../../../Models/Admin/productModel');
const Category = require('../../../../Models/Admin/CategoryModel');
const subCategory = require('../../../../Models/Admin/SubCategoryModel');
const Admin = require('../../../../Models/Admin/AdminModel');
// const Vendor = require('../../../../Models/Vendor/VendorModel');
const fs = require('fs');
const path = require('path');

// Create a new dress
exports.createDress = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one dress image is required" });
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
      material,
      colors,
      date,
      category,
      subcategory,
      owner,
    } = req.body;

    // Determine ownerType based on the owner ID
    let ownerType = null;
    const admin = await Admin.findById(owner);
    if (admin) {
      ownerType = admin.role;
    } else {
      const vendor = await Vendor.findById(owner);
      if (vendor) {
        ownerType = vendor.role || "Vendor";
      } else {
        return res.status(400).json({ message: "Invalid owner ID" });
      }
    }

    // Parse sizes and colors as arrays if provided
    const parsedSizes = Array.isArray(sizes) ? sizes : JSON.parse(sizes || "[]");
    const parsedColors = Array.isArray(colors) ? colors : JSON.parse(colors || "[]");

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
        colors: parsedColors,
        material,
      },
      date: date ? new Date(date) : new Date(),
      owner,
      ownerType,
    });

    // Verify the category and subcategory exist if IDs are provided
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
    }

    if (subcategory) {
      const subcategoryExists = await subCategory.findById(subcategory);
      if (!subcategoryExists) {
        return res.status(400).json({ message: "Invalid subcategory ID" });
      }
    }

    await newProduct.save();
    res.status(201).json({ message: "Dress created successfully", product: newProduct });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Get all product with dress and chappal
exports.getAllProduct = async (req, res) => {
    try {
      const { page = 1, limit = 10, brand, material, subcategory, category } = req.query;
  
      // Build query object
      const query = {};
      if (category) query.category = category; // Add category to query if provided
      if (brand) query.brand = brand;
      if (material) query["details.material"] = material;
      if (subcategory) query.subcategory = subcategory;
  
      // Fetch products with pagination
      const products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });
  
      const totalCount = await Product.countDocuments(query);
  
      res.status(200).json({
        message: "Dresses fetched successfully",
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Error fetching dresses", error: err.message });
    }
  };
 
//get all dress
exports.getDresses = async (req, res) => {
    try {
      const { page = 1, limit = 10, ownerType } = req.query;
  
      // Explicitly filter for productType "Dress"
      const query = { productType: "Dress" }; 
  
      // Optionally filter by ownerType (e.g., Admin or Vendor)
      if (ownerType) query.ownerType = ownerType;
  
      // Fetch products with pagination
      const products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });
  
      const totalCount = await Product.countDocuments(query);
  
      res.status(200).json({
        message: "Dresses fetched successfully",
        products,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
        },
      });
    } catch (err) {
      res.status(500).json({ message: "Error fetching dresses", error: err.message });
    }
  };
  
  

// Get a single dress by ID
exports.getDressById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id)
      .populate('category')
      .populate('subcategory');

    if (!product) {
      return res.status(404).json({ message: "Dress not found" });
    }

    let ownerDetails = null;
    if (product.owner) {
      const admin = await Admin.findById(product.owner).select('-password');
      const vendor = await Vendor.findById(product.owner).select('-password');

      ownerDetails = admin || vendor;
    }

    if (ownerDetails) {
      product.owner = ownerDetails;
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error fetching dress", error: err.message });
  }
};

// Update a dress
exports.updateDress = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Dress not found" });
    }

    const existingImages = product.images;
    const newImages = req.files ? req.files.map((file) => file.filename) : [];

    if (existingImages.length + newImages.length > 5) {
      return res.status(400).json({ message: "Cannot have more than 5 images for a dress" });
    }

    const parsedSizes = req.body.sizes ? JSON.parse(req.body.sizes) : product.details.sizes;
    const parsedColors = req.body.colors ? JSON.parse(req.body.colors) : product.details.colors;

    const updatedData = {
      ...req.body,
      images: [...existingImages, ...newImages],
      "details.sizes": parsedSizes,
      "details.colors": parsedColors,
    };

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true });

    res.status(200).json({ message: "Dress updated successfully", product: updatedProduct });
  } catch (err) {
    res.status(500).json({ message: "Error updating dress", error: err.message });
  }
};

// Delete a dress
exports.deleteDress = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Dress not found" });
    }

    await Product.findByIdAndDelete(id);

    const basePath = path.join('./uploads/admin/product');
    product.images.forEach((image) => {
      const imagePath = path.join(basePath, image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    res.status(200).json({ message: "Dress deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting dress", error: err.message });
  }
};
