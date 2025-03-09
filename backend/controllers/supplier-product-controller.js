const Supplier = require("../models/Supplier");
const SupplierProduct = require("../models/SupplierProduct");
const { extractUserId } = require("../helpers/auth-middleware");
const moment = require("moment-timezone");

const generateSKU = () => {
  return `SUP${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`; // Ensuring uniqueness
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

module.exports = { addSupplierProduct };
