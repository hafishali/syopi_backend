const Cart = require('../../../Models/User/cartModel');
const validateCoupon = require('../../../utils/validateCoupon'); 
const Product=require('../../../Models/Admin/productModel')


// create cart or add new product to cart
exports.createOrUpdateCart = async (req, res) => {
    const { userId, productId, quantity, color, size /*, couponId */ } = req.body;
  
    if (!userId || !productId || !quantity || !color || !size) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
  
    try {
      // Validate product existence
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
  
      let cart = await Cart.findOne({ userId });
  
      if (!cart) {
        // Create a new cart if not exists
        cart = new Cart({ userId, items: [] /*, coupon: couponId */ });
      }
  
      // Check if product already exists in the cart
      const productIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId.toString()
      );
  
      if (productIndex > -1) {
        // Product exists, update quantity
        cart.items[productIndex].quantity += quantity;
  
        if (cart.items[productIndex].quantity <= 0) {
          // Remove the product if quantity becomes 0 or negative
          cart.items.splice(productIndex, 1);
        }
      } else if (quantity > 0) {
        // Add a new product to the cart
        cart.items.push({ productId, quantity, color, size });
      } else {
        return res.status(400).json({ success: false, message: 'Quantity must be greater than zero' });
      }
  
      // Apply coupon logic if needed
      // if (couponId) {
      //   cart.coupon = couponId;
      // }
  
      // Save the cart (pre-save hook will handle price calculations and coupon validation)
      await cart.save();
  
      // Send updated cart response
      res.status(200).json({ success: true, cart });
    } catch (error) {
      console.error(error);
      res.status(500).json({success: false, 
        message: error.message || 'Failed to update cart'  });
    }
  };
  

// Get Cart for User
exports.getCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ userId }).populate('items.productId')
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, 
        message: error.message || 'Failed to get cart'  });
  }
};

// Remove Product from Cart
exports.removeProductFromCart = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Find and remove product from cart
    cart.items = cart.items.filter(item => item.productId.toString() !== productId.toString());

    // Save the updated cart
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to remove product' });
  }
};

module.exports

