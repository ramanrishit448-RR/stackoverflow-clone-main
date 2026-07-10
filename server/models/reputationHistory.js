import mongoose from "mongoose";

const reputationHistorySchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  change: { type: Number, required: true },
  reason: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "answer_posted",
      "answer_accepted",
      "answer_unaccepted",
      "answer_5_upvotes",
      "question_10_upvotes",
      "profile_completed",
      "downvote_received",
      "downvote_removed",
      "answer_deleted",
      "admin_removal",
      "transfer_sent",
      "transfer_received"
    ],
    required: true
  },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("ReputationHistory", reputationHistorySchema);
