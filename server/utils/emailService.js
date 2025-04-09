const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const sendArticleNotification = async (article, reporter) => {
  try {
    const {
      EMAIL_USER,
      EMAIL_PASSWORD,
      EMAIL_HOST,
      EMAIL_PORT,
      EMAIL_SECURE,
      EMAIL_FROM,
      EMAIL_RECIPIENT,
      SITE_URL,
      EMAIL_ALLOW_SELF_SIGNED,
      NODE_ENV,
    } = process.env;

    const isProd = NODE_ENV === "production";

    // Basic config validation
    if (!EMAIL_USER || !EMAIL_PASSWORD) {
      console.log("[EMAIL] Skipping notification - email credentials missing");
      return null;
    }

    if (!EMAIL_RECIPIENT) {
      console.log("[EMAIL] Skipping notification - no recipient configured");
      return null;
    }

    if (!SITE_URL && isProd) {
      console.warn("[EMAIL] Warning: SITE_URL is not defined in production");
    }

    // Conditionally add TLS settings for dev
    const tlsOptions =
      EMAIL_ALLOW_SELF_SIGNED === "true" && !isProd
        ? { rejectUnauthorized: false }
        : undefined;

    // Configure transporter
    const transporter = nodemailer.createTransport(
      {
        host: EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(EMAIL_PORT || "587", 10),
        secure: EMAIL_SECURE === "true", // true for port 465
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASSWORD,
        },
        ...(tlsOptions ? { tls: tlsOptions } : {}),
      },
      {
        logger: !isProd,
        debug: !isProd,
      }
    );

    const baseUrl =
      SITE_URL ||
      (!isProd ? "http://localhost:3000" : "https://solounderground.com");

    const mailOptions = {
      from: EMAIL_FROM || `"Solo Underground" <${EMAIL_USER}>`,
      to: EMAIL_RECIPIENT,
      subject: `New Article Draft: "${article.title}"`,
      html: `
        <h2>New Article Draft by ${reporter.name}</h2>
        <p><strong>Title:</strong> ${article.title}</p>
        <p><strong>Summary:</strong> ${
          article.summary || "No summary available"
        }</p>
        <p><strong>Category:</strong> ${article.category || "Uncategorized"}</p>
        <p><strong>Topic:</strong> ${article.topic || "General"}</p>
        <hr>
        <p>To review and publish this article, <a href="${baseUrl}/admin/edit/${
        article._id
      }">click here</a>.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("[EMAIL] Notification sent, ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("[EMAIL] Error sending notification:", error.message);

    // Fallback logging
    try {
      const logsDir = path.join(__dirname, "../logs");
      const fallbackLogPath = path.join(logsDir, "email-failures.log");

      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      const logEntry = `[${new Date().toISOString()}] Failed to send email for article "${
        article?.title
      }" by ${reporter?.name} - ${error.message}\n`;

      fs.appendFileSync(fallbackLogPath, logEntry);
      console.log(`[EMAIL] Logged failure to ${fallbackLogPath}`);
    } catch (logErr) {
      console.error("[EMAIL] Failed to write to fallback log:", logErr.message);
    }

    return null;
  }
};

module.exports = { sendArticleNotification };
