const Supplier = require("../models/Supplier");
const SupplierProduct = require("../models/SupplierProduct");
const { extractUserId } = require("../helpers/auth-middleware");
const moment = require("moment-timezone");
const { param } = require("../routes/supplier-route");

const handleErrors = (res, error) => {
  return res.status(500).json(error);
};

const addSupplier = async (req, res) => {
  const { name, email, phoneNo, address, status } = req.body;

  if (status && !["active", "inactive"].includes(status)) {
    return res.status(400).json({
      message: "Status must be either 'active' or 'inactive'",
    });
  }

  const now = moment().tz("Asia/Colombo");
  const publishDate = now.format("YYYY-MM-DD");
  const publishTime = now.format("HH:mm:ss");

  const addedBy = extractUserId(req);

  try {
    const missingFields = [];
    if (!name) missingFields.push("Name");
    if (!email) missingFields.push("Email");
    if (!phoneNo) missingFields.push("Phone No");
    if (!address) missingFields.push("Address");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields}`,
      });
    }

    const newSupplier = new Supplier({
      name,
      email,
      phoneNo,
      address,
      status,
      addedBy,
      publishDate,
      publishTime,
    });

    await newSupplier.save();
    res.status(201).json({
      message: "Supplier addded successfully!",
    });
  } catch (error) {
    res.status(400).json({
      message: "Adding supplier failed",
      error: error.message,
    });
  }
};

const getAllSupplier = async (req, res) => {
  try {
    const suppliers = await Supplier.find()
      .populate("addedBy", "name")
      .populate({
        path: "products",
        select: "-supplierId -createdAt -updatedAt -__v",
        populate: { path: "addedBy", select: "name" },
      })
      .select("-createdAt -updatedAt -__v");

    res.status(200).json(suppliers.map((supplier) => supplier.toObject()));
  } catch (error) {
    es.status(500).json({
      message: "Error fetching suppliers",
      error: error.message,
    });
  }
};

const getSupplierById = async (req, res) => {
  const supplierId = req.params.id;

  try {
    const supplier = await Supplier.findById(supplierId)
      .populate("addedBy", "name")
      .populate({
        path: "products",
        select: "-supplierId -createdAt -updatedAt -__v",
        populate: { path: "addedBy", select: "name" },
      })
      .select("-createdAt -updatedAt -__v");
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found!" });
    }

    return res.status(200).json(supplier);
  } catch (error) {
    return handleErrors(res, error, "Fetching supplier details failed!");
  }
};

const updateSupplier = async (req, res) => {
  const supplierId = req.params.id;
  const { name, email, phoneNo, address, status } = req.body;

  try {
    const existingSupplier = await Supplier.findById(supplierId);
    if (!existingSupplier) {
      return res.status(404).json({ message: "Supplier not found!" });
    }

    if (status && !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either 'active' or 'inactive'",
      });
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      supplierId,
      { name, email, phoneNo, address, status },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Supplier updated successfully!",
      updatedSupplier,
    });
  } catch (error) {
    res.status(500).json({
      message: "Updating supplier failed",
      error: error.message,
    });
  }
};

const deleteSupplier = async (req, res) => {
  const supplierId = req.params.id;

  try {
    const existingSupplier = await Supplier.findById(supplierId);
    if (!existingSupplier) {
      return res.status(404).json({ message: "Supplier not found!" });
    }

    await SupplierProduct.deleteMany({ supplierId });

    await Supplier.findByIdAndDelete(supplierId);

    res.status(200).json({
      message: "Supplier and associated products deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Deleting supplier failed",
      error: error.message,
    });
  }
};

module.exports = {
  addSupplier,
  getAllSupplier,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};
