const express = require("express");
const router = express.Router();
const {
  addAvailableLocation,
  getAllAvailableLocations,
  getSellerAvailableLocation
} = require("../controllers/available-location-controller");
const { verifyToken } = require("../helpers/auth-middleware.js");

router.use(verifyToken);

router.post("/", addAvailableLocation);
router.get("/", getAllAvailableLocations);
router.get("/:id", getSellerAvailableLocation);

module.exports = router;
