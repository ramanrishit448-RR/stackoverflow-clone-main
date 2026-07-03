import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to log and write mock notifications to files
const saveMockNotification = (type, recipient, content) => {
  try {
    const dir = path.join(__dirname, "../sent_notifications");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${type}_${recipient.replace(/[@+]/g, "_")}_${timestamp}.txt`;
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, content, "utf8");
    console.log(`[DELIVERY SIMULATION] Saved ${type} to ${filepath}`);
  } catch (err) {
    console.error(`[DELIVERY SIMULATION] Failed to save mock notification file:`, err);
  }
};

export const sendEmail = async ({ to, subject, html, text }) => {
  console.log(`[Email Delivery] Attempting to send email to ${to}...`);

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  const bodyContent = text || html;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT) || 587,
        secure: parseInt(SMTP_PORT) === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: SMTP_FROM || SMTP_USER,
        to,
        subject,
        text,
        html,
      });

      console.log(`[Email Delivery] Email sent successfully: ${info.messageId}`);
      saveMockNotification("email", to, `Subject: ${subject}\n\n${bodyContent}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`[Email Delivery] Failed to send actual email via SMTP:`, error);
      // Fallback to simulation
    }
  }

  // Fallback / Simulation Mode
  console.log("\n=========================================");
  console.log(`SIMULATED EMAIL SENT TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`CONTENT:\n${bodyContent}`);
  console.log("=========================================\n");

  saveMockNotification("email", to, `Subject: ${subject}\n\n${bodyContent}`);
  return { success: true, simulated: true };
};

export const sendSMS = async ({ to, body }) => {
  console.log(`[SMS Delivery] Attempting to send SMS to ${to}...`);

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;

  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER) {
    try {
      // Dynamically load twilio package to prevent errors if not installed
      const twilio = (await import("twilio")).default;
      const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

      const message = await client.messages.create({
        body,
        from: TWILIO_FROM_NUMBER,
        to,
      });

      console.log(`[SMS Delivery] SMS sent successfully: ${message.sid}`);
      saveMockNotification("sms", to, body);
      return { success: true, messageId: message.sid };
    } catch (error) {
      console.error(`[SMS Delivery] Failed to send actual SMS via Twilio:`, error);
      // Fallback to simulation
    }
  }

  // Fallback / Simulation Mode
  console.log("\n=========================================");
  console.log(`SIMULATED SMS SENT TO: ${to}`);
  console.log(`CONTENT: ${body}`);
  console.log("=========================================\n");

  saveMockNotification("sms", to, body);
  return { success: true, simulated: true };
};
