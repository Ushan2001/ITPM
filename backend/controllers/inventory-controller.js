const Inventory = require("../models/Inventory");
const User = require("../models/User");
const { extractUserId } = require("../helpers/auth-middleware");
const moment = require("moment-timezone");
const { param } = require("../routes/inventory-route");

const handleErrors = (res, error) => {
  return res.status(500).json(error);
};

const generateSKU = () => {
  return `INV${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
};

const addProduct = async (req, res) => {
  const {
    title,
    description,
    price,
    categoryType,
    quantity,
    status,
    supplierId,
  } = req.body;

  if (status && !["active", "inactive"].includes(status)) {
    return res.status(400).json({
      message: "Status must be either 'active' or 'inactive'",
    });
  }

  const now = moment().tz("Asia/Colombo");
  const publishDate = now.format("YYYY-MM-DD");
  const publishTime = now.format("HH:mm:ss");

  const addedBy = extractUserId(req);
  const productPic = req.file ? `${req.file.filename}` : null;
  const sku = generateSKU();

  try {
    const missingFields = [];
    if (!title) missingFields.push("title");
    if (!description) missingFields.push("description");
    if (!price) missingFields.push("price");
    if (!categoryType) missingFields.push("categoryType");
    if (!quantity) missingFields.push("quantity");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields}`,
      });
    }

    const newProduct = new Inventory({
      title,
      description,
      price,
      categoryType,
      quantity,
      sku,
      status,
      addedBy,
      publishDate,
      publishTime,
      productPic,
      supplierId,
    });

    await newProduct.save();
    res.status(201).json({
      message: "Product added successfully!",
    });
  } catch (error) {
    res.status(400).json({
      message: "Adding Product failed",
      error: error.message,
    });
  }
};

const getAllProduct = async (req, res) => {
  try {
    const products = await Inventory.find()
      .populate("addedBy", "name")
      .select("-createdAt -updatedAt -__v");

    res.status(200).json(products);
  } catch (error) {
    es.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
};

const getProductBySellerId = async (req, res) => {
  const sellerId = extractUserId(req);

  try {
    const products = await Inventory.find({ addedBy: sellerId })
      .populate("addedBy", "name")
      .select("-createdAt -updatedAt -__v");
    if (!products) {
      return res.status(404).json({ message: "Product not found!" });
    }

    return res.status(200).json(products);
  } catch (error) {
    return handleErrors(res, error, "Fetching product details failed!");
  }
};

const getProductBySellerIdInBuyer = async (req, res) => {
  const { sellerId } = req.params;

  try {
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found!" });
    }

    const products = await Inventory.find({ addedBy: sellerId })
      .populate("addedBy", "name")
      .select("-createdAt -updatedAt -__v");

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this seller!" });
    }

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      message: "Fetching product details failed!",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Inventory.findById(productId)
      .populate("addedBy", "title")
      .select("-createdAt -updatedAt -__v");
    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }

    return res.status(200).json(product);
  } catch (error) {
    return handleErrors(res, error, "Fetching product details failed!");
  }
};

const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const existingProduct = await Inventory.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found!" });
    }

    await Inventory.findByIdAndDelete(productId);

    res.status(200).json({
      message: "Product  deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Deleting Product failed",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const { title, description, price, categoryType, quantity, status } =
    req.body;

  try {
    const existingProduct = await Inventory.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found!" });
    }

    if (status && !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either 'active' or 'inactive'",
      });
    }

    const productPic = req.file
      ? req.file.filename
      : existingProduct.productPic;

    const updatedFields = {
      title,
      description,
      price,
      categoryType,
      quantity,
      status,
      productPic,
    };
    Object.keys(updatedFields).forEach((key) => {
      if (updatedFields[key] === undefined) delete updatedFields[key];
    });

    const updatedProduct = await Inventory.findByIdAndUpdate(
      productId,
      updatedFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Product updated successfully!",
      updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Updating product failed",
      error: error.message,
    });
  }
};

module.exports = {
  addProduct,
  getAllProduct,
  getProductBySellerId,
  getProductById,
  deleteProduct,
  updateProduct,
  getProductBySellerIdInBuyer,
};
