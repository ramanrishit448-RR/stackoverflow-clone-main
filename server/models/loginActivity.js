import mongoose from "mongoose";

const loginActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  email: { type: String, required: true },
  browser: { type: String, required: true },
  os: { type: String, required: true },
  deviceType: { type: String, required: true },
  ip: { type: String, required: true },
  location: { type: String, default: "Unknown" },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["success", "failed_password", "pending_otp", "otp_failed", "revoked"],
    required: true,
  },
});

export default mongoose.model("loginactivity", loginActivitySchema);
