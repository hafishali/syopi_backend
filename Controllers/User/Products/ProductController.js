const getProduct = require('../../../utils/getProducts');

// get all products
exports.getallProducts = async(req,res) => {
  try {
    const { brand,productType,minPrice,maxPrice,size,newArrivals } = req.query;
    let userId;
    if (req.user && req.user.id) {
      userId = req.user.id;
    }
    const allProducts = await getProduct(userId);

    if(!allProducts || allProducts.length === 0){
      return res.status(404).json({ message: "No products found" });
    }

    // Parse multiple size inputs if provided
    const sizesArray = size ? size.split(",") : null;

    // Calculate the date for new arrivals (last 2 days)
    const newArrivalDate = new Date();
    newArrivalDate.setDate(newArrivalDate.getDate() - 2);

    const filteredProducts = allProducts.filter((product) => {
      let isMatching = true;

      // Filter by brand
      if (brand && product.brand !== brand) {
        isMatching = false;
      }

      // Filter by product type
      if (productType && product.productType !== productType) {
        isMatching = false;
      }

      // Filter by price range (offerPrice in variants)
      if ((minPrice || maxPrice) && product.variants && product.variants.length > 0) {
        const firstVariant = product.variants[0];  // Get the first variant

        const isWithinPriceRange =
          (!minPrice || firstVariant.offerPrice >= parseFloat(minPrice)) &&
          (!maxPrice || firstVariant.offerPrice <= parseFloat(maxPrice));

        if (!isWithinPriceRange) isMatching = false;
      }

      // Filter by multiple sizes (in sizes array within variants)
      if (sizesArray && product.variants) {
        const sizeMatch = product.variants.some((variant) =>
          variant.sizes.some((s) => sizesArray.includes(s.size))
        );
        if (!sizeMatch) isMatching = false;
      }

      // Filter by new arrivals (createdAt within the last 2 days)
      if (newArrivals === "true") {
        if (!product.createdAt || new Date(product.createdAt) < newArrivalDate) {
          isMatching = false;
        }
      }

      return isMatching;
    });

    if (!filteredProducts || filteredProducts.length === 0) {
      return res.status(404).json({ message: "No products found matching the criteria" });
    }

    res.status(200).json({ products: filteredProducts });
  } catch (error) {
    res.status(500).json({ message: "Error fetching prodcuts", error: error.message });
  }
}

// search product
exports.searchProducts = async(req,res) => {
  try {
    let userId;
    if (req.user && req.user.id) {
      userId = req.user.id;
    }
    const allProducts = await getProduct(userId);

    if(!allProducts || allProducts.length === 0){
      return res.status(404).json({ message: "No products found" });
    }

    const {search} = req.query;
    if(!search || !search.trim()){
      return res.status(400).json({ message: "No search query found"})
    }
    const searchQuery = search.trim().toLowerCase();

    const matchedProducts = allProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery)
    );

    if (matchedProducts.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ products: matchedProducts })

  } catch (error) {
    res.status(500).json({ message: "Error searching products", error: error.message});
  }
}

// get product by id
exports.getProductById = async (req, res) => {
    const { id } = req.params;
    try {
      let userId;
      if (req.user && req.user.id) {
        userId = req.user.id;
      }

      const products = await getProduct(userId);
      const product = products.find((product) => product._id.toString() === id);
  
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json({ message: "Error fetching product", error: err.message });
    }
  };