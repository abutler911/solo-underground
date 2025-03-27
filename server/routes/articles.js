const express = require("express");
const router = express.Router();
const Article = require("../models/Article");
const { adminAuth } = require("../middleware/auth");

// Get all published articles
router.get("/", async (req, res) => {
  try {
    const articles = await Article.find({ published: true }).sort({
      publishedAt: -1,
    });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single article
router.get("/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create article (protected)
router.post("/", adminAuth, async (req, res) => {
  const article = new Article({
    title: req.body.title,
    content: req.body.content,
    summary: req.body.summary,
    coverImage: req.body.coverImage,
    tags: req.body.tags,
  });

  try {
    const newArticle = await article.save();
    res.status(201).json(newArticle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update article (protected)
router.patch("/:id", adminAuth, async (req, res) => {
  try {
    req.body.updatedAt = Date.now();
    if (req.body.published && !req.body.publishedAt) {
      req.body.publishedAt = Date.now();
    }

    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(article);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete article (protected)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: "Article deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
