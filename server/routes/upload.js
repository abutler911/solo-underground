// server/routes/upload.js
const express = require("express");
const router = express.Router();
const { upload } = require("../config/cloudinary");
const { adminAuth } = require("../middleware/auth");

// Upload image route (protected by admin auth)
router.post("/image", adminAuth, upload.single("image"), (req, res) => {
  try {
    // Debug logs
    console.log("Upload route entered successfully");
    console.log("Request file:", req.file ? "Present" : "Missing");

    // req.file contains the uploaded file information
    if (!req.file) {
      console.log("No file detected in upload request");
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("File uploaded successfully to Cloudinary");
    console.log("File details:", {
      path: req.file.path,
      filename: req.file.filename,
      size: req.file.size,
    });

    // Return the image URL and other details
    res.json({
      success: true,
      url: req.file.path, // Cloudinary secure URL
      publicId: req.file.filename,
      message: "Image uploaded successfully",
    });
  } catch (err) {
    console.error("Image upload error details:", err.message);
    console.error("Full error stack:", err.stack);
    res.status(500).json({ message: "Failed to upload image: " + err.message });
  }
});

module.exports = router;
