// server/utils/emailService.js
const nodemailer = require("nodemailer");

// Function to send article notifications
const sendArticleNotification = async (article, reporter) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log("[EMAIL] Skipping email notification - email not configured");
      return null;
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Check if recipient is configured
    const recipient = process.env.EMAIL_RECIPIENT;
    if (!recipient) {
      console.log(
        "[EMAIL] Skipping email notification - no recipient configured"
      );
      return null;
    }

    // Create email content
    const mailOptions = {
      from:
        process.env.EMAIL_FROM ||
        `"Solo Underground" <${process.env.EMAIL_USER}>`,
      to: recipient,
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
        <p>To review and publish this article, <a href="${
          process.env.SITE_URL || "http://localhost:3000"
        }/admin/edit/${article._id}">click here</a>.</p>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("[EMAIL] Notification sent, ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("[EMAIL] Error sending notification:", error.message);
    // Don't throw - this should not stop the article creation process
    return null;
  }
};

module.exports = { sendArticleNotification };
