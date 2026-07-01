import mongoose from "mongoose";

const reportSchema = mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "reviewed", "dismissed"],
      default: "pending",
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    adminNote: { type: String },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Report", reportSchema);
