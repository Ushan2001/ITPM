const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
    },
    type: {
      type: String,
      enum: ["admin", "seller", "buyer"],
      default: "admin",
    },
    profilePic: {
      type: String,
    },
    address: {
      type: String,
    },
    storeName: {
      type: String,
    },
    location: {
      name: {
        type: String,
      },
      longitude: {
        type: Number,
      },
      latitude: {
        type: Number,
      },
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Inventory",
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
