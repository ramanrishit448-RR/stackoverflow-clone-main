import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js";
import questionroute from "./routes/question.js";
import answerroutes from "./routes/answer.js";
import feedroutes from "./routes/feed.js";
import followroutes from "./routes/follow.js";
import notificationroutes from "./routes/notification.js";
import adminroutes from "./routes/admin.js";
import paymentroutes from "./routes/payment.js";
import articleRoute from "./routes/article.js";
import teamRoute from "./routes/team.js";
import collectiveRoute from "./routes/collective.js";
import companyRoute from "./routes/company.js";

const app = express();
dotenv.config();

const allowAllOrigins = process.env.ALLOW_ALL_CORS === "true";
const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  process.env.CORS_ORIGIN ||
  process.env.FRONTEND_URL ||
  ""
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowAllOrigins) return true;
  return (
    allowedOrigins.some(
      (allowedOrigin) => allowedOrigin === origin || allowedOrigin === "*",
    ) ||
    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    origin.includes("vercel.app") ||
    origin.includes("netlify.app") ||
    origin.includes("pages.dev")
  );
};

app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(
  cors({
    origin: function (origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// Middleware to ensure Database connection on serverless requests
let isConnected = false;
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }
  const databaseurl = process.env.MONGODB_URL;
  if (!databaseurl) {
    console.error("MONGODB_URL is missing from environment variables!");
    return;
  }
  try {
    await mongoose.connect(databaseurl);
    isConnected = true;
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.get("/", (req, res) => {
  res.json({
    status: "✅ Backend is running",
    message: "Stackoverflow clone API",
  });
});

app.get("/api-health", (req, res) => {
  res.send("Stackoverflow clone is running perfect");
});

app.use("/user", userroutes);
app.use("/question", questionroute);
app.use("/answer", answerroutes);
app.use("/feed", feedroutes);
app.use("/follow", followroutes);
app.use("/notifications", notificationroutes);
app.use("/admin", adminroutes);
app.use("/payment", paymentroutes);
app.use("/articles", articleRoute);
app.use("/teams", teamRoute);
app.use("/collectives", collectiveRoute);
app.use("/companies", companyRoute);

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  });
}

export default app;
