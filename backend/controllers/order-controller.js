const Order = require("../models/Order");
const { extractUserId } = require("../helpers/auth-middleware");
const moment = require("moment-timezone");

const handleErrors = (res, error) => {
  return res.status(500).json(error);
};

const addOrder = async (req, res) => {
  const {
    productId,
    unitAmount,
    quantity,
    subAmount,
    sellerId,
    address,
    deliveryAddress,
    status,
    paymentStatus,
  } = req.body;

  if (status && !["pending", "delivered"].includes(status)) {
    return res.status(400).json({
      message: "Status must be either 'pending' or 'delivered'",
    });
  }

  if (paymentStatus && !["pending", "completed"].includes(paymentStatus)) {
    return res.status(400).json({
      message: "Payment Status must be either 'pending' or 'completed'",
    });
  }

  const now = moment().tz("Asia/Colombo");
  const orderDate = now.format("YYYY-MM-DD");
  const orderTime = now.format("HH:mm:ss");

  const userId = extractUserId(req);

  try {
    const missingFields = [];
    if (!productId) missingFields.push("Product Id");
    if (!unitAmount) missingFields.push("Unit Amount");
    if (!quantity) missingFields.push("Quantity");
    if (!subAmount) missingFields.push("Sub Amount");
    if (!sellerId) missingFields.push("Seller Id");
    if (!address) missingFields.push("Address");
    if (!status) missingFields.push("Status");
    if (!paymentStatus) missingFields.push("Payment Status");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields}`,
      });
    }

    const newOrder = new Order({
      productId,
      unitAmount,
      quantity,
      subAmount,
      sellerId,
      address,
      deliveryAddress,
      status,
      paymentStatus,
      orderDate,
      orderTime,
      userId,
    });

    await newOrder.save();
    res.status(201).json({
      message: "Order addded successfully!",
    });
  } catch (error) {
    res.status(400).json({
      message: "Adding order failed",
      error: error.message,
    });
  }
};

const getOrderByBuyerId = async (req, res) => {
  const buyerId = extractUserId(req);

  try {
    const order = await Order.find({ userId: buyerId })
      .populate("userId", "name")
      .populate("sellerId", "name")
      .populate("productId", "title")
      .select("-createdAt -updatedAt -__v");
    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    return res.status(200).json(order);
  } catch (error) {
    return handleErrors(res, error, "Fetching order details failed!");
  }
};

const getOrderBySellerId = async (req, res) => {
  const sellerId = req.params.sellerId;

  try {
    const order = await Order.find({ sellerId: sellerId })
      .populate("userId", "name")
      .populate("sellerId", "name")
      .populate("productId", "title")
      .select("-createdAt -updatedAt -__v");
    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    return res.status(200).json(order);
  } catch (error) {
    return handleErrors(res, error, "Fetching order details failed!");
  }
};

const updateOrderStatus = async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  if (!status || !["delivered"].includes(status)) {
    return res.status(400).json({
      message: "Invalid status update. Only 'delivered' is allowed.",
    });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        message:
          "Order status can only be updated from 'pending' to 'delivered'.",
      });
    }

    order.status = "delivered";
    await order.save();

    return res
      .status(200)
      .json({ message: "Order status updated to 'delivered' successfully!" });
  } catch (error) {
    return handleErrors(res, error);
  }
};

const updateOrder = async (req, res) => {
  const orderId = req.params.orderId;
  const { address, deliveryAddress, quantity, subAmount } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        message: "Order can only be updated when status is 'pending'.",
      });
    }

    if (address) order.address = address;
    if (deliveryAddress) order.deliveryAddress = deliveryAddress;
    if (quantity && Number.isInteger(quantity) && quantity > 0) {
      order.quantity = quantity;
    }
    if (subAmount && typeof subAmount === "number" && subAmount > 0) {
      order.subAmount = subAmount;
    }

    await order.save();
    return res
      .status(200)
      .json({ message: "Order updated successfully!", order });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Updating order failed", error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  const orderId = req.params.id;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        message: "Order can only be deleted when status is 'pending'.",
      });
    }

    await Order.findByIdAndDelete(orderId);
    return res.status(200).json({ message: "Order deleted successfully!" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Deleting order failed", error: error.message });
  }
};

module.exports = {
  addOrder,
  getOrderByBuyerId,
  getOrderBySellerId,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
};
