const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const inventorySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    productPic: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    categoryType: {
      type: String,
      required: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    quantity: {
      type: Number,
      required: true,
    },
    sku: {
      type: String,
      unique: true,
    },

    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
    },

    publishDate: {
      type: String,
      required: true,
    },
    publishTime: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
