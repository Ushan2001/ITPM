const Polygon = require("../models/Polygon");
const User = require("../models/User");
const AvailableLocation = require("../models/AvailableLocation");
const { extractUserId } = require("../helpers/auth-middleware");
const turf = require("@turf/turf");

const addPolygon = async (req, res) => {
  const { name, coordinates } = req.body;

  const addedBy = extractUserId(req);

  try {
    const missingFields = [];
    if (!name) missingFields.push("Name");
    if (!coordinates) missingFields.push("Coordinates");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields}`,
      });
    }

    const newPolygon = new Polygon({
      name,
      coordinates,
      addedBy,
    });

    await newPolygon.save();
    res.status(201).json({
      message: "Polygon added successfully!",
    });
  } catch (error) {
    res.status(400).json({
      message: "Adding polygon failed",
      error: error.message,
    });
  }
};

const getAllPolygons = async (req, res) => {
  try {
    const polygons = await Polygon.find()
      .populate("addedBy", "email")
      .select("-createdAt -updatedAt -__v");

    res.status(200).json(polygons.map((polygon) => polygon.toObject()));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching polygons", error: error.message });
  }
};

const getSellersNearBy = async (req, res) => {
  const buyerId = extractUserId(req);

  try {
    const buyer = await User.findById(buyerId);
    if (
      !buyer ||
      !buyer.location ||
      !buyer.location.longitude ||
      !buyer.location.latitude
    ) {
      return res.status(400).json({
        message: "Your location is not found, please update it.",
      });
    }

    const { longitude, latitude } = buyer.location;

    const polygons = await Polygon.find().select("name coordinates");

    const containingPolygons = polygons.filter((polygon) => {
      const coordinates = polygon.coordinates.map((coord) => [
        coord.lng,
        coord.lat,
      ]);

      if (
        coordinates.length > 0 &&
        (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
          coordinates[0][1] !== coordinates[coordinates.length - 1][1])
      ) {
        coordinates.push(coordinates[0]);
      }

      const turfPoint = turf.point([longitude, latitude]);
      const turfPolygon = turf.polygon([coordinates]);

      return turf.booleanPointInPolygon(turfPoint, turfPolygon);
    });

    if (containingPolygons.length === 0) {
      return res
        .status(404)
        .json({ message: "Location is not within any polygon." });
    }

    const polygonIds = containingPolygons.map((polygon) => polygon._id);

    const sellers = await AvailableLocation.aggregate([
      {
        $match: {
          locations: { $in: polygonIds },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "sellerDetails",
        },
      },
      {
        $unwind: "$sellerDetails",
      },
      {
        $match: {
          "sellerDetails.type": "seller",
          "sellerDetails.status": "active",
        },
      },
      {
        $project: {
          _id: "$sellerDetails._id",
          name: "$sellerDetails.name",
          profilePic: "$sellerDetails.profilePic",
          location: "$sellerDetails.location",
          address: "$sellerDetails.address",
          storeName: "$sellerDetails.storeName",
        },
      },
    ]);

    if (sellers.length === 0) {
      return res.status(404).json({ message: "No nearby sellers found." });
    }

    return res.status(200).json({ sellers });
  } catch (error) {
    return res.status(500).json({
      message: "Error finding nearby sellers!",
      error: error.message,
    });
  }
};

module.exports = {
  addPolygon,
  getAllPolygons,
  getSellersNearBy,
};
