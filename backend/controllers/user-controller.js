const User = require("../models/User");
const Inventory = require("../models/Inventory");
const {
  validateSignup,
  hashPassword,
  verifyPassword,
  generateToken,
  extractUserId,
} = require("../helpers/auth-middleware");

const handleErrors = (res, error) => {
  return res.status(500).json(error);
};

const signUp = async (req, res) => {
  const { name, email, password, phoneNo, address, storeName, type, status } =
    req.body;

  const { error } = validateSignup(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const profilePic = req.file ? `${req.file.filename}` : null;
    const location = req.body.location ? JSON.parse(req.body.location) : null;

    const hashedPassword = hashPassword(password);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phoneNo,
      profilePic,
      address,
      storeName,
      type,
      location: location
        ? {
            name: location.name,
            longitude: location.longitude,
            latitude: location.latitude,
          }
        : null,
      status,
    });

    await user.save();
    return res
      .status(201)
      .json({ message: "User registered successfully!", email });
  } catch (error) {
    return handleErrors(res, error);
  }
};

const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    const isPasswordCorrect = verifyPassword(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect password!" });
    }

    const userData = {
      _id: existingUser._id,
      email: existingUser.email,
      type: existingUser.type,
      status: existingUser.status,
    };

    const token = generateToken(
      existingUser.id,
      existingUser.email,
      existingUser.type
    );

    return res.status(200).json({
      message: "User logged successfully!",
      userData,
      token,
    });
  } catch (error) {
    return handleErrors(res, error);
  }
};

const getUserById = async (req, res) => {
  const userId = extractUserId(req);

  try {
    const user = await User.findById(userId).select(
      "-password -createdAt -updatedAt -__v"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return handleErrors(res, error, "Fetching user details failed!");
  }
};

const updateProfile = async (req, res) => {
  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized!" });
  }

  try {
    const updates = req.body;
    if (updates.password) {
      updates.password = hashPassword(updates.password);
    }
    if (req.file) {
      updates.profilePic = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      select: "-password -createdAt -updatedAt -__v",
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    return res.status(200).json({
      message: "Profile updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    return handleErrors(res, error);
  }
};

const deleteProfile = async (req, res) => {
  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized!" });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    return res.status(200).json({ message: "Profile deleted successfully!" });
  } catch (error) {
    return handleErrors(res, error);
  }
};

const deleteProfileById = async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required!" });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    return res.status(200).json({ message: "Profile deleted successfully!" });
  } catch (error) {
    return handleErrors(res, error);
  }
};

const updateStatus = async (req, res) => {
  const userId = req.params.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized!" });
  }

  const { status } = req.body;
  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value!" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true, select: "-password -createdAt -updatedAt -__v" }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    return res.status(200).json({
      message: "Status updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    return handleErrors(res, error);
  }
};

const getActiveUsers = async (req, res) => {
  try {
    const activeUsers = await User.find({ status: "active" }).select(
      "-password -createdAt -updatedAt -__v"
    );

    return res.status(200).json({ users: activeUsers });
  } catch (error) {
    return handleErrors(res, error);
  }
};

const getInactiveUsers = async (req, res) => {
  try {
    const inactiveUsers = await User.find({ status: "inactive" }).select(
      "-password -createdAt -updatedAt -__v"
    );

    return res.status(200).json({ users: inactiveUsers });
  } catch (error) {
    return handleErrors(res, error);
  }
};

const changePassword = async (req, res) => {
  const userId = extractUserId(req);
  const { oldPassword, newPassword } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required!" });
  }

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Both old and new passwords are required!" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const isPasswordCorrect = verifyPassword(oldPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect old password!" });
    }
    const hashedNewPassword = hashPassword(newPassword);
    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully!" });
  } catch (error) {
    return handleErrors(res, error);
  }
};

const getActiveSellers = async (req, res) => {
  try {
    const activeSellers = await User.find({
      type: "seller",
      status: "active",
    }).select("-password -createdAt -updatedAt -__v");

    const sellersWithProducts = await Promise.all(
      activeSellers.map(async (seller) => {
        const products = await Inventory.find({ addedBy: seller._id }).select(
          "-createdAt -updatedAt -__v"
        );
        return { ...seller.toObject(), products };
      })
    );

    return res.status(200).json({ sellers: sellersWithProducts });
  } catch (error) {
    return handleErrors(res, error);
  }
};

const getActiveBuyers = async (req, res) => {
  try {
    const activeBuyers = await User.find({
      type: "buyer",
      status: "active",
    }).select("-password -createdAt -updatedAt -__v");

    return res.status(200).json({ buyers: activeBuyers });
  } catch (error) {
    return handleErrors(res, error);
  }
};

module.exports = {
  signUp,
  signIn,
  getUserById,
  updateProfile,
  deleteProfile,
  deleteProfileById,
  updateStatus,
  getActiveUsers,
  getInactiveUsers,
  changePassword,
  getActiveSellers,
  getActiveBuyers,
};
