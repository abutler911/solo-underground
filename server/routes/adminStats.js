const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const PERFORMANCE_FILE = path.join(
  __dirname,
  "../cache/reporter-performance.json"
);

router.get("/", async (req, res) => {
  try {
    const raw = await fs.promises.readFile(PERFORMANCE_FILE, "utf8");
    const stats = JSON.parse(raw);

    res.json({
      updatedAt: new Date(),
      reporterStats: stats,
    });
  } catch (err) {
    console.error("[ADMIN STATS] Error:", err.message);
    res.status(500).json({ error: "Failed to load reporter stats" });
  }
});

module.exports = router;
