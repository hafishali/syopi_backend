const Cart = require('../../../Models/User/cartModel');
const validateCoupon = require('../../../utils/validateCoupon'); 
const Product=require('../../../Models/Admin/productModel')


// create cart or add new product to cart
exports.createOrUpdateCart = async (req, res) => {
  const { userId, productId, quantity, color, size } = req.body;

  if (!userId || !productId || !quantity || !color || !size) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Validate product existence
    const product = await Product.findById(productId).select('variants');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Validate variant existence
    const variant = product.variants.find(v => v.color === color);
    if (!variant) {
      return res.status(404).json({ success: false, message: `Variant with color ${color} not found` });
    }

    // Validate size existence
    const sizeDetails = variant.sizes.find(s => s.size === size);
    if (!sizeDetails) {
      return res.status(404).json({ success: false, message: `Size ${size} not found for variant with color ${color}` });
    }

    // Find or create the user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if the product already exists in the cart
    const existingItemIndex = cart.items.findIndex(
      item =>
        item.productId.toString() === productId.toString() &&
        item.color === color &&
        item.size === size
    );

    if (existingItemIndex > -1) {
      // Update quantity for existing product in the cart
      cart.items[existingItemIndex].quantity += quantity;

      if (cart.items[existingItemIndex].quantity <= 0) {
        // Remove item if quantity becomes 0 or negative
        cart.items.splice(existingItemIndex, 1);
      }
    } else if (quantity > 0) {
      // Add new product to the cart
      cart.items.push({
        productId,
        quantity,
        color,
        size,
       
      });
    } else {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than zero' });
    }

    // Save the cart
    await cart.save();

    // Send updated cart response
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update cart',
    });
  }
};

  

// Get Cart for User
exports.getCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.find({ userId:userId }).populate('items.productId', 'name images') .exec();
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, 
        message: error.message || 'Failed to get cart'  });
  }
};

// increment or decrement quantity
exports.updateCartQuantity = async (req, res) => {
  const { userId, productId, color, size, action } = req.body;

  if (!userId || !productId || !color || !size || !action) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  if (!['increment', 'decrement'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Invalid action' });
  }

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    const itemIndex = cart.items.findIndex(
      item =>
        item.productId.toString() === productId.toString() &&
        item.color === color &&
        item.size === size
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found in cart' });
    }

    if (action === 'increment') {
      cart.items[itemIndex].quantity += 1;
    } else if (action === 'decrement') {
      cart.items[itemIndex].quantity -= 1;

      if (cart.items[itemIndex].quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      }
    }
    await cart.save();

    res.status(200).json({ success: true, message: 'Product quantity updated successfully', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update product quantity' });
  }
};


// Remove Product from Cart
exports.removeProductFromCart = async (req, res) => {
  const { userId, productId, color, size } = req.body;

  if (!userId || !productId || !color || !size) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Find the user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Find the product in the cart
    const itemIndex = cart.items.findIndex(
      item =>
        item.productId.toString() === productId.toString() &&
        item.color === color &&
        item.size === size
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found in cart' });
    }

    // Remove the product from the cart
    cart.items.splice(itemIndex, 1);

    // Save the updated cart
    await cart.save();

    res.status(200).json({ success: true, message: 'Product removed from cart successfully', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to remove product from cart' });
  }
};

// delete cart
exports.deleteCart = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  try {
    const cart = await Cart.findOneAndDelete({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    res.status(200).json({ success: true, message: "Cart deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete cart" });
  }
};



module.exports

