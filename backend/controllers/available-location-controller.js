const AvailableLocation = require("../models/AvailableLocation");
const Seller = require("../models/User");
const Polygon = require("../models/Polygon");
const { extractUserId } = require("../helpers/auth-middleware");
const moment = require("moment-timezone");

const addAvailableLocation = async (req, res) => {
  try {
    const { userId, locations } = req.body;

    const missingFields = [];
    if (!userId) missingFields.push("User Id");
    if (!locations) missingFields.push("Locations");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields}`,
      });
    }

    const seller = await Seller.findById(userId);
    if (!seller) {
      return res.status(400).json({
        message: "Invalid seller ID",
      });
    }

    const parsedLocations =
      typeof locations === "string"
        ? JSON.parse(locations).map((item) => item.id)
        : locations;

    const existingPolygons = await Polygon.find({
      _id: { $in: parsedLocations },
    });

    if (existingPolygons.length !== parsedLocations.length) {
      const existingIds = existingPolygons.map((p) => p._id.toString());
      const invalidLocations = parsedLocations.filter(
        (id) => !existingIds.includes(id.toString())
      );

      return res.status(400).json({
        message: "Some locations do not exist in saved polygons",
        invalidLocations,
      });
    }

    const now = moment().tz("Asia/Colombo");
    const publishDate = now.format("YYYY-MM-DD");
    const publishTime = now.format("HH:mm:ss");

    const addedBy = extractUserId(req);

    await AvailableLocation.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          publishDate,
          publishTime,
          addedBy,
          locations: parsedLocations,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(201).json({
      message: "Available location added successfully!",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Adding available location failed",
      error: error.message,
    });
  }
};

const getAllAvailableLocations = async (req, res) => {
  try {
    const locations = await AvailableLocation.find()
      .populate("addedBy", "email")
      .populate("locations", "name")
      .select("-createdAt -updatedAt -__v");

    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching available locations",
      error: error.message,
    });
  }
};

const getSellerAvailableLocation = async (req, res) => {
  const sellerId = req.params.id;

  try {
    const availableLocations = await AvailableLocation.findOne({
      userId: sellerId,
    })
      .populate("locations", "name")
      .select("-addedBy -publishDate -publishTime -createdAt -updatedAt -__v");

    if (!availableLocations) {
      return res
        .status(404)
        .json({ message: "Available locations not found for this seller!" });
    }

    return res.status(200).json(availableLocations);
  } catch (error) {
    s;
    return res.status(500).json({
      message: "Fetching seller available locations failed!",
      error: error.message,
    });
  }
};

module.exports = {
  addAvailableLocation,
  getAllAvailableLocations,
  getSellerAvailableLocation,
};
