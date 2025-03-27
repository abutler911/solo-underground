// server/routes/upload.js
const express = require("express");
const router = express.Router();
const { upload } = require("../config/cloudinary");
const { adminAuth } = require("../middleware/auth");

// Upload image route (protected by admin auth)
router.post("/image", adminAuth, upload.single("image"), (req, res) => {
  try {
    // Log authentication info for debugging
    console.log("Admin auth middleware passed successfully");

    // req.file contains the uploaded file information
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Return the image URL and other details
    res.json({
      success: true,
      url: req.file.path, // Cloudinary secure URL
      publicId: req.file.filename,
      message: "Image uploaded successfully",
    });
  } catch (err) {
    console.error("Image upload error:", err);
    res.status(500).json({ message: "Failed to upload image" });
  }
});

module.exports = router;
