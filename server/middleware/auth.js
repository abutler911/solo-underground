// server/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Determine if we're in production
const isProduction = process.env.NODE_ENV === "production";

// Site access middleware
const siteAuth = (req, res, next) => {
  // Only log in development mode
  if (!isProduction) {
    console.log(`[SITE-AUTH] ${req.method} ${req.path}`);
  }

  try {
    // Get token from header
    const authHeader = req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET || "fallback_secret_key";
    const decoded = jwt.verify(token, jwtSecret);

    // For site access, we just need to verify the token is valid
    req.tokenData = decoded;

    next();
  } catch (err) {
    console.error("Site auth error:", err.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Admin access middleware
const adminAuth = async (req, res, next) => {
  // Only log in development mode
  if (!isProduction) {
    console.log(`[ADMIN-AUTH] ${req.method} ${req.path}`);
  }

  try {
    // Get token from header
    const authHeader = req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify token
    try {
      const jwtSecret = process.env.JWT_SECRET || "fallback_secret_key";
      const decoded = jwt.verify(token, jwtSecret);

      // Check for userId in token payload
      if (!decoded.userId) {
        return res.status(401).json({ message: "Not authorized as admin" });
      }

      // Find user
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (!user.isAdmin) {
        return res.status(401).json({ message: "Not authorized as admin" });
      }

      // Set user in request object
      req.user = user;

      if (!isProduction) {
        console.log(`[ADMIN-AUTH] Success: ${user.username}`);
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } catch (err) {
    console.error("Admin auth error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  siteAuth,
  adminAuth,
};
