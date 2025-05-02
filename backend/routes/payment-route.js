const express = require("express");
const {
  generateHash,
  paymentNotifications,
  updateOrderPaymentStatus,
} = require("../controllers/payment-controller");
const { verifyToken } = require("../helpers/auth-middleware");

const router = express.Router();

router.post("/generate-hash", generateHash);
router.post("/notify", paymentNotifications);
router.patch("/:orderId/payment-status", verifyToken, updateOrderPaymentStatus);

module.exports = router;
