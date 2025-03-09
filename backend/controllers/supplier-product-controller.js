const Supplier = require("../models/Supplier");
const SupplierProduct = require("../models/SupplierProduct");
const { extractUserId } = require("../helpers/auth-middleware");
const moment = require("moment-timezone");

const generateSKU = () => {
  return `SUP${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
};

const addSupplierProduct = async (req, res) => {
  try {
    const { name, price, quantity, supplierId, status } = req.body;

    if (status && !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either 'active' or 'inactive'",
      });
    }

    const now = moment().tz("Asia/Colombo");
    const publishDate = now.format("YYYY-MM-DD");
    const publishTime = now.format("HH:mm:ss");

    const addedBy = extractUserId(req);
    const sku = generateSKU();

    const missingFields = [];
    if (!name) missingFields.push("Name");
    if (!price) missingFields.push("Price");
    if (!quantity) missingFields.push("Quantity");
    if (!supplierId) missingFields.push("supplier ID");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields}`,
      });
    }

    const supplierExists = await Supplier.findById(supplierId);
    if (!supplierExists) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const newSupplierProduct = new SupplierProduct({
      name,
      price,
      quantity,
      supplierId,
      status,
      publishDate,
      publishTime,
      addedBy,
      sku,
    });

    const savedSupplierProduct = await newSupplierProduct.save();
    const userId = req.params.userId || supplierId;
    const updatedSupplierProduct = await Supplier.findByIdAndUpdate(
      userId,
      {
        $push: { products: savedSupplierProduct._id },
      },
      { new: true }
    );

    if (!updatedSupplierProduct) {
      await SupplierProduct.findByIdAndDelete(savedSupplierProduct._id);
      return res.status(404).json({
        message: `Supplier not found`,
      });
    }

    res.status(201).json({
      message: "Supplier's product added successfully",
      product: savedSupplierProduct,
      supplier: updatedSupplierProduct,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error adding supplier's product",
      error: error.message,
    });
  }
};

const getSupplierProductBySupplierId = async (req, res) => {
  const supplierId = req.params.supplierId;

  try {
    const existingSupplier = await Supplier.findById(supplierId);
    if (!existingSupplier) {
      return res.status(404).json({ message: "Supplier not found!" });
    }

    const supplierProducts = await SupplierProduct.find({ supplierId })
      .populate("addedBy", "name")
      .select("-createdAt -updatedAt -__v -supplierId");

    return res.status(200).json({
      message: "Supplier products fetched successfully",
      products: supplierProducts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Fetching supplier's product details failed!",
      error: error.message,
    });
  }
};

const updateSupplierProduct = async (req, res) => {
  const productId = req.params.id;
  const { name, price, quantity, status } = req.body;

  try {
    const existingProduct = await SupplierProduct.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Supplier product not found!" });
    }

    if (status && !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either 'active' or 'inactive'",
      });
    }

    const updatedProduct = await SupplierProduct.findByIdAndUpdate(
      productId,
      { $set: { name, price, quantity, status } },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Supplier product updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Updating supplier product failed",
      error: error.message,
    });
  }
};

const deleteSupplierProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const existingProduct = await SupplierProduct.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found!" });
    }

    await Supplier.findByIdAndUpdate(existingProduct.supplierId, {
      $pull: { products: productId },
    });

    await SupplierProduct.findByIdAndDelete(productId);

    res.status(200).json({ message: "Product deleted successfully!" });
  } catch (error) {
    res.status(500).json({
      message: "Deleting supplier product failed",
      error: error.message,
    });
  }
};

module.exports = {
  addSupplierProduct,
  getSupplierProductBySupplierId,
  updateSupplierProduct,
  deleteSupplierProduct
};
