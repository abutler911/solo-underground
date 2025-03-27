// server/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import routes
const articlesRoutes = require("./routes/articles");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000", // For local development
      "https://solo-underground.netlify.app", // Your Netlify domain
      "https://solounderground.com", // Your custom domain
      "https://www.solounderground.com", // www subdomain
    ],
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    credentials: true, // Allow cookies/auth headers
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/solounderground",
    {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    }
  )
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} | Origin: ${req.headers.origin}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articlesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
