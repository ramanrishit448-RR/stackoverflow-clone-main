import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  token: { type: String, required: true },
  browser: { type: String, required: true },
  os: { type: String, required: true },
  deviceType: { type: String, required: true },
  ip: { type: String, required: true },
  location: { type: String, default: "Unknown" },
  deviceId: { type: String, required: true },
  isTrusted: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  verificationOTP: { type: String },
  verificationOTPExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
});

export default mongoose.model("session", sessionSchema);
