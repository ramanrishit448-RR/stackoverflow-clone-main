import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js"
import questionroute from "./routes/question.js"
import answerroutes from "./routes/answer.js"
import feedroutes from "./routes/feed.js"
import followroutes from "./routes/follow.js"
import notificationroutes from "./routes/notification.js"
import adminroutes from "./routes/admin.js"
import paymentroutes from "./routes/payment.js"
import articleRoute from "./routes/article.js"
import teamRoute from "./routes/team.js"
import collectiveRoute from "./routes/collective.js"
import companyRoute from "./routes/company.js"
const app = express();
dotenv.config();
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.get("/", (req, res) => {
  res.send("Stackoverflow clone is running perfect");
});
app.use('/user',userroutes)
app.use('/question',questionroute)
app.use('/answer',answerroutes)
app.use('/feed', feedroutes)
app.use('/follow', followroutes)
app.use('/notifications', notificationroutes)
app.use('/admin', adminroutes)
app.use('/payment', paymentroutes)
app.use('/articles', articleRoute)
app.use('/teams', teamRoute)
app.use('/collectives', collectiveRoute)
app.use('/companies', companyRoute)
const PORT = process.env.PORT || 5000;
const databaseurl = process.env.MONGODB_URL;

mongoose
  .connect(databaseurl)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
