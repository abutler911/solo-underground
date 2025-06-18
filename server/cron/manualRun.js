require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const { runJob } = require("./fetchAndRewriteNews");

const MONGO_URI = process.env.MONGO_URI;

(async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");

    console.log("🛠️ Manually triggering runJob()...");
    await runJob();
    console.log("✅ Job completed manually.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error running job manually:", err.message);
    process.exit(1);
  }
})();
