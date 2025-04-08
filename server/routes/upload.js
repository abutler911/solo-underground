// server/routes/upload.js
const express = require("express");
const router = express.Router();
const { upload } = require("../config/cloudinary");
const { adminAuth } = require("../middleware/auth");

// Determine if we're in production
const isProduction = process.env.NODE_ENV === "production";

// Upload image route (protected by admin auth)
router.post("/image", adminAuth, (req, res) => {
  try {
    if (!isProduction) {
      console.log("[UPLOAD] Processing image upload request");
    }

    // Use the upload middleware as a function
    upload.single("image")(req, res, function (err) {
      if (err) {
        console.error("[UPLOAD] Error:", err.message);
        return res
          .status(500)
          .json({ message: "File upload error: " + err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      if (!isProduction) {
        console.log("[UPLOAD] File uploaded successfully");
      }

      res.json({
        success: true,
        url: req.file.path,
        publicId: req.file.filename,
        message: "Image uploaded successfully",
      });
    });
  } catch (err) {
    console.error("[UPLOAD] Server error:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

module.exports = router;
