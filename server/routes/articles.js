// server/routes/articles.js
const express = require("express");
const router = express.Router();
const { adminAuth, siteAuth } = require("../middleware/auth");
const articleController = require("../controllers/articleController");

// Public routes (require site authentication)
router.get("/", siteAuth, articleController.getPublishedArticles);
router.get("/:id", siteAuth, articleController.getArticleById);

// Admin routes
router.get("/admin/all", adminAuth, articleController.getAllArticles);
router.get("/admin/drafts", adminAuth, articleController.getDraftArticles);
router.get("/admin/:id", adminAuth, articleController.getArticleById);

router.post("/", adminAuth, articleController.createArticle);
router.put("/:id", adminAuth, articleController.updateArticle);
router.delete("/:id", adminAuth, articleController.deleteArticle);

router.put("/:id/publish", adminAuth, articleController.publishArticle);
router.put("/:id/needs-rewrite", adminAuth, articleController.markForRewrite);

module.exports = router;
