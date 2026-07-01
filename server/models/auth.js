import mongoose from "mongoose";

const userschema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  about: { type: String },
  tags: { type: [String] },
  joinDate: { type: Date, default: Date.now },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  isSuspended: { type: Boolean, default: false },
  suspendedUntil: { type: Date },
  violationCount: { type: Number, default: 0 },
});
export default mongoose.model("user", userschema);
