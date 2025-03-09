const express = require("express");
const router = express.Router();
const {
  addSupplierProduct,
} = require("../controllers/supplier-product-controller.js");
const { verifyToken } = require("../helpers/auth-middleware.js");

router.use(verifyToken);

router.post("/:userId", addSupplierProduct);

module.exports = router;
