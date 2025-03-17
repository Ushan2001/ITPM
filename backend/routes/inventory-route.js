const express = require("express");
const router = express.Router();
const {
  addProduct,
  getAllProduct,
  getProductBySellerId,
  getProductById,
} = require("../controllers/inventory-controller");
const { verifyToken } = require("../helpers/auth-middleware.js");
const {
  uploadProductPicture,
} = require("../helpers/product-image-upload-middleware");

router.use(verifyToken);

router.post("/", uploadProductPicture, addProduct);
router.get("/", getAllProduct);
router.get("/seller-by", getProductBySellerId);
router.get("/:id", getProductById);

module.exports = router;
