const Order = require('../../../Models/User/OrderModel')
const Checkout = require('../../../Models/User/CheckoutModel');

// place order
exports.placeOrder = async (req, res) => {
    const { checkoutId, addressId, deliveryCharge, paymentMethod } = req.body;
    const userId = req.user.id;

    try {
        // Validate required fields
        if (!checkoutId || !addressId || !userId || !paymentMethod) {
            return res.status(400).json({ message: "Missing required fields: checkoutId, addressId, paymentMethod, or user authentication" });
        }

        // Check if checkout exists and is not already processed
        const checkout = await Checkout.findById(checkoutId);
        if (!checkout) {
            return res.status(404).json({ message: "Checkout not found" });
        }
        if (checkout.isProcessed) {
            return res.status(400).json({ message: "Checkout has already been processed" });
        }

        // Create new order
        const newOrder = new Order({
            userId,
            addressId,
            checkoutId,
            deliveryCharge,
            paymentMethod
        });

        // Save order properly
        await newOrder.save();

        return res.status(201).json(newOrder);
    } catch (error) {
        // console.error("Order placement error:", error);

        // Ensure only one response is sent
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// get userorders
exports.getUserOrder = async (req, res) => {
    const userId = req.user._id
    try {
        const userOrder = await Order.find(userId).sort({ createdAt: -1 })
        res.status(200).json({ success: true, userOrder });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update cart',
        });
    }
}


// by orderid
exports.getSingleOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }
        res.status(200).json({
           success: true,
            order,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch order',
        });
    }
};
