// server/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();
const { runJob } = require("./cron/fetchAndRewriteNews");
const adminStatsRoute = require("./routes/adminStats");

// Import routes
const articlesRoutes = require("./routes/articles");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://solo-underground.netlify.app",
      "https://solounderground.com",
      "https://www.solounderground.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// Use MongoDB for session storage instead of MemoryStore
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        process.env.MONGO_URI || "mongodb://localhost:27017/solounderground",
      ttl: 60 * 60 * 24, // 1 day in seconds
    }),
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day in milliseconds
    },
  })
);

// Configure request logging
const logRequest = (req, res, next) => {
  // Only log API requests (not static files)
  if (req.url.startsWith("/api/")) {
    // In production, log less info
    if (isProduction) {
      // Don't log health checks, auth checks, etc.
      if (!req.url.includes("/check") && !req.url.includes("/verify")) {
        console.log(`${req.method} ${req.url}`);
      }
    } else {
      // In development, log more details
      console.log(
        `${req.method} ${req.url} | Origin: ${req.headers.origin || "N/A"}`
      );
    }
  }
  next();
};

// Add request logging after other middleware
app.use(logRequest);

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

// Schedule jobs
const { scheduleJobs } = require("./cron/fetchAndRewriteNews");
scheduleJobs();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articlesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/stats", adminStatsRoute);

app.get("/api/test-cron", async (req, res) => {
  try {
    await runJob();
    res.send("Cron job ran successfully.");
  } catch (err) {
    console.error("[ERROR] Manual test-cron failed:", err.message);
    res.status(500).send("Cron job failed.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
