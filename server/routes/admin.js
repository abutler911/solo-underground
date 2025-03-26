// server/routes/admin.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Article = require("../models/Article");
const auth = require("../middleware/auth");

// Admin login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all articles (for admin, including drafts)
router.get("/articles", auth, async (req, res) => {
  try {
    const articles = await Article.find().sort({ updatedAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single article by ID
router.get("/articles/:id", auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create article
router.post("/articles", auth, async (req, res) => {
  try {
    const article = new Article({
      ...req.body,
      publishedAt: req.body.published ? Date.now() : null,
    });
    const savedArticle = await article.save();
    res.status(201).json(savedArticle);
  } catch (err) {
    res.status(400).json({ message: "Error creating article" });
  }
});

// Update article
router.put("/articles/:id", auth, async (req, res) => {
  try {
    const updates = { ...req.body };

    // Set publishedAt if publishing for the first time
    if (updates.published && !updates.publishedAt) {
      updates.publishedAt = Date.now();
    }

    updates.updatedAt = Date.now();

    const article = await Article.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!article) return res.status(404).json({ message: "Article not found" });

    res.json(article);
  } catch (err) {
    res.status(400).json({ message: "Error updating article" });
  }
});

// Delete article
router.delete("/articles/:id", auth, async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) return res.status(404).json({ message: "Article not found" });

    res.json({ message: "Article deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting article" });
  }
});

module.exports = router;
