// server/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Site access middleware
const siteAuth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    console.log("Authorization header present:", !!req.header("Authorization"));
    console.log(
      "Token received:",
      token ? token.substring(0, 10) + "..." : "No token"
    );

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // For site access, we just need to verify the token is valid
    // We don't need to check any user in the database
    req.tokenData = decoded;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Admin access middleware
const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");
    console.log("Auth header received:", authHeader ? "Present" : "Missing");

    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      console.log("No token provided in request");
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check for userId in token payload
      if (!decoded.userId) {
        console.log("Token is valid but not an admin token (no userId)");
        return res.status(401).json({ message: "Not authorized as admin" });
      }

      // Find user
      const user = await User.findById(decoded.userId);

      if (!user) {
        console.log("User not found with ID from token");
        return res.status(401).json({ message: "User not found" });
      }

      if (!user.isAdmin) {
        console.log("User found but not admin:", user.username);
        return res.status(401).json({ message: "Not authorized as admin" });
      }

      console.log("Admin auth successful for user:", user.username);
      req.user = user;
      next();
    } catch (err) {
      console.log("Token verification failed:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } catch (err) {
    console.error("Admin auth error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  siteAuth,
  adminAuth,
};
