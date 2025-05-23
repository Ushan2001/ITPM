const md5 = require("md5");

const generateHash = async (req, res) => {
  const { merchant_id, order_id, amount, currency, merchant_secret } = req.body;

  if (!merchant_id || !order_id || !amount || !currency || !merchant_secret) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const formattedAmount = Number(amount).toFixed(2);

  const hash = md5(
    merchant_id +
      order_id +
      formattedAmount +
      currency +
      md5(merchant_secret).toUpperCase()
  ).toUpperCase();

  res.json({ hash });
};

const paymentNotifications = async (req, res) => {
  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
  } = req.body;

  const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET;

  if (
    !merchant_id ||
    !order_id ||
    !payhere_amount ||
    !payhere_currency ||
    !status_code ||
    !md5sig
  ) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const formattedAmount = Number(payhere_amount).toFixed(2);

  const calculatedMd5sig = md5(
    merchant_id +
      order_id +
      formattedAmount +
      payhere_currency +
      status_code +
      md5(merchant_secret).toUpperCase()
  ).toUpperCase();

  if (calculatedMd5sig === md5sig) {
    try {
      const Order = require("../models/Order");

      const order = await Order.findById(order_id);

      if (!order) {
        console.log(`Order not found: ${order_id}`);
        return res.status(404).json({ error: "Order not found" });
      }

      if (status_code === "2") {
        order.paymentStatus = "completed";
        await order.save();
        console.log(`Payment completed for order: ${order_id}`);
      }

      res.status(200).json({ success: "Payment notification received" });
    } catch (error) {
      console.error("Error processing payment notification:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    console.log("Payment verification failed. Invalid signature.");
    res.status(400).json({ error: "Invalid payment signature" });
  }
};

const updateOrderPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const Order = require("../models/Order");

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  generateHash,
  paymentNotifications,
  updateOrderPaymentStatus,
};
