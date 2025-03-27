// server/routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { siteAuth } = require("../middleware/auth");
require("dotenv").config();

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
    const token = jwt.sign({ type: "site_access" }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

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

module.exports = router;
