import mongoose from "mongoose";

const reputationTransferSchema = mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("ReputationTransfer", reputationTransferSchema);
