const User = require("../models/User");
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
  const { name, email, password, phoneNo, address, type, status } = req.body;

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

module.exports = {
  signUp,
  signIn,
  getUserById,
};
