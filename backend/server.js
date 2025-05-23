const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const startServer = require("./config/db");

process.env.TZ = "Asia/Colombo";

const userRoute = require("./routes/user-route");
const polygonRoute = require("./routes/polygon-route");
const availableLocationRoute = require("./routes/available-location-route");
const supplierRoute = require("./routes/supplier-route");
const supplierProductRoute = require("./routes/supplier-product-route");
const inventoryRoute = require("./routes/inventory-route");
const orderRoute = require("./routes/order-route");
const paymentRoute = require("./routes/payment-route");

const path = require("path");

const app = express();
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/polygon", polygonRoute);
app.use("/api/v1/available-location", availableLocationRoute);
app.use("/api/v1/supplier", supplierRoute);
app.use("/api/v1/supplier-product", supplierProductRoute);
app.use("/api/v1/inventory", inventoryRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);

app.use(
  "/api/v1/uploads/image/profile",
  express.static(path.join(__dirname, "./uploads/image/profile-pic"))
);

app.use(
  "/api/v1/uploads/image/product",
  express.static(path.join(__dirname, "./uploads/image/product-pic"))
);

const PORT = process.env.PORT || 5000;

startServer(app, PORT);
