const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Inventory",
    },
    unitAmount: {
      type: Number,
      required: true,
    },
    subAmount: {
      type: Number,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    price: {
      type: Schema.Types.ObjectId,
      ref: "Inventory",
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    orderDate: {
      type: String,
      required: true,
    },
    orderTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "delivered"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["incomplete", "complete"],
      default: "incomplete",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
