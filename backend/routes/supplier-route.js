const express = require("express");
const router = express.Router();
const { addSupplier } = require("../controllers/supplier-controller");
const { verifyToken } = require("../helpers/auth-middleware.js");

router.use(verifyToken);

router.post("/", addSupplier);

module.exports = router;
