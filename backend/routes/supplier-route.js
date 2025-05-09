const express = require("express");
const router = express.Router();
const {
  addSupplier,
  getAllSupplier,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getSupplierBySellerId,
} = require("../controllers/supplier-controller");
const { verifyToken } = require("../helpers/auth-middleware.js");

router.use(verifyToken);

router.post("/", addSupplier);
router.get("/", getAllSupplier);
router.get("/seller-by-id", getSupplierBySellerId);
router.get("/:id", getSupplierById);
router.put("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);

module.exports = router;
