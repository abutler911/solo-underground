// server/scripts/createAdmin.js
const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    try {
      const admin = new User({
        username: "admin",
        password: "IloveBeth2019!",
        isAdmin: true,
      });

      await admin.save();
      console.log("Admin user created successfully");
    } catch (err) {
      console.error("Error creating admin user", err);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch((err) => console.error("MongoDB connection error", err));
