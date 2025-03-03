const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads/image/profile-pic");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(8, (err, buf) => {
      if (err) return cb(err);
      const uniqueFilename =
        buf.toString("hex") + path.extname(file.originalname);
      cb(null, uniqueFilename);
    });
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

const uploadProfilePicture = upload.single("profilePic");

module.exports = {
  uploadProfilePicture,
};
