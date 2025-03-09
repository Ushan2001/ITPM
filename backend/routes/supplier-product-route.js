const express = require("express");
const router = express.Router();
const {
  addSupplierProduct,
  getSupplierProductBySupplierId,
  updateSupplierProduct,
  deleteSupplierProduct,
} = require("../controllers/supplier-product-controller.js");
const { verifyToken } = require("../helpers/auth-middleware.js");

router.use(verifyToken);

router.post("/:userId", addSupplierProduct);
router.get("/:supplierId", getSupplierProductBySupplierId);
router.put("/:id", updateSupplierProduct);
router.delete("/:id", deleteSupplierProduct);

module.exports = router;
