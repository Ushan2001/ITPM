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
  deleteProfileById,
  changePassword,
  getActiveSellers,
} = require("../controllers/user-controller");
const {
  uploadProfilePicture,
} = require("../helpers/user-image-upload-middleware");
const { verifyToken } = require("../helpers/auth-middleware");

router.post("/signup", uploadProfilePicture, signUp);
router.post("/signin", signIn);
router.get("/", verifyToken, getUserById);
router.put("/", verifyToken, uploadProfilePicture, updateProfile);
router.put("/activate/:id", verifyToken, updateStatus);
router.delete("/", verifyToken, deleteProfile);
router.delete("/:id", verifyToken, deleteProfileById);
router.get("/active", verifyToken, getActiveUsers);
router.get("/inactive", verifyToken, getInactiveUsers);
router.put("/change-password", verifyToken, changePassword);
router.get("/active-sellers", verifyToken, getActiveSellers);

module.exports = router;
