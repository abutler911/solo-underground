const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    original: { type: String }, // ✅ Add this
    content: { type: String, required: true },
    summary: { type: String },
    author: { type: String, default: "Admin" },
    category: { type: String },
    coverImage: { type: String },
    photoCredit: { type: String },

    quotes: [
      {
        text: { type: String, required: true },
        attribution: { type: String },
        position: {
          type: String,
          enum: ["left", "right", "center"],
          default: "right",
        },
      },
    ],
    tags: [{ type: String }],
    citations: [
      {
        title: { type: String },
        url: { type: String },
      },
    ],
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
    status: {
      type: String,
      enum: ["draft", "published", "needs-rewrite"],
      default: "draft",
    },
    topic: { type: String },
    sourceUrl: { type: String },
    reporter: { type: String },
    voiceId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", ArticleSchema);
