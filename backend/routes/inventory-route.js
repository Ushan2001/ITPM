const express = require("express");
const router = express.Router();
const {
  addProduct,
  getAllProduct,
} = require("../controllers/inventory-controller");
const { verifyToken } = require("../helpers/auth-middleware.js");
const {
  uploadProductPicture,
} = require("../helpers/product-image-upload-middleware");

router.use(verifyToken);

router.post("/", uploadProductPicture, addProduct);
router.get("/", getAllProduct);

module.exports = router;
