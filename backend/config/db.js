const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ Database Connected Successfully");
  } catch (err) {
    console.error("❌ Database Connection Error:", err.message);
    process.exit(1);
  }
};

const startServer = async (app, PORT) => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server Running on PORT ${PORT}`);
  });
};

module.exports = startServer;
