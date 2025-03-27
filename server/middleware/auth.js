// server/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Site access middleware
const siteAuth = (req, res, next) => {
  console.log("\n----- SITE AUTH MIDDLEWARE START -----");
  console.log("Request path:", req.path);
  console.log("Request method:", req.method);

  try {
    // Get token from header
    const authHeader = req.header("Authorization");
    console.log(
      "Authorization header:",
      authHeader ? `${authHeader.substring(0, 15)}...` : "Missing"
    );

    const token = authHeader?.replace("Bearer ", "");
    console.log(
      "Token extracted:",
      token ? `${token.substring(0, 10)}...` : "No token"
    );

    if (!token) {
      console.log("No token provided - rejecting request");
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Log JWT secret (first few chars only for security)
    const jwtSecret = process.env.JWT_SECRET;
    console.log("JWT_SECRET exists:", !!jwtSecret);
    console.log(
      "JWT_SECRET first chars:",
      jwtSecret ? jwtSecret.substring(0, 3) + "..." : "MISSING"
    );

    // Verify token
    console.log("Attempting to verify token...");
    const decoded = jwt.verify(token, jwtSecret || "fallback_secret_key");
    console.log("Token verified successfully!");
    console.log("Token payload:", JSON.stringify(decoded));

    // For site access, we just need to verify the token is valid
    // We don't need to check any user in the database
    req.tokenData = decoded;
    console.log("----- SITE AUTH MIDDLEWARE END (SUCCESS) -----\n");
    next();
  } catch (err) {
    console.error("Site auth verification error:", err.name, err.message);
    console.error(err.stack);
    console.log("----- SITE AUTH MIDDLEWARE END (FAILED) -----\n");
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Admin access middleware
const adminAuth = async (req, res, next) => {
  console.log("\n----- ADMIN AUTH MIDDLEWARE START -----");
  console.log("Request path:", req.path);
  console.log("Request method:", req.method);
  console.log("Request headers:", JSON.stringify(req.headers, null, 2));

  try {
    // Get token from header
    const authHeader = req.header("Authorization");
    console.log(
      "Authorization header:",
      authHeader ? `${authHeader.substring(0, 20)}...` : "Missing"
    );

    const token = authHeader?.replace("Bearer ", "");
    console.log(
      "Token extracted:",
      token ? `${token.substring(0, 10)}...` : "No token"
    );

    if (!token) {
      console.log("No token provided in request - rejecting");
      return res.status(401).json({ message: "Authentication required" });
    }

    // Log JWT secret (first few chars only for security)
    const jwtSecret = process.env.JWT_SECRET;
    console.log("JWT_SECRET exists:", !!jwtSecret);
    console.log(
      "JWT_SECRET first chars:",
      jwtSecret ? jwtSecret.substring(0, 3) + "..." : "MISSING"
    );

    // Verify token
    try {
      console.log("Attempting to verify token with jwt.verify...");
      const decoded = jwt.verify(token, jwtSecret || "fallback_secret_key");
      console.log("Token verification successful!");
      console.log("Decoded token payload:", JSON.stringify(decoded));

      // Check for userId in token payload
      if (!decoded.userId) {
        console.log("Token is valid but has no userId - rejecting");
        return res.status(401).json({ message: "Not authorized as admin" });
      }

      console.log("UserId from token:", decoded.userId);

      // Find user
      console.log("Looking up user in database...");
      const user = await User.findById(decoded.userId);
      console.log(
        "User lookup result:",
        user ? "User found" : "User NOT found"
      );

      if (!user) {
        console.log("User not found with ID from token - rejecting");
        return res.status(401).json({ message: "User not found" });
      }

      console.log("User details:", {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      });

      if (!user.isAdmin) {
        console.log("User found but not admin - rejecting");
        return res.status(401).json({ message: "Not authorized as admin" });
      }

      console.log("Admin auth successful for user:", user.username);
      req.user = user;
      console.log("----- ADMIN AUTH MIDDLEWARE END (SUCCESS) -----\n");
      next();
    } catch (err) {
      console.log("Token verification failed:", err.name, err.message);
      console.log("Error details:", err);
      console.log(
        "----- ADMIN AUTH MIDDLEWARE END (TOKEN VERIFICATION FAILED) -----\n"
      );
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } catch (err) {
    console.error("Admin auth general error:", err.name, err.message);
    console.error(err.stack);
    console.log("----- ADMIN AUTH MIDDLEWARE END (GENERAL ERROR) -----\n");
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  siteAuth,
  adminAuth,
};
