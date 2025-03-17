const Inventory = require("../models/Inventory");
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
  const { title, description, price, categoryType, quantity, status,supplierId } =
    req.body;

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
      .populate("addedBy", "title")
      .populate({
        path: "products",
        select: "-productId -createdAt -updatedAt -__v",
        populate: { path: "addedBy", select: "title" },
      })
      .select("-createdAt -updatedAt -__v");

    res.status(200).json(products.map((product) => product.toObject()));
  } catch (error) {
    es.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
};

module.exports = {
  addProduct,
  getAllProduct,
};
