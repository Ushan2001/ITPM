const express = require("express");
const router = express.Router();
const {
  signUp,
  signIn,
  getUserById,
} = require("../controllers/user-controller");
const {
  uploadProfilePicture,
} = require("../helpers/user-image-upload-middleware");
const { verifyToken } = require("../helpers/auth-middleware");

router.post("/signup", uploadProfilePicture, signUp);
router.post("/signin", signIn);
router.get("/", verifyToken, getUserById);

module.exports = router;
