// server/controllers/articleController.js
const Article = require("../models/Article");

// Get all published articles for public consumption
exports.getPublishedArticles = async (req, res) => {
  try {
    const articles = await Article.find({ published: true }).sort({
      publishedAt: -1,
    });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all articles (for admin, including drafts)
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ updatedAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get single article by ID
exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new article
exports.createArticle = async (req, res) => {
  try {
    const articleData = {
      ...req.body,
      publishedAt: req.body.published ? Date.now() : null,
    };

    const article = new Article(articleData);
    const savedArticle = await article.save();
    res.status(201).json(savedArticle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update article
exports.updateArticle = async (req, res) => {
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

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(article);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete article
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json({ message: "Article deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get draft articles for staging
exports.getDraftArticles = async (req, res) => {
  try {
    const drafts = await Article.find({ status: "draft" }).sort({
      createdAt: -1,
    });
    res.json(drafts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch drafts" });
  }
};

// Publish a draft article
exports.publishArticle = async (req, res) => {
  try {
    const updated = await Article.findByIdAndUpdate(
      req.params.id,
      {
        status: "published",
        published: true,
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error publishing article" });
  }
};

// Mark article as needs rewrite
exports.markForRewrite = async (req, res) => {
  try {
    const updated = await Article.findByIdAndUpdate(
      req.params.id,
      {
        status: "needs-rewrite",
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating article status" });
  }
};
