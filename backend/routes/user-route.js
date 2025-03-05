const express = require("express");
const router = express.Router();
const {
  signUp,
  signIn,
  getUserById,
  updateProfile,
  deleteProfile,
  updateStatus,
  getActiveUsers,
  getInactiveUsers,
} = require("../controllers/user-controller");
const {
  uploadProfilePicture,
} = require("../helpers/user-image-upload-middleware");
const { verifyToken } = require("../helpers/auth-middleware");

router.post("/signup", uploadProfilePicture, signUp);
router.post("/signin", signIn);
router.get("/", verifyToken, getUserById);
router.put("/", verifyToken, uploadProfilePicture, updateProfile);
router.put("/activate", verifyToken, updateStatus);
router.delete("/", verifyToken, deleteProfile);
router.get("/active", verifyToken, getActiveUsers);
router.get("/inactive", verifyToken, getInactiveUsers);

module.exports = router;
