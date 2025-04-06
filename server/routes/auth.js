// server/routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { siteAuth, adminAuth } = require("../middleware/auth");
require("dotenv").config();

// -------------------- SITE AUTH ROUTES --------------------

// Site-wide password verification
router.post("/site-access", (req, res) => {
  try {
    const { password } = req.body;

    // Get site password from environment variables
    const sitePassword = process.env.SITE_PASSWORD;

    if (!sitePassword) {
      console.error("SITE_PASSWORD environment variable is not set!");
    }

    if (password !== sitePassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Create token
    const token = jwt.sign(
      { type: "site_access" },
      process.env.JWT_SECRET || "fallback_secret_key",
      {
        expiresIn: "30d",
      }
    );

    res.json({
      success: true,
      token,
      message: "Access granted",
    });
  } catch (err) {
    console.error("Site access error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Verify site access token
router.get("/verify", siteAuth, (req, res) => {
  res.json({
    success: true,
    message: "Token is valid",
    tokenData: req.tokenData,
  });
});

// -------------------- ADMIN AUTH ROUTES --------------------

// Admin login route
router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Admin login attempt:", username);

    // Check if user exists
    const user = await User.findOne({ username });
    console.log("User found:", !!user);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "1d" }
    );

    console.log("Admin token created");
    res.json({ token });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Verify admin token
router.get("/admin/verify", adminAuth, (req, res) => {
  // If request gets here, the token is valid (adminAuth middleware validated it)
  res.json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      isAdmin: req.user.isAdmin,
    },
  });
});

module.exports = router;
