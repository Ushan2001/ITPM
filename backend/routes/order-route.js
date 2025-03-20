const express = require("express");
const router = express.Router();
const {
  addOrder,
  getOrderByBuyerId,
  getOrderBySellerId,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
} = require("../controllers/order-controller.js");
const { verifyToken } = require("../helpers/auth-middleware.js");

router.use(verifyToken);

router.post("/", addOrder);
router.get("/buyer", getOrderByBuyerId);
router.get("/seller", getOrderBySellerId);
router.put("/:id", updateOrderStatus);
router.put("/update/:orderId", updateOrder);
router.delete("/:id", deleteOrder);

module.exports = router;
