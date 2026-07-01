import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    actorName: { type: String, required: true },
    type: {
      type: String,
      enum: ["like", "comment", "reply", "mention", "follow"],
      required: true,
    },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    commentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, read: 1 });

export default mongoose.model("Notification", notificationSchema);
