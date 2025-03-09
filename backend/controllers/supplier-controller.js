const Supplier = require("../models/Supplier");
const { extractUserId } = require("../helpers/auth-middleware");
const moment = require("moment-timezone");

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

module.exports = {
  addSupplier,
};
