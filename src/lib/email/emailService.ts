import nodemailer from "nodemailer";
import {
  getWelcomeEmailHTML,
  getWelcomeEmailText,
  EmailTemplateData,
} from "./templates";

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail", // Use 'gmail' service instead of host: "gmail"
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASSWORD, // Your Gmail App Password (not regular password)
    },
    // Optional: Add these for better reliability
    pool: true,
    maxConnections: 1,
    rateDelta: 20000,
    rateLimit: 5,
  });
};

export async function sendWelcomeEmail(
  data: EmailTemplateData
): Promise<boolean> {
  try {
    const transporter = createTransporter();

    // Verify connection configuration
    await transporter.verify();
    console.log("SMTP connection verified successfully");

    const mailOptions = {
      from: {
        name: "CONCES Rebrand Challenge",
        address:
          process.env.EMAIL_USER ||
          process.env.SMTP_FROM ||
          "noreply@conces.org",
      },
      to: data.email,
      subject: "🎉 You're in! Here's your CONCES Rebrand Challenge Pack",
      text: getWelcomeEmailText(data),
      html: getWelcomeEmailHTML(data),
      // attachments: [
      //   {
      //     filename: "CONCES_Contest_Pack.pdf",
      //     path: "./public/contest-pack.pdf", // Make sure to add this file
      //     contentType: "application/pdf",
      //   },
      // ],
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", info.messageId);

    // For development with Gmail, you won't get a preview URL like Ethereal
    if (process.env.NODE_ENV !== "production") {
      console.log("Gmail email sent. Check the recipient inbox.");
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return false;
  }
}

// Additional email templates with improved error handling
export async function sendReminderEmail(
  email: string,
  fullName: string,
  daysLeft: number
): Promise<boolean> {
  try {
    const transporter = createTransporter();

    // Verify connection
    await transporter.verify();

    const mailOptions = {
      from: {
        name: "CONCES Rebrand Challenge",
        address:
          process.env.EMAIL_USER ||
          process.env.SMTP_FROM ||
          "noreply@conces.org",
      },
      to: email,
      subject: `⏰ ${daysLeft} days left to submit your design!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #002B5B;">Hi ${fullName},</h2>
          <p>Just a friendly reminder that you have <strong>${daysLeft} days</strong> left to submit your design for the CONCES Logo Rebrand Challenge!</p>
          <p>Don't miss your chance to win ₦400,000!</p>
          <a href="https://brandchallenge.conces.org/submit" style="display: inline-block; background-color: #00B894; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Submit Your Design</a>
        </div>
      `,
      text: `Hi ${fullName}, Just a reminder that you have ${daysLeft} days left to submit your design for the CONCES Logo Rebrand Challenge!`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Reminder email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending reminder email:", error);
    return false;
  }
}

// Test email function for debugging
export async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email connection test successful");
    return true;
  } catch (error) {
    console.error("❌ Email connection test failed:", error);
    return false;
  }
}
