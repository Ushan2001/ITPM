const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Joi = require("joi");

const validateSignup = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .required()
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]+$"
        )
      )
      .messages({
        "string.pattern.base":
          "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.",
      }),
    phoneNo: Joi.string().optional(),
    profilePic: Joi.string().optional(),
    address: Joi.string().optional(),
    storeName: Joi.string().optional(),
    location: Joi.string().optional(),
    type: Joi.string().valid("admin", "seller", "buyer").optional(),
    status: Joi.string().valid("active", "inactive").optional(),
  });
  return schema.validate(data);
};

const isStrongPassword = (password) => {
  const minLength = 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength && hasLetter && hasNumber && hasSpecialChar
  );
};

const hashPassword = (password) => {
  return bcrypt.hashSync(password);
};

const verifyPassword = (plainPassword, hashedPassword) => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
};

const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, {
    expiresIn: "5h",
  });
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(403)
      .json({ message: "Authorization header is missing!" });
  }

  const [bearer, tokenWithPrefix] = authHeader.split(" ");

  if (bearer !== "Bearer" || !tokenWithPrefix) {
    return res
      .status(403)
      .json({ message: "Invalid authorization header format!" });
  }

  const token = tokenWithPrefix.substring(tokenWithPrefix.indexOf("=") + 1);

  if (!token) {
    return res.status(403).json({ message: "Token is required!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token!" });
    }
    req.userData = decoded;
    next();
  });
};

const extractUserId = (req) => {
  if (req.userData && req.userData.userId) {
    return req.userData.userId;
  }
  return null;
};

module.exports = {
  validateSignup,
  isStrongPassword,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  extractUserId,
};
