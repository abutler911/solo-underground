// server/models/Article.js
const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
  },
  author: {
    type: String,
    default: "Admin",
  },
  category: {
    type: String,
  },
  coverImage: {
    type: String,
  },
  photoCredit: {
    type: String,
  },
  // New field for featured quotes
  quotes: [
    {
      text: {
        type: String,
        required: true,
      },
      attribution: {
        type: String,
      },
      position: {
        type: String,
        enum: ["left", "right", "center"],
        default: "right",
      },
    },
  ],
  tags: [
    {
      type: String,
    },
  ],
  citations: [
    {
      title: {
        type: String,
      },
      url: {
        type: String,
      },
    },
  ],
  published: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Article", ArticleSchema);
