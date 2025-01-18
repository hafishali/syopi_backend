const Product = require("../../../Models/Admin/productModel");
const Category = require("../../../Models/Admin/CategoryModel");
const SubCategory = require("../../../Models/Admin/SubCategoryModel");
const Admin = require('../../../Models/Admin/AdminModel')
const Vendor = require('../../../Models/Admin/VendorModel')
const fs = require("fs");
const path = require("path");

// Create a new product (Vendor-specific)
exports.createProduct = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one product image is required" });
    }
    const imagePaths = req.files.map((file) => file.filename);

    const {
      name,
      description,
      brand,
      wholesalePrice,
      normalPrice,
      offerPrice,
      stock,
      sizes,
      colors,
      weight,
      material,
      soleMaterial,
      type,
      productType,
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
          ownerType = vendor.role || "vendor";
        } else {
          return res.status(400).json({ message: "Invalid owner ID" });
        }
      }
      
    // Parse details
    const parsedSizes = Array.isArray(sizes) ? sizes : JSON.parse(sizes || "[]");
    const parsedColors = Array.isArray(colors) ? colors : JSON.parse(colors || "[]");

    // Validate category and subcategory IDs
    if (category && !(await Category.findById(category))) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    if (subcategory && !(await SubCategory.findById(subcategory))) {
      return res.status(400).json({ message: "Invalid subcategory ID" });
    }

    const newProduct = new Product({
      name,
      images: imagePaths,
      category,
      description,
      subcategory,
      brand,
      prices: {
        wholesalePrice: parseFloat(wholesalePrice) || 0,
        normalPrice: parseFloat(normalPrice) || 0,
        offerPrice: parseFloat(offerPrice) || 0,
      },
      stock: parseInt(stock, 10) || 0,
      details: {
        sizes: parsedSizes,
        colors: parsedColors,
        weight,
        material,
        soleMaterial,
        type,
      },
      productType,
      owner,
      ownerType, // Fixed for Vendor
    });

    await newProduct.save();
    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Get all vendor products
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, productType } = req.query;

    const query = { ownerType: "vendor" };
    if (productType) query.productType = productType;

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

// Get a single vendor product
exports.getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id).populate("category subcategory");

    if (!product || product.ownerType !== "vendor") {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error fetching product", error: err.message });
  }
};

// Update a vendor product
exports.updateProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (!product || product.ownerType !== "vendor") {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingImages = product.images;
    const newImages = req.files ? req.files.map((file) => file.filename) : [];

    if (existingImages.length + newImages.length > 5) {
      return res.status(400).json({ message: "Cannot have more than 5 images" });
    }

    const parsedSizes = req.body.sizes ? JSON.parse(req.body.sizes) : product.details.sizes;
    const parsedColors = req.body.colors ? JSON.parse(req.body.colors) : product.details.colors;

    const updatedData = {
      ...req.body,
      images: [...existingImages, ...newImages],
      "details.sizes": parsedSizes,
      "details.colors": parsedColors,
    };

     // Ensure prices are explicitly updated
     if (req.body.wholesalePrice !== undefined) {
      updatedData["prices.wholesalePrice"] = parseFloat(req.body.wholesalePrice);
    }
    if (req.body.normalPrice !== undefined) {
      updatedData["prices.normalPrice"] = parseFloat(req.body.normalPrice);
    }
    if (req.body.offerPrice !== undefined) {
      updatedData["prices.offerPrice"] = parseFloat(req.body.offerPrice);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true });

    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (err) {
    res.status(500).json({ message: "Error updating product", error: err.message });
  }
};

// Delete a vendor product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (!product || product.ownerType !== "vendor") {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(id);

    const basePath = path.join("./uploads/vendor/product");
    product.images.forEach((image) => {
      const imagePath = path.join(basePath, image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product", error: err.message });
  }
};
