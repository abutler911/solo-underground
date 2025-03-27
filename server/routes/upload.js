// server/routes/upload.js
const express = require("express");
const router = express.Router();
const { upload } = require("../config/cloudinary");
const { adminAuth } = require("../middleware/auth");

// Upload image route (protected by admin auth)
// server/routes/upload.js
router.post("/image", adminAuth, (req, res) => {
  try {
    console.log("About to process upload...");

    // Use the upload middleware as a function instead
    upload.single("image")(req, res, function (err) {
      if (err) {
        console.error("Multer error:", err);
        return res
          .status(500)
          .json({ message: "File upload error: " + err.message });
      }

      if (!req.file) {
        console.log("No file in request");
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log("File uploaded successfully:", req.file);
      res.json({
        success: true,
        url: req.file.path,
        publicId: req.file.filename,
        message: "Image uploaded successfully",
      });
    });
  } catch (err) {
    console.error("Outer try-catch error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});
module.exports = router;
