const express = require("express");
const router = express.Router();
const {
  addPolygon,
  getAllPolygons,
  getSellersNearBy,
} = require("../controllers/polygon-controller.js");
const { verifyToken } = require("../helpers/auth-middleware.js");

router.use(verifyToken);

router.post("/", addPolygon);
router.get("/", getAllPolygons);
router.get("/sellers-near-by", verifyToken, getSellersNearBy);

module.exports = router;
